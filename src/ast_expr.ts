import {
    BasicBlock,
    Constant,
    ConstantFP,
    ConstantInt,
    IRBuilder,
    Module,
    Type
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

    public constructor(mark: Token, value: boolean) {
        this.mark = mark;
        this.value = value;
    }

    public visit(
        builder: IRBuilder,
        module: Module,
        block: BasicBlock
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

    public resolve(results: ASTResolveResults): void { }

    public marker(): Token {
        return this.mark;
    }
}

class ExprASTString implements ExpressionAST {
    private value: string;
    private mark: Token;

    public constructor(mark: Token, value: string) {
        this.mark = mark;
        this.value = value;
    }

    public visit(
        builder: IRBuilder,
        module: Module,
        block: BasicBlock
    ): Constant {
        return builder.CreateGlobalStringPtr(
            this.value,
            YttriaUtil.generateHash(this.value),
            0,
            module
        );
    }

    public type(): DataType {
        return DataType.STRING;
    }

    public resolve(results: ASTResolveResults): void { }

    public marker(): Token {
        return this.mark;
    }
}

class ExprASTInt implements ExpressionAST {
    private value: BigInt;
    private bit: number;
    private mark: Token;

    public constructor(mark: Token, value: BigInt, bit: number) {
        this.mark = mark;
        this.value = value;
        this.bit = bit;
    }
    
    public visit(
        builder: IRBuilder,
        module: Module,
        block: BasicBlock
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
                'Underflow value for ' + type + ' type: ' + this.value.toString()
            );
        else if(this.value > max)
            results.errors.set(
                this.marker(),
                'Overflow value for ' + type + ' type: ' + this.value.toString()
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

    public constructor(mark: Token, value: number, bit: number) {
        this.mark = mark;
        this.value = value;
        this.bit = bit;
    }

    public visit(
        builder: IRBuilder,
        module: Module,
        block: BasicBlock
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
        string, expr: ExpressionAST) {

        this.mark = mark;
        this.operator = operator;
        this.expr = expr;
    }

    public visit(builder: IRBuilder, module: Module, block: BasicBlock): Constant {
        if(this.operator == '-') {
            if(DataType.isOfFloatType(this.type()))
                return builder.CreateFNeg(
                    this.expr.visit(builder, module, block),
                    YttriaUtil.generateRandomHash()
                ) as Constant;
            else return builder.CreateNeg(
                this.expr.visit(builder, module, block),
                YttriaUtil.generateRandomHash()
            ) as Constant;
        }
        else if(this.operator == '+') {
            const type: DataType = this.type();

            if(DataType.isOfIntType(type))
                return builder.CreateCall(
                    YttriaRuntime.iabs(module, type.getLLVMType()),
                    [this.expr.visit(builder, module, block)],
                    YttriaUtil.generateRandomHash()
                ) as unknown as Constant;
            else if(DataType.isOfFloatType(type))
                return builder.CreateCall(
                    YttriaRuntime.fpabs(module, type),
                    [this.expr.visit(builder, module, block)],
                    YttriaUtil.generateRandomHash()
                ) as unknown as Constant;
        }
        else if(this.operator == '~')
            return builder.CreateNot(
                this.expr.visit(builder, module, block),
                YttriaUtil.generateRandomHash()
            ) as Constant;

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

export {
    ExprASTBool,
    ExprASTString,
    ExprASTInt,
    ExprASTFloat,
    ExprASTUnary
};