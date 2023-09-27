import { IRBuilder, Module, Value } from "llvm-bindings";
import { Token } from "../../tokenizer/token";
import { ASTResolveResults, ExpressionAST } from "../ast";

import DataType from "../../compiler/data_type";
import YttriaUtil from "../../util/util";

export default class ExprASTString implements ExpressionAST {
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