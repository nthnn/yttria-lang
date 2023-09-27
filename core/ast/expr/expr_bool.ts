import { ConstantInt, IRBuilder, Module, Type, Value } from "llvm-bindings";
import { Token } from "../../tokenizer/token";
import { ASTResolveResults, ExpressionAST } from "../ast";
import LLVMGlobalContext from "../../compiler/llvm_context";
import DataType from "../../compiler/data_type";

export default class ExprASTBool implements ExpressionAST {
    private value: boolean;
    public mark: Token;

    public constructor(
        mark: Token,
        value: boolean
    ) {
        this.mark = mark;
        this.value = value;
    }

    public visit(
        builder: IRBuilder,
        module: Module
    ): Value {

        return ConstantInt.get(
            Type.getIntNTy(LLVMGlobalContext, 1),
            this.value ? 1 : 0,
            true
        );
    }

    public type(): DataType {
        return DataType.BOOL;
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