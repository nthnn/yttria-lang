import {
    Constant,
    ConstantFP,
    ConstantInt,
    IRBuilder,
    Module,
    Type,
    Value
} from "llvm-bindings";

import { ASTResolveResults, ExpressionAST } from "./ast";
import { DataType, LLVMDataType } from "./data_type";
import { Token } from "./token";

import ASTError from "./ast_exception";
import YttriaUtil from "./util";
import YttriaRuntime from "./yttria_runtime";
import LLVMGlobalContext from "./llvm_context";

class ExprASTBool implements ExpressionAST {
    private value: boolean;
    public mark: Token;

    public constructor(
        mark: Token,
        value: boolean
    ) {
        this.mark = mark;
        this.value = value;
    }

    public visit(
        builder: IRBuilder,
        module: Module
    ): Constant {

        return ConstantInt.get(
            Type.getIntNTy(LLVMGlobalContext, 1),
            this.value ? 1 : 0,
            true
        );
    }

    public type(): DataType {
        return DataType.BOOL;
    }

    public resolve(
        results: ASTResolveResults
    ): void { }

    public marker(): Token {
        return this.mark;
    }
}

class ExprASTString implements ExpressionAST {
    private value: string;
    private mark: Token;

    public constructor(
        mark: Token,
        value: string
    ) {
        this.mark = mark;
        this.value = value;
    }

    public visit(
        builder: IRBuilder,
        module: Module
    ): Constant {

        return builder.CreateGlobalStringPtr(
            this.value,
            YttriaUtil.generateHash(this.value),
            0, module
        );
    }

    public type(): DataType {
        return DataType.STRING;
    }

    public resolve(
        results: ASTResolveResults
    ): void { }

    public marker(): Token {
        return this.mark;
    }
}

class ExprASTInt implements ExpressionAST {
    private value: BigInt;
    private bit: number;
    private mark: Token;

    public constructor(
        mark: Token,
        value: BigInt,
        bit: number
    ) {
        this.mark = mark;
        this.value = value;
        this.bit = bit;
    }
    
    public visit(
        builder: IRBuilder,
        module: Module
    ): Constant {

        return ConstantInt.get(
            LLVMDataType.getIntType(this.bit),
            Number(this.value),
            true
        );
    }

    public type(): DataType {
        return LLVMDataType.getIntDataType(this.bit);
    }

    private minMaxFlow(
        min: BigInt,
        max: BigInt,
        type: string,
        results: ASTResolveResults
    ): void {

        if(this.value < min)
            results.errors.set(
                this.marker(),
                'Underflow value for ' + type +
                ' type: ' + this.value.toString()
            );
        else if(this.value > max)
            results.errors.set(
                this.marker(),
                'Overflow value for ' + type +
                ' type: ' + this.value.toString()
            );
    }

    public resolve(results: ASTResolveResults): void {
        switch(this.bit) {
            case 4:
                this.minMaxFlow(
                    BigInt('-8'), BigInt('7'), 'i4',
                    results
                );
                break;

            case 8:
                this.minMaxFlow(
                    BigInt('0'), BigInt('255'), 'i8',
                    results
                );
                break;

            case 16:
                this.minMaxFlow(
                    BigInt('-32768'),
                    BigInt('32767'),
                    'i16',
                    results
                );
                break;

            case 32:
                this.minMaxFlow(
                    BigInt('-2147483648'),
                    BigInt('2147483647'),
                    'i32',
                    results
                );
                break;

            case 64:
                this.minMaxFlow(
                    BigInt('-9223372036854775808'),
                    BigInt('9223372036854775807'),
                    'i64',
                    results
                );
                break;
        }
    }

    public marker(): Token {
        return this.mark;
    }
}

class ExprASTFloat implements ExpressionAST {
    private value: number;
    private bit: number;
    private mark: Token;

    public constructor(
        mark: Token,
        value: number,
        bit: number
    ) {
        this.mark = mark;
        this.value = value;
        this.bit = bit;
    }

    public visit(
        builder: IRBuilder,
        module: Module
    ): Constant {

        return ConstantFP.get(
            this.type().getLLVMType(),
            this.value
        );
    }

    public type(): DataType {
        return LLVMDataType.getFloatDataType(this.bit);
    }

    public resolve(): void { }

    public marker(): Token {
        return this.mark;
    }
}

class ExprASTUnary implements ExpressionAST {
    private operator: string;
    private expr: ExpressionAST;
    private mark: Token;

    public constructor(
        mark: Token,
        operator:
        string, expr: ExpressionAST
    ) {
        this.mark = mark;
        this.operator = operator;
        this.expr = expr;
    }

    public visit(
        builder: IRBuilder,
        module: Module
    ): Constant {

        const visited: Constant =
            this.expr.visit(builder, module);

        if(this.operator == '-') {
            if(DataType.isOfFloatType(this.type()))
                return builder.CreateFNeg(
                    visited,
                    YttriaUtil.generateRandomHash()
                ) as Constant;
            else return builder.CreateNeg(
                visited,
                YttriaUtil.generateRandomHash()
            ) as Constant;
        }
        else if(this.operator == '+') {
            const type: DataType = this.type();

            if(DataType.isOfIntType(type))
                return builder.CreateCall(
                    YttriaRuntime.iabs(module, type.getLLVMType()),
                    [visited],
                    YttriaUtil.generateRandomHash()
                ) as unknown as Constant;
            else if(DataType.isOfFloatType(type))
                return builder.CreateCall(
                    YttriaRuntime.fpabs(module, type),
                    [visited],
                    YttriaUtil.generateRandomHash()
                ) as unknown as Constant;
        }
        else if(this.operator == '~')
            return builder.CreateNot(
                visited,
                YttriaUtil.generateRandomHash()
            ) as Constant;
        else if(this.operator == '!')
            return builder.CreateNot(visited) as Constant;

        throw new ASTError('Invalid operator for unary AST.');
    }

    public type(): DataType {
        return this.expr.type();
    }

    public resolve(results: ASTResolveResults): void {
        const dataType: DataType = this.expr.type();
        const mrk: Token = this.marker();

        if(this.operator == '~' &&
            DataType.isOfFloatType(dataType))
            results.errors.set(
                mrk,
                'Incompatible unary ~ operator ' +
                'for floating-point type'
            );
        else if((this.operator == '+' ||
            this.operator == '-') && (
            !DataType.isOfFloatType(dataType) &&
            !DataType.isOfIntType(dataType)))
            results.errors.set(
                mrk,
                'Unary operator ' + this.operator +
                ' cannot be used on non-number expressions.'
            )
        else if(this.operator == '!' &&
            dataType != DataType.BOOL)
            results.errors.set(
                mrk,
                'Unary ! operator can be only used ' +
                'on boolean expressions.'
            );
    }

    public marker(): Token {
        return this.mark;
    }
}

class ExprASTEquality implements ExpressionAST {
    private mark: Token;
    private operator: string;
    private left: ExpressionAST;
    private right: ExpressionAST;
    
    public constructor(
        mark: Token,
        operator: string,
        left: ExpressionAST,
        right: ExpressionAST
    ) {
        this.mark = mark;
        this.operator = operator;
        this.left = left;
        this.right = right;
    }

    public visit(
        builder: IRBuilder,
        module: Module
    ): Constant {
        type ASTEqInstruction = (
            lhs: Value,
            rhs: Value,
            name?: string
        ) => Value;

        let funcBuilder: Array<ASTEqInstruction> = [
            builder.CreateICmpEQ.bind(builder),
            builder.CreateICmpNE.bind(builder),
            builder.CreateFCmpOEQ.bind(builder),
            builder.CreateFCmpONE.bind(builder)
        ];
        let funcAddr: number = 0;

        const leftType: DataType =
            this.left.type();
        const rightType: DataType =
            this.right.type();

        const leftExpr: Constant =
            this.left.visit(builder, module);
        let rightExpr: Constant =
            this.right.visit(builder, module);

        if(DataType.isOfFloatType(leftType) &&
            DataType.isOfFloatType(rightType))
            funcAddr = (this.operator == '==' ? 2 : 3);
        else if(DataType.isOfIntType(leftType) &&
            DataType.isOfIntType(rightType))
            funcAddr = (this.operator == '==' ? 0 : 1);
        else if(DataType.isOfFloatType(leftType) &&
            DataType.isOfIntType(rightType)) {

            funcAddr = (this.operator == '==' ? 2 : 3);
            rightExpr = builder.CreateIntCast(
                rightExpr,
                leftType.getLLVMType(),
                true
            ) as Constant;
        }
        else if(DataType.isOfIntType(leftType) &&
            DataType.isOfFloatType(rightType)) {

            funcAddr = (this.operator == '==' ? 0 : 1);
            rightExpr = builder.CreateFPCast(
                rightExpr,
                rightType.getLLVMType()
            ) as Constant;
        }
        else if((leftType == DataType.BOOL &&
            rightType == DataType.BOOL) &&
            (leftType == DataType.STRING &&
                rightType == DataType.STRING))
            funcAddr = (this.operator == '==' ? 0 : 1);

        return funcBuilder[funcAddr](
            leftExpr,
            rightExpr
        ) as Constant;
    }

    public type(): DataType {
        return DataType.BOOL;
    }

    public resolve(results: ASTResolveResults): void {
        const leftType: DataType =
            this.left.type();
        const rightType: DataType =
            this.right.type();

        if(DataType.isOfFloatType(leftType) &&
            DataType.isOfIntType(rightType))
            results.warnings.set(
                this.mark,
                'Lose conversion from ' + leftType.toString() +
                ' to ' + rightType.toString() + '.'
            );
        else if(DataType.isOfFloatType(leftType) &&
            !DataType.isOfFloatType(rightType))
            results.errors.set(
                this.mark,
                'Type ' + leftType.toString() +
                ' cannot be compared to type of ' +
                rightType.toString() + '.'
            );
        else if(DataType.isOfIntType(leftType) &&
            DataType.isOfFloatType(rightType))
            results.warnings.set(
                this.mark,
                'Lose conversion from ' + leftType.toString +
                ' to ' + rightType.toString() + '.'
            );
        else if(DataType.isOfIntType(leftType) &&
            DataType.isOfIntType(rightType))
            results.errors.set(
                this.mark,
                'Type ' + leftType.toString() +
                ' cannot be compared to ' +
                rightType.toString() + '.'
            );
        else if(leftType == DataType.STRING &&
            rightType != DataType.STRING)
            results.errors.set(
                this.mark,
                'Comparing string to ' + rightType.toString() +
                ' is not allowed.'
            );
        else if(leftType == DataType.BOOL &&
            rightType != DataType.BOOL)
            results.errors.set(
                this.mark,
                'Comparing bool to ' + rightType.toString() +
                ' is not allowed.'
            );

        this.left.resolve(results);
        this.right.resolve(results);
    }

    public marker(): Token {
        return this.mark;
    }
}

class ExprASTBinary implements ExpressionAST {
    private mark: Token;
    private operator: string;
    private left: ExpressionAST;
    private right: ExpressionAST;

    public constructor(
        mark: Token,
        operator: string,
        left: ExpressionAST,
        right: ExpressionAST
    ) {
        this.mark = mark;
        this.operator = operator;
        this.left = left;
        this.right = right;
    }

    public visit(
        builder: IRBuilder,
        module: Module
    ): Constant {
        const leftExpr: Constant =
            this.left.visit(builder, module);
        const rightExpr: Constant =
            this.right.visit(builder, module);
        const outType: Type =
            DataType.greaterIntegerType(
                this.left.type(),
                this.right.type()
            ).getLLVMType();

        if(this.operator == '|')
            return builder.CreateIntCast(
                builder.CreateOr(
                    leftExpr,
                    rightExpr
                ),
                outType,
                true
            ) as Constant;
        else if(this.operator == '&')
            return builder.CreateIntCast(
                builder.CreateAnd(
                    leftExpr,
                    rightExpr
                ),
                outType,
                true
            ) as Constant;

        throw new ASTError('Invalid binary operator.');
    }

    public type(): DataType {
        return DataType.greaterIntegerType(
            this. left.type(),
            this.right.type()
        );
    }

    public resolve(
        results: ASTResolveResults
    ): void {
        if(!DataType.isOfIntType(this.left.type()))
            results.errors.set(
                this.left.marker(),
                'Left-hand of binary operation' +
                ' is not of integer type.'
            );

        if(!DataType.isOfIntType(this.right.type()))
            results.errors.set(
                this.right.marker(),
                'Right-hand of binary operation' +
                ' is not of integer type.'
            );


        this.left.resolve(results);
        this.right.resolve(results);
    }

    public marker(): Token {
        return this.mark;
    }
}

export {
    ExprASTBool,
    ExprASTBinary,
    ExprASTEquality,
    ExprASTString,
    ExprASTInt,
    ExprASTFloat,
    ExprASTUnary
};