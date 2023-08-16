import {
    BasicBlock,
    Constant,
    ConstantFP,
    ConstantInt,
    IRBuilder,
    Module
} from "llvm-bindings";

import { ExpressionAST } from "./ast";
import { DataType, LLVDataType } from "./data_type";

import ASTError from "./ast_exception";
import YttriaUtil from "./util";
import YttriaRuntime from "./yttria_runtime";

class ExprASTString implements ExpressionAST {
    private value: string;

    public constructor(value: string) {
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

    public resolve(): void { }
}

class ExprASTInt implements ExpressionAST {
    private value: number;
    private bit: number;

    public constructor(value: number, bit: number) {
        this.value = value;
        this.bit = bit;
    }
    
    public visit(
        builder: IRBuilder,
        module: Module,
        block: BasicBlock
    ): Constant {
        return ConstantInt.get(
            LLVDataType.getIntType(this.bit),
            this.value,
            true
        );
    }

    public type(): DataType {
        return LLVDataType.getIntDataType(this.bit);
    }

    public resolve(): void { }
}

class ExprASTFloat implements ExpressionAST {
    private value: number;
    private bit: number;

    public constructor(value: number, bit: number) {
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
        return LLVDataType.getFloatDataType(this.bit);
    }

    public resolve(): void { }
}

class ExprASTUnary implements ExpressionAST {
    private operator: string;
    private expr: ExpressionAST;

    public constructor(operator: string, expr: ExpressionAST) {
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

    public resolve(): void { }
}

export {
    ExprASTString,
    ExprASTInt,
    ExprASTFloat,
    ExprASTUnary
};