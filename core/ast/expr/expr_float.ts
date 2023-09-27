import { ConstantFP, IRBuilder, Module, Value } from "llvm-bindings";
import { Token } from "../../tokenizer/token";
import { ASTResolveResults, ExpressionAST } from "../ast";

import DataType from "../../compiler/data_type";
import LLVMDataType from "../../compiler/native_type";

export default class ExprASTFloat implements ExpressionAST {
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