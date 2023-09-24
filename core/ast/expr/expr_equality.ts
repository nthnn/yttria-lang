import { IRBuilder, Module, Value } from "llvm-bindings";
import { Token } from "../../tokenizer/token";
import { ASTResolveResults, ExpressionAST } from "../ast";
import { DataType } from "../../compiler/data_type";

export default class ExprASTEquality implements ExpressionAST {
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
        type ASTEqInstruction = (
            lhs: Value,
            rhs: Value,
            name?: string
        ) => Value;

        let funcBuilder: Array<ASTEqInstruction> = [
            builder.CreateICmpEQ.bind(builder),
            builder.CreateICmpNE.bind(builder),
            builder.CreateFCmpOEQ.bind(builder),
            builder.CreateFCmpONE.bind(builder)
        ];
        let funcAddr: number = 0;

        const leftType: DataType =
            this.left.type();
        const rightType: DataType =
            this.right.type();

        const leftExpr: Value =
            this.left.visit(builder, module);
        let rightExpr: Value =
            this.right.visit(builder, module);

        if(DataType.isOfFloatType(leftType) &&
            DataType.isOfFloatType(rightType))
            funcAddr = (this.operator == '==' ? 2 : 3);
        else if(DataType.isOfIntType(leftType) &&
            DataType.isOfIntType(rightType))
            funcAddr = (this.operator == '==' ? 0 : 1);
        else if(DataType.isOfFloatType(leftType) &&
            DataType.isOfIntType(rightType)) {

            funcAddr = (this.operator == '==' ? 2 : 3);
            rightExpr = builder.CreateIntCast(
                rightExpr,
                leftType.getLLVMType(),
                true
            );
        }
        else if(DataType.isOfIntType(leftType) &&
            DataType.isOfFloatType(rightType)) {

            funcAddr = (this.operator == '==' ? 0 : 1);
            rightExpr = builder.CreateFPCast(
                rightExpr,
                rightType.getLLVMType()
            );
        }
        else if((leftType == DataType.BOOL &&
            rightType == DataType.BOOL) &&
            (leftType == DataType.STRING &&
                rightType == DataType.STRING))
            funcAddr = (this.operator == '==' ? 0 : 1);

        return funcBuilder[funcAddr](
            leftExpr,
            rightExpr
        );
    }

    public type(): DataType {
        return DataType.BOOL;
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

        if(DataType.isOfFloatType(leftType) &&
            DataType.isOfIntType(rightType))
            results.warnings.set(
                this.mark,
                'Lose conversion from ' + leftType.toString() +
                ' to ' + rightType.toString() + '.'
            );
        else if(DataType.isOfFloatType(leftType) &&
            !DataType.isOfFloatType(rightType))
            results.errors.set(
                this.mark,
                'Type ' + leftType.toString() +
                ' cannot be compared to type of ' +
                rightType.toString() + '.'
            );
        else if(DataType.isOfIntType(leftType) &&
            DataType.isOfFloatType(rightType))
            results.warnings.set(
                this.mark,
                'Lose conversion from ' + leftType.toString +
                ' to ' + rightType.toString() + '.'
            );
        else if(DataType.isOfIntType(leftType) &&
            !DataType.isOfIntType(rightType))
            results.errors.set(
                this.mark,
                'Type ' + leftType.toString() +
                ' cannot be compared to ' +
                rightType.toString() + '.'
            );
        else if(leftType == DataType.STRING &&
            rightType != DataType.STRING)
            results.errors.set(
                this.mark,
                'Comparing string to ' + rightType.toString() +
                ' is not allowed.'
            );
        else if(leftType == DataType.BOOL &&
            (rightType != DataType.BOOL ||
                (DataType.isOfIntType(rightType) && unsafe)))
            results.errors.set(
                this.mark,
                'Comparing bool to ' + rightType.toString() +
                ' is not allowed.'
            );

        this.left.resolve(results, returnType, unsafe);
        this.right.resolve(results, returnType, unsafe);
    }

    public marker(): Token {
        return this.mark;
    }
}