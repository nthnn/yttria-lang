import { BasicBlock, ConstantInt, Function, FunctionType, IRBuilder, Module, Type } from "llvm-bindings";
import { Token } from "../../tokenizer/token";
import { ASTResolveResults, StatementAST } from "../ast";
import LLVMGlobalContext from "../../compiler/llvm_context";
import YttriaRuntime from "../../compiler/yttria_runtime";
import { DataType } from "../../compiler/data_type";
import { CompileTarget } from "../../project_structure";

export default class StmtASTMain implements StatementAST {
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
