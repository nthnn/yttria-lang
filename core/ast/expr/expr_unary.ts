import { IRBuilder, Module, Type, Value } from "llvm-bindings";
import { Token } from "../../tokenizer/token";
import { ASTResolveResults, ExpressionAST } from "../ast";
import { DataType } from "../../compiler/data_type";
import YttriaUtil from "../../util/util";
import LLVMGlobalContext from "../../compiler/llvm_context";
import YttriaRuntime from "../../compiler/yttria_runtime";
import ASTError from "../ast_exception";

export class ExprASTUnary implements ExpressionAST {
    private operator: string;
    private expr: ExpressionAST;
    private mark: Token;

    public constructor(
        mark: Token,
        operator:
        string, expr: ExpressionAST
    ) {
        this.mark = mark;
        this.operator = operator;
        this.expr = expr;
    }

    public visit(
        builder: IRBuilder,
        module: Module
    ): Value {

        const visited: Value =
            this.expr.visit(builder, module);

        if(this.operator == '-') {
            if(DataType.isOfFloatType(this.type()))
                return builder.CreateFNeg(
                    visited,
                    YttriaUtil.generateRandomHash()
                );
            else if(this.type() == DataType.BOOL)
                return builder.CreateIntCast(
                    builder.CreateNeg(
                        visited,
                        YttriaUtil.generateRandomHash()
                    ),
                    Type.getIntNTy(LLVMGlobalContext, 4),
                    true
                );
            else return builder.CreateNeg(
                visited,
                YttriaUtil.generateRandomHash()
            );
        }
        else if(this.operator == '+') {
            const type: DataType = this.type();

            if(DataType.isOfIntType(type))
                return builder.CreateCall(
                    YttriaRuntime.iabs(module, type.getLLVMType()),
                    [visited],
                    YttriaUtil.generateRandomHash()
                );
            else if(DataType.isOfFloatType(type))
                return builder.CreateCall(
                    YttriaRuntime.fpabs(module, type),
                    [visited],
                    YttriaUtil.generateRandomHash()
                );
            else if(type == DataType.BOOL)
                return builder.CreateCall(
                    YttriaRuntime.iabs(
                        module,
                        type.getLLVMType()
                    ),
                    [visited],
                    YttriaUtil.generateRandomHash()
                );
        }
        else if(this.operator == '~')
            return builder.CreateNot(
                visited,
                YttriaUtil.generateRandomHash()
            );
        else if(this.operator == '!')
            return builder.CreateNot(visited);

        throw new ASTError('Invalid operator for unary AST.');
    }

    public type(): DataType {
        return this.expr.type();
    }

    public resolve(
        results: ASTResolveResults,
        returnType: DataType,
        unsafe: boolean
    ): void {
        const dataType: DataType = this.expr.type();
        const mrk: Token = this.marker();

        if(this.operator == '~' &&
            DataType.isOfFloatType(dataType))
            results.errors.set(
                mrk,
                'Incompatible unary ~ operator ' +
                'for floating-point type'
            );
        else if((this.operator == '+' ||
            this.operator == '-') && (
            !DataType.isOfFloatType(dataType) &&
            !DataType.isOfIntType(dataType)))
            results.errors.set(
                mrk,
                'Unary operator ' + this.operator +
                ' cannot be used on non-number expressions.'
            )
        else if(this.operator == '!' &&
            dataType != DataType.BOOL && !unsafe)
            results.errors.set(
                mrk,
                'Unary ! operator can be only used ' +
                'on boolean expressions.'
            );
    }

    public marker(): Token {
        return this.mark;
    }
}