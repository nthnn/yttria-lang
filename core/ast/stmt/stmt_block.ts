import { IRBuilder, Module } from "llvm-bindings";
import { Token } from "../../tokenizer/token";
import { ASTResolveResults, StatementAST } from "../ast";

import DataType from "../../compiler/data_type";
import StmtASTDefer from "./stmt_defer";
import StmtASTReturn from "./stmt_return";

export default class StmtASTBlock implements StatementAST {
    private mark: Token;
    private body: Array<StmtASTBlock>;

    public constructor(
        mark: Token,
        body: Array<StmtASTBlock>
    ) {
        this.mark = mark;
        this.body = body;
    }

    public visit(
        builder: IRBuilder,
        module: Module
    ): void {
        const deferrals: Array<StatementAST> = [];

        this.body.forEach((stmt: StatementAST)=> {
            if(!(stmt instanceof StmtASTDefer))
                stmt.visit(builder, module);
            else deferrals.push(stmt);
        });

        deferrals.reverse();
        deferrals.forEach((stmt: StatementAST)=> {
            stmt.visit(builder, module);
        });
    }

    public resolve(
        results: ASTResolveResults,
        returnType: DataType,
        unsafe: boolean
    ): void {
        const deferrals: Array<StatementAST> = [];
        let isPrevReturn: boolean = false;
        let prevReturnMark: Token;

        this.body.forEach((stmt: StatementAST)=> {
            if(!(stmt instanceof StmtASTDefer)) {
                stmt.resolve(
                    results,
                    returnType,
                    unsafe);

                if(isPrevReturn) {
                    results.errors.set(
                        prevReturnMark as unknown as Token,
                        'Unreachable code.'
                    );

                    isPrevReturn = false;
                }
                if(stmt instanceof StmtASTReturn) {
                    isPrevReturn = true;
                    prevReturnMark = stmt.marker();
                }
            }
            else deferrals.push(stmt);
        });

        deferrals.reverse();
        deferrals.forEach((stmt: StatementAST)=> {
            if(isPrevReturn) {
                results.errors.set(
                    prevReturnMark as unknown as Token,
                    'Unreachable code.'
                );

                isPrevReturn = false;
            }
            if(stmt instanceof StmtASTReturn) {
                isPrevReturn = true;
                prevReturnMark = stmt.marker();
            }

            stmt.resolve(
                results,
                returnType,
                unsafe
            );
        });
    }

    public marker(): Token {
        return this.mark;
    }
}
