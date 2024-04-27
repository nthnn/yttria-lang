import { ConstantInt, IRBuilder, Module, Value } from "llvm-bindings";
import { Token } from "../../tokenizer/token";
import { ASTResolveResults, ExpressionAST } from "../ast";

import DataType from "../../compiler/data_type";
import LLVMDataType from "../../compiler/native_type";

export default class ExprASTInt implements ExpressionAST {
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
            LLVMDataType.getIntType(this.bit),
            Number(this.value),
            true
        );
    }

    public type(): DataType {
        return LLVMDataType.getIntDataType(this.bit);
    }

    private minMaxFlow(
        min: number,
        max: number,
        type: string,
        results: ASTResolveResults
    ): void {

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
                this.minMaxFlow(
                    -8, 7, 'i4',
                    results
                );
                break;

            case 8:
                this.minMaxFlow(
                    -128, 127, 'i8',
                    results
                );
                break;

            case 16:
                this.minMaxFlow(
                    -32768,
                    32767,
                    'i16',
                    results
                );
                break;

            case 32:
                this.minMaxFlow(
                    -2147483648,
                    2147483647,
                    'i32',
                    results
                );
                break;

            case 64:
                this.minMaxFlow(
                    -9223372036854775808,
                    9223372036854775807,
                    'i64',
                    results
                );
                break;
        }
    }

    public marker(): Token {
        return this.mark;
    }
}