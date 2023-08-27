import {
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
    ): Value {

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
        results: ASTResolveResults,
        returnType: DataType,
        unsafe: boolean
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
    ): Value {

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
        results: ASTResolveResults,
        returnType: DataType,
        unsafe: boolean
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
    ): Value {

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

    public resolve(
        results: ASTResolveResults,
        returnType: DataType,
        unsafe: boolean
    ): void {
        if(unsafe)
            return;

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
    ): Value {

        return ConstantFP.get(
            this.type().getLLVMType(),
            this.value
        );
    }

    public type(): DataType {
        return LLVMDataType.getFloatDataType(this.bit);
    }

    public resolve(
        results: ASTResolveResults,
        returnType: DataType,
        unsafe: boolean
    ): void { }

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
    ): Value {

        const visited: Value =
            this.expr.visit(builder, module);

        if(this.operator == '-') {
            if(DataType.isOfFloatType(this.type()))
                return builder.CreateFNeg(
                    visited,
                    YttriaUtil.generateRandomHash()
                );
            else if(this.type() == DataType.BOOL)
                return builder.CreateIntCast(
                    builder.CreateNeg(
                        visited,
                        YttriaUtil.generateRandomHash()
                    ),
                    Type.getIntNTy(LLVMGlobalContext, 4),
                    true
                );
            else return builder.CreateNeg(
                visited,
                YttriaUtil.generateRandomHash()
            );
        }
        else if(this.operator == '+') {
            const type: DataType = this.type();

            if(DataType.isOfIntType(type))
                return builder.CreateCall(
                    YttriaRuntime.iabs(module, type.getLLVMType()),
                    [visited],
                    YttriaUtil.generateRandomHash()
                );
            else if(DataType.isOfFloatType(type))
                return builder.CreateCall(
                    YttriaRuntime.fpabs(module, type),
                    [visited],
                    YttriaUtil.generateRandomHash()
                );
            else if(type == DataType.BOOL)
                return builder.CreateCall(
                    YttriaRuntime.iabs(
                        module,
                        type.getLLVMType()
                    ),
                    [visited],
                    YttriaUtil.generateRandomHash()
                );
        }
        else if(this.operator == '~')
            return builder.CreateNot(
                visited,
                YttriaUtil.generateRandomHash()
            );
        else if(this.operator == '!')
            return builder.CreateNot(visited);

        throw new ASTError('Invalid operator for unary AST.');
    }

    public type(): DataType {
        return this.expr.type();
    }

    public resolve(
        results: ASTResolveResults,
        returnType: DataType,
        unsafe: boolean
    ): void {
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
            dataType != DataType.BOOL && !unsafe)
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
    ): Value {
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

        const leftExpr: Value =
            this.left.visit(builder, module);
        let rightExpr: Value =
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
            );
        }
        else if(DataType.isOfIntType(leftType) &&
            DataType.isOfFloatType(rightType)) {

            funcAddr = (this.operator == '==' ? 0 : 1);
            rightExpr = builder.CreateFPCast(
                rightExpr,
                rightType.getLLVMType()
            );
        }
        else if((leftType == DataType.BOOL &&
            rightType == DataType.BOOL) &&
            (leftType == DataType.STRING &&
                rightType == DataType.STRING))
            funcAddr = (this.operator == '==' ? 0 : 1);

        return funcBuilder[funcAddr](
            leftExpr,
            rightExpr
        );
    }

    public type(): DataType {
        return DataType.BOOL;
    }

    public resolve(
        results: ASTResolveResults,
        returnType: DataType,
        unsafe: boolean
    ): void {
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
            !DataType.isOfIntType(rightType))
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
            (rightType != DataType.BOOL ||
                (DataType.isOfIntType(rightType) && unsafe)))
            results.errors.set(
                this.mark,
                'Comparing bool to ' + rightType.toString() +
                ' is not allowed.'
            );

        this.left.resolve(results, returnType, unsafe);
        this.right.resolve(results, returnType, unsafe);
    }

    public marker(): Token {
        return this.mark;
    }
}

class ExprASTAndOr implements ExpressionAST {
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
    ): Value {
        const leftExpr: Value =
            this.left.visit(builder, module);
        const rightExpr: Value =
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
            );
        else if(this.operator == '||')
            return builder.CreateOr(
                leftExpr,
                rightExpr
            );
        else if(this.operator == '&')
            return builder.CreateIntCast(
                builder.CreateAnd(
                    leftExpr,
                    rightExpr
                ),
                outType,
                true
            );
        else if(this.operator == '&&')
            return builder.CreateAnd(
                leftExpr,
                rightExpr
            );

        throw new ASTError('Invalid binary operator.');
    }

    public type(): DataType {
        if(this.operator == '|' ||
            this.operator == '&')
            return DataType.greaterIntegerType(
                this. left.type(),
                this.right.type()
            );
        else if(this.operator == '||' ||
            this.operator == '&&')
            return DataType.BOOL;

        throw new ASTError('Invalid operator for' +
            ' binary/logical expression');
    }

    public resolve(
        results: ASTResolveResults,
        returnType: DataType,
        unsafe: boolean
    ): void {
        const leftType: DataType =
            this.left.type();
        const rightType: DataType =
            this.right.type();
        const leftMarker: Token =
            this.left.marker();
        const rightMarker: Token =
            this.right.marker();

        if(this.operator == '|' ||
            this.operator == '&') {
            if(!DataType.isOfIntType(leftType))
                results.errors.set(
                    leftMarker,
                    'Left-hand of binary operation' +
                    ' is not of integer type.'
                );

            if(!DataType.isOfIntType(rightType))
                results.errors.set(
                    rightMarker,
                    'Right-hand of binary operation' +
                    ' is not of integer type.'
                );
        }
        else if(this.operator == '&&' ||
            this.operator == '||') {
            if(unsafe &&
                (DataType.isOfIntType(leftType) &&
                    !DataType.isOfIntType(rightType))) {

                results.errors.set(
                    this.mark,
                    'Type of ' + leftType.toString +
                    ' cannot be used with \'' + this.operator +
                    '\' operator to type of ' +
                    rightType.toString()
                );
                return;
            }

            if(leftType != DataType.BOOL)
                results.errors.set(
                    leftMarker,
                    'Left-hand expression' +
                    ' is not of bool type.'
                );
            if(rightType != DataType.BOOL)
                results.errors.set(
                    rightMarker,
                    'Right-hand expression' +
                    ' is not of bool type.'
                );

        }

        this.left.resolve(results, returnType, unsafe);
        this.right.resolve(results, returnType, unsafe);
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
    ): Value {
        throw new ASTError('Invalid operation.');
    }

    public type(): DataType {
        const a: DataType = this.left.type();
        const b: DataType = this.right.type();

        if(this.operator == '+' ||
            this.operator == '-') {
            if(DataType.isOfIntType(a) &&
                DataType.isOfIntType(b))
                return DataType.greaterIntegerType(a, b);
            else if(DataType.isOfFloatType(a) &&
                DataType.isOfFloatType(b))
                return DataType.greaterFloatType(a, b);
            else if(this.operator == '+' && (
                (a == DataType.STRING &&
                b == DataType.STRING) ||
                (a == DataType.STRING &&
                DataType.isOfIntType(b)) ||
                (DataType.isOfIntType(a) &&
                b == DataType.STRING)))
                return DataType.STRING;
        }
        else if(this.operator == '*') {
            if(a == DataType.STRING &&
                DataType.isOfIntType(b))
                return DataType.STRING;
            else if(DataType.isOfIntType(a) &&
                DataType.isOfIntType(b))
                return DataType.greaterIntegerType(a, b);
            else if(DataType.isOfFloatType(a) &&
                DataType.isOfFloatType(b))
                return DataType.greaterFloatType(a, b);
        }

        return DataType.UNKNOWN;
    }

    private resolveAdd(
        leftType: DataType,
        rightType: DataType,
        results: ASTResolveResults,
        unsafe: boolean
    ): void {
        if(DataType.isOfIntType(leftType) &&
            DataType.isOfIntType(rightType) &&
            leftType != rightType &&
            !unsafe)
            results.warnings.set(
                this.marker(),
                'Loose integer binary addition ' +
                'operation with ' + leftType.toString() +
                ' and ' + rightType.toString() + '.'
            );
        else if(DataType.isOfFloatType(leftType) &&
            DataType.isOfFloatType(rightType) &&
            leftType != rightType &&
            !unsafe)
            results.warnings.set(
                this.marker(),
                'Loose floating-point binary addition ' +
                'operation with ' + leftType.toString() +
                ' and ' + rightType.toString() + '.'
            );
        else if(DataType.isOfIntType(leftType) &&
            DataType.isOfFloatType(rightType) &&
            !unsafe)
            results.warnings.set(
                this.marker(),
                'Loose operation with \'+\' on type' +
                leftType.toString() + ' and ' +
                rightType.toString()
            );
        else if(DataType.isOfFloatType(leftType) &&
            DataType.isOfIntType(rightType) &&
            !unsafe)
            results.warnings.set(
                this.marker(),
                'Loose operation with \'+\' on type' +
                leftType.toString() + ' and ' +
                rightType.toString()
            );
        else if((!DataType.isOfIntType(leftType) &&
            !DataType.isOfFloatType(leftType) &&
            leftType != DataType.STRING) ||
            ((!DataType.isOfIntType(rightType) &&
            !DataType.isOfFloatType(rightType) &&
            rightType != DataType.STRING)))
            results.errors.set(
                this.marker(),
                'Operator \'+\' cannot be used ' +
                'with type of ' + leftType.toString() +
                'and type of ' + rightType.toString() + '.'
            );
    }

    private resolveOperation(
        leftType: DataType,
        rightType: DataType,
        results: ASTResolveResults,
        unsafe: boolean
    ): void {
        if(DataType.isOfIntType(leftType) &&
            DataType.isOfIntType(rightType) &&
            leftType != rightType &&
            !unsafe)
            results.warnings.set(
                this.marker(),
                'Loose integer binary \'' + this.operator +
                '\' operation with ' + leftType.toString() +
                ' and ' + rightType.toString() + '.'
            );
        else if(DataType.isOfFloatType(leftType) &&
            DataType.isOfFloatType(rightType) &&
            leftType != rightType &&
            !unsafe)
            results.warnings.set(
                this.marker(),
                'Loose floating-point binary \'' +
                this.operator + '\' operation with ' +
                leftType.toString() + ' and ' +
                rightType.toString() + '.'
            );
        else if(DataType.isOfIntType(leftType) &&
            DataType.isOfFloatType(rightType) &&
            !unsafe)
            results.warnings.set(
                this.marker(),
                'Loose operation with \'' + this.operator +
                '\' on type' + leftType.toString() +
                ' and ' + rightType.toString()
            );
        else if(DataType.isOfFloatType(leftType) &&
            DataType.isOfIntType(rightType) &&
            !unsafe)
            results.warnings.set(
                this.marker(),
                'Loose operation with \'' + this.operator +
                '\' on type' + leftType.toString() +
                ' and ' + rightType.toString() + '.'
            );
        else if((!DataType.isOfIntType(leftType) &&
            !DataType.isOfFloatType(leftType)) ||
            ((!DataType.isOfIntType(rightType) &&
            !DataType.isOfFloatType(rightType))))
            results.errors.set(
                this.marker(),
                'Operator \'' + this.operator +
                '\' cannot be used with type of ' +
                leftType.toString() + 'and type of ' +
                rightType.toString() + '.'
        );
    }

    public resolveExpressions(
        results: ASTResolveResults,
        returnType: DataType,
        unsafe: boolean
    ): void {
        this.left.resolve(
            results,
            returnType,
            unsafe
        );

        this.right.resolve(
            results,
            returnType,
            unsafe
        );
    }

    public resolve(
        results: ASTResolveResults,
        returnType: DataType,
        unsafe: boolean
    ): void {
        const leftType: DataType =
            this.left.type();
        const rightType: DataType =
            this.right.type();

        if(this.operator == '+')
            this.resolveAdd(
                leftType,
                rightType,
                results,
                unsafe
            );
        else if(this.operator == '-' ||
            this.operator == '/' ||
            this.operator == '*' ||
            this.operator == '%')
            this.resolveOperation(
                leftType,
                rightType,
                results,
                unsafe
            );
        else if(this.operator == '^' &&
            !DataType.isOfIntType(leftType) &&
            !DataType.isOfIntType(rightType) &&
            !unsafe)
            results.warnings.set(
                this.marker(),
                'Invalid \'^\' operation with ' +
                leftType.toString() + ' and ' +
                rightType.toString()
            );
        else if((this.operator == '<<' ||
            this.operator == '>>') &&
            (!DataType.isOfIntType(leftType) &&
            !DataType.isOfIntType(rightType)))
            results.errors.set(
                this.marker(),
                'Invalid binary shift (' + this.operator +
                ') operation with ' + leftType.toString() +
                ' and ' + rightType.toString()
            );

        this.resolveExpressions(
            results,
            returnType,
            unsafe
        );
    }

    public marker(): Token {
        return this.mark;
    }
}

export {
    ExprASTBool,
    ExprASTAndOr,
    ExprASTEquality,
    ExprASTString,
    ExprASTInt,
    ExprASTFloat,
    ExprASTUnary
};