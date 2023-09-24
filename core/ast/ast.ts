import {
    Constant,
    IRBuilder,
    Module,
    Value
} from 'llvm-bindings';

import { DataType } from '../compiler/data_type';
import { Token } from '../tokenizer/token';

interface ASTResolveResults {
    errors: Map<Token, string>;
    warnings: Map<Token, string>;
}

abstract class ASTNode {
    public abstract resolve(
        results: ASTResolveResults,
        returnType: DataType,
        unsafe: boolean
    ): void;

    public abstract marker(): Token;
}

abstract class ExpressionAST extends ASTNode {
    public abstract visit(
        builder: IRBuilder,
        module: Module
    ): Value;

    public abstract type(): DataType;
}

abstract class StatementAST extends ASTNode {
    public abstract visit(
        builder: IRBuilder,
        module: Module
    ): void;
}

export {
    ASTNode,
    ASTResolveResults,
    ExpressionAST,
    StatementAST
};