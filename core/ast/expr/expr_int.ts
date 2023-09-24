import { ConstantInt, IRBuilder, Module, Value } from "llvm-bindings";
import { Token } from "../../tokenizer/token";
import { ASTResolveResults, ExpressionAST } from "../ast";
import { DataType, LLVMDataType } from "../../compiler/data_type";

export default class ExprASTInt implements ExpressionAST {
    private value: BigInt;
    private bit: number;
    private mark: Token;

    public constructor(
        mark: Token,
        value: BigInt,
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
            this.type.name.startsWith("i")
        );
    }

    public type(): DataType {
        return LLVMDataType.getIntDataType(this.bit);
    }

    private minMaxFlow(
        min: BigInt,
        max: BigInt,
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

        // FIX
        switch(this.bit) {
            case 4:
                this.minMaxFlow(
                    BigInt('-8'), BigInt('7'), 'i4',
                    results
                );
                break;

            case 8:
                this.minMaxFlow(
                    BigInt('0'), BigInt('255'), 'i8',
                    results
                );
                break;

            case 16:
                this.minMaxFlow(
                    BigInt('-32768'),
                    BigInt('32767'),
                    'i16',
                    results
                );
                break;

            case 32:
                this.minMaxFlow(
                    BigInt('-2147483648'),
                    BigInt('2147483647'),
                    'i32',
                    results
                );
                break;

            case 64:
                this.minMaxFlow(
                    BigInt('-9223372036854775808'),
                    BigInt('9223372036854775807'),
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