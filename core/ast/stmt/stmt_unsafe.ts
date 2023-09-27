import { ASTResolveResults, StatementAST } from "../ast";
import { IRBuilder, Module } from "llvm-bindings";
import { Token } from "../../tokenizer/token";

import DataType from "../../compiler/data_type";

export default class StmtASTUnsafe implements StatementAST {
    private mark: Token;
    private body: StatementAST;

    public constructor(
        mark: Token,
        body: StatementAST
    ) {
        this.mark = mark;
        this.body = body;
    }

    public visit(
        builder: IRBuilder,
        module: Module
    ): void {
        this.body.visit(builder, module);
    }

    public resolve(
        results: ASTResolveResults,
        returnType: DataType,
        unsafe: boolean
    ): void {
        if(unsafe)
            results.warnings.set(
                this.mark,
                'Already inside an unsafe block.'
            );

        this.body.resolve(
            results,
            returnType,
            true
        );
    }

    public marker(): Token {
        return this.mark;
    }
}
