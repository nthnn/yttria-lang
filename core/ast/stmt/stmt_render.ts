import { IRBuilder, Module, Value } from "llvm-bindings";
import { Token } from "../../tokenizer/token";
import { ASTResolveResults, ExpressionAST, StatementAST } from "../ast";
import { CompileTarget } from "../../project_structure";

import DataType from "../../compiler/data_type";
import ExprASTString from "../expr/expr_string";
import YttriaRuntime from "../../compiler/yttria_runtime";

export default class StmtASTRender implements StatementAST {
    private mark: Token;
    private expr: ExpressionAST;

    public constructor(
        mark: Token,
        expr: ExpressionAST
    ) {
        this.mark = mark;
        this.expr = expr;
    }

    public visit(
        builder: IRBuilder,
        module: Module
    ): void {
        let formatter: string = "";
        let formatted: Value = this.expr.visit(builder, module);

        if(CompileTarget.projectType == 'micro') {
            builder.CreateCall(
                YttriaRuntime.render(module),
                [formatted]
            );

            return;
        }

        const dataType: DataType = this.expr.type();
        if(DataType.isOfIntType(dataType) ||
            dataType == DataType.BOOL) {

            if(dataType == DataType.I64)
                formatter = '%llu';
            else formatter = '%d';
        }
        else if(DataType.isOfFloatType(dataType))
            formatter = '%g';
        else if(dataType == DataType.STRING)
            formatter = '%s';

        builder.CreateCall(
            YttriaRuntime.render(module),
            [
                new ExprASTString(this.mark, formatter)
                    .visit(builder, module),
                formatted
            ]
        );
    }

    public resolve(
        results: ASTResolveResults,
        returnType: DataType,
        unsafe: boolean
    ): void {
        this.expr.resolve(
            results,
            returnType,
            unsafe
        );
    }

    public marker(): Token {
        return this.mark;
    }
}
