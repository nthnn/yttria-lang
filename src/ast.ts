import {
    Constant,
    IRBuilder,
    Module
} from 'llvm-bindings';

import { DataType } from './data_type';
import { Token } from './token';

interface ASTResolveResults {
    errors: Map<Token, string>;
    warnings: Map<Token, string>;
}

abstract class ASTNode {
    public abstract resolve(
        results: ASTResolveResults,
        returnType: DataType
    ): void;

    public abstract marker(): Token;
}

abstract class ExpressionAST extends ASTNode {
    public abstract visit(
        builder: IRBuilder,
        module: Module
    ): Constant;

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