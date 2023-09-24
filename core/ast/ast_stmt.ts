import {
    IRBuilder,
    Function,
    Module,
    BasicBlock,
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

import { Token } from "../tokenizer/token";
import { DataType } from "../compiler/data_type";
import { ExprASTString } from "./ast_expr";

import LLVMGlobalContext from "../compiler/llvm_context";
import YttriaRuntime from "../compiler/yttria_runtime";
import { CompileTarget } from "../project_structure";

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
        if(CompileTarget.projectType == 'micro') {
            builder.CreateCall(
                YttriaRuntime.usartInit(module),
                [
                    ConstantInt.get(
                        Type.getInt16Ty(LLVMGlobalContext),
                        9600,
                        true
                    )
                ]
            );

            builder.CreateCall(
                YttriaRuntime.uartWait(module),
                []
            );
        }

        this.body.visit(builder, module);
        builder.CreateRet(
            ConstantInt.get(builder.getInt32Ty(), 0, true)
        );
    }

    public resolve(
        results: ASTResolveResults,
        returnType: DataType,
        unsafe: boolean
    ): void {
        this.body.resolve(
            results,
            returnType.getLLVMType() as unknown as DataType,
            unsafe
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

class StmtASTDefer implements StatementAST {
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

class StmtASTBlock implements StatementAST {
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

class StmtASTUnsafe implements StatementAST {
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

export {
    StmtASTMain,
    StmtASTRender,
    StmtASTDefer,
    StmtASTReturn,
    StmtASTBlock,
    StmtASTUnsafe
};