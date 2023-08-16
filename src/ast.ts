import {
    BasicBlock,
    Constant,
    IRBuilder,
    Module
} from 'llvm-bindings';

import { DataType } from './data_type';

abstract class ASTNode {
    public abstract resolve(): void;
}

abstract class ExpressionAST extends ASTNode {
    public abstract visit(
        builder: IRBuilder,
        module: Module,
        block: BasicBlock): Constant;

    public abstract type(): DataType;
}

abstract class StatementAST extends ASTNode {
    public abstract visit(
        builder: IRBuilder,
        module: Module,
        block: BasicBlock
    ): void;
}

export {
    ASTNode,
    ExpressionAST,
    StatementAST
};