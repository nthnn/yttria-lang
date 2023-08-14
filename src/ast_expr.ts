import {
    BasicBlock,
    Constant,
    IRBuilder,
    Module
} from "llvm-bindings";

import { ExpressionAST } from "./ast";
import { createHash } from "crypto";

import DataType from "./data_type";

class ExprASTString implements ExpressionAST {
    private value: string;

    public constructor(value: string) {
        this.value = value;
    }

    public visit(
        builder: IRBuilder,
        module: Module,
        block: BasicBlock
    ): Constant {
        return builder.CreateGlobalStringPtr(
            this.value,
            '__' + createHash('md5')
                .update(this.value)
                .digest('hex'),
            0,
            module
        );
    }

    public type(): DataType {
        return DataType.STRING;
    }
}

export { ExprASTString };