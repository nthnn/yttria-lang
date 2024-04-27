import { ConstantInt, IRBuilder, Module, Value } from "llvm-bindings";
import { Token } from "../../tokenizer/token";
import { ASTResolveResults, ExpressionAST } from "../ast";

import DataType from "../../compiler/data_type";
import LLVMDataType from "../../compiler/native_type";

export default class ExprASTUInt implements ExpressionAST {
    private value: number;
    private bit: number;
    private mark: Token;

    public constructor(
        mark: Token,
        value: number,
        bit: number
    ) {
        this.mark = mark;
        this.value = value;
        this.bit = bit;
    }
    
    public visit(
        builder: IRBuilder,
        module: Module
    ): Value {

        return ConstantInt.get(
            LLVMDataType.getUIntType(this.bit),
            Number(this.value),
            false
        );
    }

    public type(): DataType {
        return LLVMDataType.getUIntDataType(this.bit);
    }

    private maxFlow(
        max: number,
        type: string,
        results: ASTResolveResults
    ): void {
        const min: number = 0;

        if(this.value < min)
            results.errors.set(
                this.marker(),
                'Underflow value for ' + type +
                ' type: ' + this.value.toString()
            );
        else if(this.value > max)
            results.errors.set(
                this.marker(),
                'Overflow value for ' + type +
                ' type: ' + this.value.toString()
            );
    }

    public resolve(
        results: ASTResolveResults,
        returnType: DataType,
        unsafe: boolean
    ): void {
        if(unsafe)
            return;

        switch(this.bit) {
            case 4:
                this.maxFlow(15, 'u4', results);
                break;

            case 8:
                this.maxFlow(255, 'u8', results);
                break;

            case 16:
                this.maxFlow(65535, 'u16', results);
                break;

            case 32:
                this.maxFlow(4294967295, 'u32', results);
                break;

            case 64:
                this.maxFlow(18446744073709551615, 'u64', results);
                break;
        }
    }

    public marker(): Token {
        return this.mark;
    }
}
