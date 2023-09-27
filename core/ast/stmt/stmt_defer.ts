import { IRBuilder, Module } from "llvm-bindings";
import { Token } from "../../tokenizer/token";
import { ASTResolveResults, StatementAST } from "../ast";

import DataType from "../../compiler/data_type";
import StmtASTReturn from "./stmt_return";

export default class StmtASTDefer implements StatementAST {
    private mark: Token;
    private stmt: StatementAST;

    public constructor(
        mark: Token,
        stmt: StatementAST
    ) {
        this.mark = mark;
        this.stmt = stmt;
    }

    public visit(
        builder: IRBuilder,
        module: Module
    ): void {
        this.stmt.visit(builder, module);
    }

    public resolve(
        results: ASTResolveResults,
        returnType: DataType,
        unsafe: boolean
    ): void {
        if(this.stmt instanceof StmtASTReturn &&
            !unsafe)

            results.warnings.set(
                this.mark,
                'Defer with return' +
                ' as inner statement'
            );
        else if(this.stmt instanceof StmtASTDefer &&
            !unsafe)

            results.warnings.set(
                this.mark,
                'Defer inside a defer statement' +
                ' would not take any effect.'
            );

        this.stmt.resolve(results, returnType, unsafe);
    }

    public marker(): Token {
        return this.mark;
    }
}
