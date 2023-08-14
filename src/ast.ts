import {
    BasicBlock,
    Constant,
    IRBuilder,
    Module
} from 'llvm-bindings';

import DataType from './data_type';

abstract class ExpressionAST {
    public abstract visit(
        builder: IRBuilder,
        module: Module,
        block: BasicBlock): Constant;

    public abstract type(): DataType;
}

abstract class StatementAST {
    public abstract visit(
        builder: IRBuilder,
        module: Module,
        block: BasicBlock
    ): void;
}

export { ExpressionAST, StatementAST};