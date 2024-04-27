import { IRBuilder, Module, Type, Value } from "llvm-bindings";
import { Token } from "../../tokenizer/token";
import { ASTResolveResults, ExpressionAST } from "../ast";

import ASTError from "../ast_exception";
import DataType from "../../compiler/data_type";
import YttriaRuntime from "../../compiler/yttria_runtime";

export default class ExprASTBinary implements ExpressionAST {
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

    private visitAdd(
        builder: IRBuilder,
        module: Module
    ): Value {
        const leftType: DataType =
            this.left.type();
        const rightType: DataType =
            this.right.type();

        if((DataType.isOfIntType(leftType) || DataType.isOfUIntType(leftType)) &&
            (DataType.isOfIntType(rightType) || DataType.isOfUIntType(rightType)))
            return builder.CreateIntCast(
                builder.CreateAdd(
                    this.left.visit(builder, module),
                    this.right.visit(builder, module)
                ),
                DataType.greaterIntegerType(
                    leftType, rightType
                ).getLLVMType(),
                true
            );
        else if((DataType.isOfIntType(leftType) || DataType.isOfUIntType(leftType)) &&
            DataType.isOfFloatType(rightType)) {
            const outputType: Type =
                rightType.getLLVMType();

            return builder.CreateFPCast(
                builder.CreateFAdd(
                    builder.CreateFPCast(
                        this.left.visit(builder, module),
                        outputType
                    ),
                    this.right.visit(builder, module)
                ),
                outputType
            );
        }
        else if(DataType.isOfFloatType(leftType) &&
            DataType.isOfFloatType(rightType))
            return builder.CreateFPCast(
                builder.CreateFAdd(
                    this.left.visit(builder, module),
                    this.right.visit(builder, module)
                ),
                DataType.greaterFloatType(
                    leftType,
                    rightType
                ).getLLVMType()
            );
        else if(DataType.isOfFloatType(leftType) &&
            (DataType.isOfIntType(rightType) || DataType.isOfUIntType(rightType))) {
            const outputType: Type =
                leftType.getLLVMType();

            return builder.CreateFAdd(
                this.left.visit(
                    builder,
                    module
                ),
                builder.CreateBitCast(
                    this.right.visit(
                        builder,
                        module
                    ),
                    outputType
                )
            );
        }
        else if(leftType == DataType.STRING &&
            rightType == DataType.STRING) {
            const strType: Type =
                DataType.STRING.getLLVMType();

                return builder.CreateCall(
                YttriaRuntime.concatStrStr(module),
                [
                    builder.CreateIntCast(
                        this.left.visit(
                            builder,
                            module
                        ),
                        strType,
                        true
                    ),
                    builder.CreateIntCast(
                        this.right.visit(
                            builder,
                            module
                        ),
                        strType,
                        true
                    ),
                ]
            );
        }
        else if((DataType.isOfIntType(leftType) || DataType.isOfUIntType(leftType)) &&
            rightType == DataType.STRING)
            return builder.CreateCall(
                YttriaRuntime.concatStrStr(module),
                [
                    builder.CreateCall(
                        YttriaRuntime.convertI2S(
                            module,
                            leftType.getLLVMType()
                        ),
                        [this.left.visit(builder,module)]
                    ),
                    this.right.visit(
                        builder,
                        module
                    )
                ]
            );
        else if(leftType == DataType.STRING &&
            (DataType.isOfIntType(rightType) || DataType.isOfUIntType(rightType)))
            return builder.CreateCall(
                YttriaRuntime.concatStrStr(module),
                [
                    this.left.visit(
                        builder,
                        module
                    ),
                    builder.CreateCall(
                        YttriaRuntime.convertI2S(
                            module,
                            rightType.getLLVMType()
                        ),
                        [this.right.visit(builder,module)]
                    )
                ]
            );
        else if(DataType.isOfFloatType(leftType) &&
            rightType == DataType.STRING)
            return builder.CreateCall(
                YttriaRuntime.concatStrStr(module),
                [
                    builder.CreateCall(
                        YttriaRuntime.convertF2S(
                            module,
                            leftType.getLLVMType()
                        ),
                        [this.left.visit(builder,module)]
                    ),
                    this.right.visit(
                        builder,
                        module
                    )
                ]
            );
        else if(leftType == DataType.STRING &&
            DataType.isOfFloatType(rightType))
            return builder.CreateCall(
                YttriaRuntime.concatStrStr(module),
                [
                    this.left.visit(
                        builder,
                        module
                    ),
                    builder.CreateCall(
                        YttriaRuntime.convertF2S(
                            module,
                            rightType.getLLVMType()
                        ),
                        [this.right.visit(builder,module)]
                    )
                ]
            );

        throw new ASTError('Invalid binary operation [' +
            leftType.toString() + '+' + rightType.toString() + ']');
    }

    private visitSub(
        builder: IRBuilder,
        module: Module
    ): Value {
        const leftType: DataType =
            this.left.type();
        const rightType: DataType =
            this.right.type();

        if((DataType.isOfIntType(leftType) || DataType.isOfUIntType(leftType)) &&
            (DataType.isOfIntType(rightType) || DataType.isOfUIntType(rightType)))
            return builder.CreateSub(
                this.left.visit(builder, module),
                this.right.visit(builder, module)
            );
        else if((DataType.isOfIntType(leftType) || DataType.isOfUIntType(leftType)) &&
            DataType.isOfFloatType(rightType))
            return builder.CreateFSub(
                builder.CreateFPCast(
                    this.left.visit(builder, module),
                    rightType.getLLVMType()
                ),
                this.right.visit(builder, module)
            );
        else if(DataType.isOfFloatType(leftType) &&
            DataType.isOfFloatType(rightType))
            return builder.CreateFSub(
                this.left.visit(builder, module),
                this.right.visit(builder, module)
            );
        else if(DataType.isOfFloatType(leftType) &&
            (DataType.isOfIntType(rightType) || DataType.isOfUIntType(rightType)))
            return builder.CreateFSub(
                this.left.visit(builder, module),
                builder.CreateFPCast(
                    this.right.visit(builder, module),
                    rightType.getLLVMType()
                )
            );

            throw new ASTError('Invalid binary operation [' +
            leftType.toString() + '-' + rightType.toString() + ']');
    }

    private visitDiv(
        builder: IRBuilder,
        module: Module
    ): Value {
        const leftType: DataType =
            this.left.type();
        const rightType: DataType =
            this.right.type();

        if(DataType.isOfIntType(leftType) &&
            DataType.isOfIntType(rightType))
            return builder.CreateSDiv(
                this.left.visit(builder, module),
                this.right.visit(builder, module)
            );
        else if(DataType.isOfUIntType(leftType) &&
            DataType.isOfUIntType(rightType))
            return builder.CreateUDiv(
                this.left.visit(builder, module),
                this.right.visit(builder, module)
            );
        else if((DataType.isOfIntType(leftType) || DataType.isOfUIntType(leftType)) &&
            DataType.isOfFloatType(rightType))
            return builder.CreateFDiv(
                builder.CreateFPCast(
                    this.left.visit(builder, module),
                    rightType.getLLVMType()
                ),
                this.right.visit(builder, module)
            );
        else if(DataType.isOfFloatType(leftType) &&
            DataType.isOfFloatType(rightType))
            return builder.CreateFDiv(
                this.left.visit(builder, module),
                this.right.visit(builder, module)
            );
        else if(DataType.isOfFloatType(leftType) &&
            (DataType.isOfIntType(rightType) || DataType.isOfUIntType(rightType)))
            return builder.CreateFDiv(
                this.left.visit(builder, module),
                builder.CreateFPCast(
                    this.right.visit(builder, module),
                    rightType.getLLVMType()
                )
            );

        throw new ASTError('Invalid binary operation [' +
            leftType.toString() + '/' + rightType.toString() + ']');
    }

    private visitMul(
        builder: IRBuilder,
        module: Module
    ): Value {
        const leftType: DataType =
            this.left.type();
        const rightType: DataType =
            this.right.type();

        if((DataType.isOfIntType(leftType) || DataType.isOfUIntType(leftType)) &&
            (DataType.isOfIntType(rightType) || DataType.isOfUIntType(rightType)))
            return builder.CreateMul(
                this.left.visit(builder, module),
                this.right.visit(builder, module)
            );
        else if((DataType.isOfIntType(leftType) || DataType.isOfUIntType(leftType)) &&
            DataType.isOfFloatType(rightType))
            return builder.CreateFMul(
                builder.CreateFPCast(
                    this.left.visit(builder, module),
                    rightType.getLLVMType()
                ),
                this.right.visit(builder, module)
            );
        else if(DataType.isOfFloatType(leftType) &&
            DataType.isOfFloatType(rightType))
            return builder.CreateFMul(
                this.left.visit(builder, module),
                this.right.visit(builder, module)
            );
        else if(DataType.isOfFloatType(leftType) &&
            (DataType.isOfIntType(rightType) || DataType.isOfUIntType(rightType)))
            return builder.CreateFMul(
                this.left.visit(builder, module),
                builder.CreateFPCast(
                    this.right.visit(builder, module),
                    rightType.getLLVMType()
                )
            );

        throw new ASTError('Invalid binary operation [' +
            leftType.toString() + '*' + rightType.toString() + ']');
    }

    private visitRem(
        builder: IRBuilder,
        module: Module
    ): Value {
        const leftType: DataType =
            this.left.type();
        const rightType: DataType =
            this.right.type();

        if(DataType.isOfIntType(leftType) &&
            DataType.isOfIntType(rightType))
            return builder.CreateSRem(
                this.left.visit(builder, module),
                this.right.visit(builder, module)
            );
        else if(DataType.isOfUIntType(leftType) &&
            DataType.isOfUIntType(rightType))
            return builder.CreateURem(
                this.left.visit(builder, module),
                this.right.visit(builder, module)
            );
        else if((DataType.isOfIntType(leftType) || DataType.isOfUIntType(leftType)) &&
            DataType.isOfFloatType(rightType))
            return builder.CreateFRem(
                builder.CreateFPCast(
                    this.left.visit(builder, module),
                    rightType.getLLVMType()
                ),
                this.right.visit(builder, module)
            );
        else if(DataType.isOfFloatType(leftType) &&
            DataType.isOfFloatType(rightType))
            return builder.CreateFRem(
                this.left.visit(builder, module),
                this.right.visit(builder, module)
            );
        else if(DataType.isOfFloatType(leftType) &&
            (DataType.isOfIntType(rightType) || DataType.isOfUIntType(rightType)))
            return builder.CreateFRem(
                this.left.visit(builder, module),
                builder.CreateFPCast(
                    this.right.visit(builder, module),
                    rightType.getLLVMType()
                )
            );

        throw new ASTError('Invalid binary operation [' +
            leftType.toString() + '%' + rightType.toString() + ']');
    }

    private visitLShr(
        builder: IRBuilder,
        module: Module
    ): Value {
        const leftType: DataType =
            this.left.type();
        const rightType: DataType =
            this.right.type();

        if(leftType == DataType.BOOL &&
            rightType == DataType.BOOL)
            return builder.CreateLShr(
                this.left.visit(builder, module),
                this.right.visit(builder, module)
            );

        throw new ASTError('Invalid binary operation [' +
            leftType.toString() + '>>>' + rightType.toString() + ']');
    }

    private visitAShr(
        builder: IRBuilder,
        module: Module
    ): Value {
        const leftType: DataType =
            this.left.type();
        const rightType: DataType =
            this.right.type();

        if((DataType.isOfIntType(leftType) || DataType.isOfUIntType(leftType)) &&
            (DataType.isOfIntType(rightType) || DataType.isOfUIntType(rightType)))
            return builder.CreateAShr(
                this.left.visit(builder, module),
                this.right.visit(builder, module)
            );

        throw new ASTError('Invalid binary operation [' +
            leftType.toString() + '>>' + rightType.toString() + ']');
    }

    private visitAShl(
        builder: IRBuilder,
        module: Module
    ): Value {
        const leftType: DataType =
            this.left.type();
        const rightType: DataType =
            this.right.type();

        if((DataType.isOfIntType(leftType) || DataType.isOfUIntType(leftType)) &&
            (DataType.isOfIntType(rightType) || DataType.isOfUIntType(rightType)))
            return builder.CreateShl(
                this.left.visit(builder, module),
                this.right.visit(builder, module)
            );

        throw new ASTError('Invalid binary operation [' +
            leftType.toString() + '<<' + rightType.toString() + ']');
    }

    private visitOr(
        builder: IRBuilder,
        module: Module
    ): Value {
        const leftType: DataType =
            this.left.type();
        const rightType: DataType =
            this.right.type();

        if(leftType == DataType.BOOL && rightType == DataType.BOOL)
            return builder.CreateOr(
                this.left.visit(builder, module),
                this.right.visit(builder, module)
            );

        throw new ASTError('Invalid binary operation [' +
            leftType.toString() + '||' + rightType.toString() + ']');
    }

    private visitAnd(
        builder: IRBuilder,
        module: Module
    ): Value {
        const leftType: DataType =
            this.left.type();
        const rightType: DataType =
            this.right.type();

        if(leftType == DataType.BOOL && rightType == DataType.BOOL)
            return builder.CreateAnd(
                this.left.visit(builder, module),
                this.right.visit(builder, module)
            );

        throw new ASTError('Invalid binary operation [' +
            leftType.toString() + '&&' + rightType.toString() + ']');
    }

    public visit(
        builder: IRBuilder,
        module: Module
    ): Value {
        if(this.operator == '+')
            return this.visitAdd(
                builder,
                module
            );
        else if(this.operator == '-')
            return this.visitSub(
                builder,
                module
            );
        else if(this.operator == '/')
            return this.visitDiv(
                builder,
                module
            );
        else if(this.operator == '*')
            return this.visitMul(
                builder,
                module
            );
        else if(this.operator == '%')
            return this.visitRem(
                builder,
                module
            );
        else if(this.operator == '>>>')
            return this.visitLShr(
                builder,
                module
            );
        else if(this.operator == '>>')
            return this.visitAShr(
                builder,
                module
            );
        else if(this.operator == '<<')
            return this.visitAShl(
                builder,
                module
            );
        else if(this.operator == '||')
            return this.visitOr(
                builder,
                module
            );
        else if(this.operator == '&&')
            return this.visitAnd(
                builder,
                module
            );

        throw new ASTError('Invalid operation.');
    }

    public type(): DataType {
        const a: DataType = this.left.type();
        const b: DataType = this.right.type();

        if(DataType.isOfIntType(a) &&
            DataType.isOfIntType(b))
            return DataType.greaterIntegerType(a, b);
        else if(DataType.isOfFloatType(a) &&
            DataType.isOfFloatType(b))
            return DataType.greaterFloatType(a, b);
        else if(DataType.isOfIntType(a) &&
            DataType.isOfFloatType(b))
            return b;
        else if(DataType.isOfFloatType(a) &&
            DataType.isOfIntType(b))
            return a;
        else if(this.operator == '+' && (
            (a == DataType.STRING &&
            b == DataType.STRING) ||
            (a == DataType.STRING &&
            (DataType.isOfIntType(b) || DataType.isOfUIntType(b))) ||
            ((DataType.isOfIntType(a) || DataType.isOfUIntType(a)) &&
            b == DataType.STRING)) ||
            (a == DataType.STRING &&
            DataType.isOfFloatType(b)) ||
            (DataType.isOfFloatType(a) &&
            b == DataType.STRING))
            return DataType.STRING;
        else if(this.operator == '-' ||
            this.operator == '/' ||
            this.operator == '*' ||
            this.operator == '%'
        ) {
            if(DataType.isOfIntType(a) &&
                DataType.isOfIntType(b))
                return DataType.greaterIntegerType(a, b);
            else if(DataType.isOfUIntType(a) &&
                DataType.isOfUIntType(b))
                return DataType.greaterUIntegerType(a, b);
            else if(DataType.isOfFloatType(a) &&
                DataType.isOfFloatType(b))
                return DataType.greaterFloatType(a, b);
        }
        else if(this.operator == '>>>' ||
            this.operator == '>>' ||
            this.operator == '<<') {    
            if(DataType.isOfIntType(a) && DataType.isOfIntType(b))
                return DataType.greaterIntegerType(a, b);
            else if(DataType.isOfUIntType(a) && DataType.isOfUIntType(b))
                return DataType.greaterUIntegerType(a, b);
        }
        else if((this.operator == '||' ||
            this.operator == '&&') &&
            a == DataType.BOOL && b == DataType.BOOL)
            return DataType.BOOL;

        throw new ASTError("Incompatible types for binary operation.");
    }

    private resolveAdd(
        leftType: DataType,
        rightType: DataType,
        results: ASTResolveResults,
        unsafe: boolean
    ): void {
        if(DataType.isOfIntType(leftType) &&
            DataType.isOfIntType(rightType) &&
            leftType != rightType &&
            !unsafe)
            results.warnings.set(
                this.marker(),
                'Loose integer binary addition ' +
                'operation with ' + leftType.toString() +
                ' and ' + rightType.toString() + '.'
            );
        else if(DataType.isOfFloatType(leftType) &&
            DataType.isOfFloatType(rightType) &&
            leftType != rightType &&
            !unsafe)
            results.warnings.set(
                this.marker(),
                'Loose floating-point binary addition ' +
                'operation with ' + leftType.toString() +
                ' and ' + rightType.toString() + '.'
            );
        else if(DataType.isOfIntType(leftType) &&
            DataType.isOfFloatType(rightType) &&
            !unsafe)
            results.warnings.set(
                this.marker(),
                'Loose operation with \'+\' on type' +
                leftType.toString() + ' and ' +
                rightType.toString()
            );
        else if(DataType.isOfFloatType(leftType) &&
            DataType.isOfIntType(rightType) &&
            !unsafe)
            results.warnings.set(
                this.marker(),
                'Loose operation with \'+\' on type' +
                leftType.toString() + ' and ' +
                rightType.toString()
            );
        else if((!DataType.isOfIntType(leftType) &&
            !DataType.isOfFloatType(leftType) &&
            leftType != DataType.STRING) ||
            ((!DataType.isOfIntType(rightType) &&
            !DataType.isOfFloatType(rightType) &&
            rightType != DataType.STRING)))
            results.errors.set(
                this.marker(),
                'Operator \'+\' cannot be used ' +
                'with type of ' + leftType.toString() +
                'and type of ' + rightType.toString() + '.'
            );
    }

    private resolveOperation(
        leftType: DataType,
        rightType: DataType,
        results: ASTResolveResults,
        unsafe: boolean
    ): void {
        if(DataType.isOfIntType(leftType) &&
            DataType.isOfIntType(rightType) &&
            leftType != rightType &&
            !unsafe)
            results.warnings.set(
                this.marker(),
                'Loose integer binary \'' + this.operator +
                '\' operation with ' + leftType.toString() +
                ' and ' + rightType.toString() + '.'
            );
        else if(DataType.isOfFloatType(leftType) &&
            DataType.isOfFloatType(rightType) &&
            leftType != rightType &&
            !unsafe)
            results.warnings.set(
                this.marker(),
                'Loose floating-point binary \'' +
                this.operator + '\' operation with ' +
                leftType.toString() + ' and ' +
                rightType.toString() + '.'
            );
        else if(DataType.isOfIntType(leftType) &&
            DataType.isOfFloatType(rightType) &&
            !unsafe)
            results.warnings.set(
                this.marker(),
                'Loose operation with \'' + this.operator +
                '\' on type' + leftType.toString() +
                ' and ' + rightType.toString()
            );
        else if(DataType.isOfFloatType(leftType) &&
            DataType.isOfIntType(rightType) &&
            !unsafe)
            results.warnings.set(
                this.marker(),
                'Loose operation with \'' + this.operator +
                '\' on type' + leftType.toString() +
                ' and ' + rightType.toString() + '.'
            );
        else if((!DataType.isOfIntType(leftType) &&
            !DataType.isOfFloatType(leftType)) ||
            ((!DataType.isOfIntType(rightType) &&
            !DataType.isOfFloatType(rightType))))
            results.errors.set(
                this.marker(),
                'Operator \'' + this.operator +
                '\' cannot be used with type of ' +
                leftType.toString() + 'and type of ' +
                rightType.toString() + '.'
        );
    }

    public resolveExpressions(
        results: ASTResolveResults,
        returnType: DataType,
        unsafe: boolean
    ): void {
        this.left.resolve(
            results,
            returnType,
            unsafe
        );

        this.right.resolve(
            results,
            returnType,
            unsafe
        );
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

        if(this.operator == '+')
            this.resolveAdd(
                leftType,
                rightType,
                results,
                unsafe
            );
        else if(this.operator == '-' ||
            this.operator == '/' ||
            this.operator == '*' ||
            this.operator == '%')
            this.resolveOperation(
                leftType,
                rightType,
                results,
                unsafe
            );
        else if(this.operator == '^' &&
            !DataType.isOfIntType(leftType) &&
            !DataType.isOfIntType(rightType) &&
            !unsafe)
            results.warnings.set(
                this.marker(),
                'Invalid \'^\' operation with ' +
                leftType.toString() + ' and ' +
                rightType.toString()
            );
        else if((this.operator == '<<' ||
            this.operator == '>>') &&
            (!DataType.isOfIntType(leftType) &&
            !DataType.isOfIntType(rightType)))
            results.errors.set(
                this.marker(),
                'Invalid binary shift (' + this.operator +
                ') operation with ' + leftType.toString() +
                ' and ' + rightType.toString()
            );
        else if((this.operator == '||' ||
            this.operator == '&&') &&
            !(leftType == DataType.BOOL &&
            rightType == DataType.BOOL))
            results.errors.set(
                this.marker(),
                'Invalid logic operator (' + this.operator +
                ') operation with ' + leftType.toString() +
                ' and ' + rightType.toString()
            );
    }

    public marker(): Token {
        return this.mark;
    }
}
