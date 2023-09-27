import { IRBuilder, Module, Value } from "llvm-bindings";
import { Token } from "../../tokenizer/token";
import { ASTResolveResults, ExpressionAST, StatementAST } from "../ast";

import DataType from "../../compiler/data_type";

export default class StmtASTReturn implements StatementAST {
    private mark: Token;
    private hasValue: boolean;
    private value?: ExpressionAST;

    public constructor(
        mark: Token,
        hasValue: boolean,
        value?: ExpressionAST
    ) {
        this.mark = mark;
        this.hasValue = hasValue;
        this.value = value;
    }

    public visit(
        builder: IRBuilder,
        module: Module
    ): void {
        if(this.hasValue)
            builder.CreateRet(
                this.value?.visit(
                    builder,
                    module
                ) as Value
            );
        else builder.CreateRetVoid();
    }

    public resolve(
        results: ASTResolveResults,
        returnType: DataType,
        unsafe: boolean
    ): void {
        if(returnType != DataType.VOID &&
                !this.hasValue)
            results.errors.set(
                this.mark,
                'Invalid no return value. ' +
                'Must return ' + returnType.toString()
            );
        else if(this.hasValue) {
            const valueType: DataType =
                this.value?.type() as DataType;

            if(valueType != returnType)
                results.errors.set(
                    this.mark,
                    'Invalid return type ' +
                    valueType.toString() + ' for type ' +
                    returnType.toString() + '.');

            this.value?.resolve(
                results,
                returnType,
                unsafe
            );
        }
    }

    public marker(): Token {
        return this.mark;
    }
}
