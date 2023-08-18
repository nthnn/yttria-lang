import {
    IRBuilder,
    Function,
    Module,
    BasicBlock,
    Constant,
    FunctionType,
    ConstantInt,
    Value,
    Type
} from "llvm-bindings";

import {
    ASTResolveResults,
    ExpressionAST,
    StatementAST
} from "./ast";

import { Token } from "./token";
import { DataType } from "./data_type";
import { ExprASTString } from "./ast_expr";

import LLVMGlobalContext from "./llvm_context";
import YttriaRuntime from "./yttria_runtime";

class StmtASTMain implements StatementAST {
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

        const main: BasicBlock = BasicBlock.Create(
            LLVMGlobalContext,
            'entry',
            Function.Create(
                FunctionType.get(
                    builder.getInt32Ty(),
                    [],
                    false
                ),
                Function.LinkageTypes.ExternalLinkage,
                'main',
                module
            )
        );

        builder.SetInsertPoint(main);
        this.body.visit(builder, module);

        builder.CreateRet(
            ConstantInt.get(builder.getInt32Ty(), 0, true)
        );
    }

    public resolve(
        results: ASTResolveResults,
        returnType: DataType
    ): void {
        this.body.resolve(
            results,
            returnType.getLLVMType() as unknown as DataType
        );
    }

    public marker(): Token {
        return this.mark;
    }
}

class StmtASTRender implements StatementAST {
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
        let formatted: Constant = this.expr.visit(builder, module);

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
        returnType: DataType
    ): void {
        this.expr.resolve(
            results,
            returnType
        );
    }

    public marker(): Token {
        return this.mark;
    }
}

class StmtASTReturn implements StatementAST {
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
        returnType: DataType
    ): void {
        if(this.hasValue) {
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
                returnType
            );
        }
    }

    public marker(): Token {
        return this.mark;
    }
}

export {
    StmtASTMain,
    StmtASTRender
};