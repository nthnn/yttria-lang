import { IRBuilder, Module, Type, Value } from "llvm-bindings";
import { Token } from "../../tokenizer/token";
import { ASTResolveResults, ExpressionAST } from "../ast";
import { DataType } from "../../compiler/data_type";
import ASTError from "../ast_exception";

export default class ExprASTAndOr implements ExpressionAST {
    private mark: Token;
    private operator: string;
    private left: ExpressionAST;
    private right: ExpressionAST;

    public constructor(
        mark: Token,
        operator: string,
        left: ExpressionAST,
        right: ExpressionAST
    ) {
        this.mark = mark;
        this.operator = operator;
        this.left = left;
        this.right = right;
    }

    public visit(
        builder: IRBuilder,
        module: Module
    ): Value {
        const leftExpr: Value =
            this.left.visit(builder, module);
        const rightExpr: Value =
            this.right.visit(builder, module);
        const outType: Type =
            DataType.greaterIntegerType(
                this.left.type(),
                this.right.type()
            ).getLLVMType();

        if(this.operator == '|')
            return builder.CreateIntCast(
                builder.CreateOr(
                    leftExpr,
                    rightExpr
                ),
                outType,
                true
            );
        else if(this.operator == '||')
            return builder.CreateOr(
                leftExpr,
                rightExpr
            );
        else if(this.operator == '&')
            return builder.CreateIntCast(
                builder.CreateAnd(
                    leftExpr,
                    rightExpr
                ),
                outType,
                true
            );
        else if(this.operator == '&&')
            return builder.CreateAnd(
                leftExpr,
                rightExpr
            );

        throw new ASTError('Invalid binary operator.');
    }

    public type(): DataType {
        if(this.operator == '|' ||
            this.operator == '&')
            return DataType.greaterIntegerType(
                this. left.type(),
                this.right.type()
            );
        else if(this.operator == '||' ||
            this.operator == '&&')
            return DataType.BOOL;

        throw new ASTError('Invalid operator for' +
            ' binary/logical expression');
    }

    public resolve(
        results: ASTResolveResults,
        returnType: DataType,
        unsafe: boolean
    ): void {
        const leftType: DataType =
            this.left.type();
        const rightType: DataType =
            this.right.type();
        const leftMarker: Token =
            this.left.marker();
        const rightMarker: Token =
            this.right.marker();

        if(this.operator == '|' ||
            this.operator == '&') {
            if(!DataType.isOfIntType(leftType))
                results.errors.set(
                    leftMarker,
                    'Left-hand of binary operation' +
                    ' is not of integer type.'
                );

            if(!DataType.isOfIntType(rightType))
                results.errors.set(
                    rightMarker,
                    'Right-hand of binary operation' +
                    ' is not of integer type.'
                );
        }
        else if(this.operator == '&&' ||
            this.operator == '||') {
            if(unsafe &&
                (DataType.isOfIntType(leftType) &&
                    !DataType.isOfIntType(rightType))) {

                results.errors.set(
                    this.mark,
                    'Type of ' + leftType.toString +
                    ' cannot be used with \'' + this.operator +
                    '\' operator to type of ' +
                    rightType.toString()
                );
                return;
            }

            if(leftType != DataType.BOOL)
                results.errors.set(
                    leftMarker,
                    'Left-hand expression' +
                    ' is not of bool type.'
                );
            if(rightType != DataType.BOOL)
                results.errors.set(
                    rightMarker,
                    'Right-hand expression' +
                    ' is not of bool type.'
                );

        }

        this.left.resolve(results, returnType, unsafe);
        this.right.resolve(results, returnType, unsafe);
    }

    public marker(): Token {
        return this.mark;
    }
}