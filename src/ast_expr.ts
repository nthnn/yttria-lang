import {
    BasicBlock,
    Constant,
    ConstantFP,
    ConstantInt,
    IRBuilder,
    Module,
    Type
} from "llvm-bindings";

import { ExpressionAST } from "./ast";

import DataType from "./data_type";
import LLVMGlobalContext from "./llvm_context";
import ASTError from "./ast_exception";
import YttriaUtil from "./util";

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

    private static typeMap: Map<number, [Type, DataType]> =
        new Map<number, [Type, DataType]>([
        [4, [Type.getIntNTy(LLVMGlobalContext, 4), DataType.I4]],
        [8, [Type.getInt8Ty(LLVMGlobalContext), DataType.I8]],
        [16, [Type.getInt16Ty(LLVMGlobalContext), DataType.I16]],
        [32, [Type.getInt32Ty(LLVMGlobalContext), DataType.I32]],
        [64, [Type.getInt64Ty(LLVMGlobalContext),DataType.I64]],
        [128, [Type.getInt128Ty(LLVMGlobalContext), DataType.I128]]
    ]);

    public constructor(value: number, bit: number) {
        this.value = value;
        this.bit = bit;
    }

    private appropriateType(): Type {
        if(ExprASTInt.typeMap.has(this.bit))
            return ExprASTInt.typeMap.get(this.bit)![0];

        return Type.getIntNTy(LLVMGlobalContext, 0);
    }
    
    public visit(
        builder: IRBuilder,
        module: Module,
        block: BasicBlock
    ): Constant {
        return ConstantInt.get(
            this.appropriateType(),
            this.value,
            true
        );
    }

    public type(): DataType {
        return ExprASTInt.typeMap.get(this.bit)![1];
    }

    public resolve(): void { }
}

class ExprASTFloat implements ExpressionAST {
    private value: number;
    private bit: number;

    private static typeMap: Map<number, [Type, DataType]> =
        new Map<number, [Type, DataType]>([
        [16, [Type.getBFloatTy(LLVMGlobalContext), DataType.F16]],
        [32, [Type.getFloatTy(LLVMGlobalContext), DataType.F32]],
        [64, [Type.getDoubleTy(LLVMGlobalContext), DataType.F64]],
        [128, [Type.getPPC_FP128Ty(LLVMGlobalContext), DataType.F128]],
    ]);

    public constructor(value: number, bit: number) {
        this.value = value;
        this.bit = bit;
    }

    private appropriateType(): Type {
        if(ExprASTFloat.typeMap.has(this.bit))
            return ExprASTFloat.typeMap.get(this.bit)![0];

        return Type.getIntNTy(LLVMGlobalContext, 0);
    }

    public visit(
        builder: IRBuilder,
        module: Module,
        block: BasicBlock
    ): Constant {
        return ConstantFP.get(
            this.appropriateType(),
            this.value
        );
    }

    public type(): DataType {
        return ExprASTFloat.typeMap.get(this.bit)![1];
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
        if(this.operator == '-' ||
            this.operator == '+')
            return builder.CreateNeg(
                this.expr.visit(builder, module, block),
                YttriaUtil.generateRandomHash()
            ) as Constant;
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

export { ExprASTString, ExprASTInt, ExprASTFloat };