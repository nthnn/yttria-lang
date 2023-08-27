import { Type } from "llvm-bindings";
import LLVMGlobalContext from "./llvm_context";

class DataType {
    private name: string;
    private bit: number;
    private llvmType: Type;

    public constructor(
        name: string,
        bit: number,
        llvmType: Type | undefined
    ) {
        this.name = name;
        this.bit = bit;
        this.llvmType = llvmType as Type;
    }

    public bitSize(): number {
        return this.bit;
    }

    public toString(): string {
        return this.name;
    }

    public getLLVMType(): Type {
        return this.llvmType;
    }

    public static UNKNOWN: DataType =
        new DataType("unknown", 0, undefined);
    public static VOID: DataType =
        new DataType("void", 0, Type.getVoidTy(LLVMGlobalContext));
    public static STRING: DataType =
        new DataType("string", 0, undefined);
    public static BOOL: DataType =
        new DataType("bool", 1, undefined);

    public static I4: DataType =
        new DataType("i4", 4, Type.getIntNTy(LLVMGlobalContext, 4));
    public static I8: DataType =
        new DataType("i8", 8, Type.getIntNTy(LLVMGlobalContext, 8));
    public static I16: DataType =
        new DataType("i16", 16, Type.getInt16Ty(LLVMGlobalContext));
    public static I32: DataType =
        new DataType("i32", 32, Type.getInt32Ty(LLVMGlobalContext));
    public static I64: DataType =
        new DataType("i64", 64, Type.getInt64Ty(LLVMGlobalContext));

    public static F32: DataType =
        new DataType("f32", 32, Type.getFloatTy(LLVMGlobalContext));
    public static F64: DataType =
        new DataType("f64", 64, Type.getDoubleTy(LLVMGlobalContext));

    public static greaterIntegerType(
        a: DataType,
        b: DataType
    ): DataType {
        if(a == b)
            return a;
    
        switch(a) {
            case DataType.I4:
                return b;
            case DataType.I8:
                return (b == DataType.I4) ?
                    a : b;
            case DataType.I16:
                return (b == DataType.I64) ?
                    b : a;
            case DataType.I64:
                return a;
        }
    
        return b;
    }

    public static greaterFloatType(
        a: DataType,
        b: DataType
    ) {
        return a != DataType.F32 ? a : b;
    }

    public static isOfIntType(
        type: DataType
    ): boolean {
        switch(type) {
            case DataType.I4:
            case DataType.I8:
            case DataType.I16:
            case DataType.I32:
            case DataType.I64:
                return true;
        }

        return false;
    }

    public static isOfFloatType(
        type: DataType
    ): boolean {
        return type == DataType.F32 ||
            type == DataType.F64;
    }
}

class LLVMDataType {
    private static floatTypeMap: Map<number, [Type, DataType]> =
        new Map<number, [Type, DataType]>([
        [32, [Type.getFloatTy(LLVMGlobalContext), DataType.F32]],
        [64, [Type.getDoubleTy(LLVMGlobalContext), DataType.F64]],
    ]);

    private static intTypeMap: Map<number, [Type, DataType]> =
        new Map<number, [Type, DataType]>([
        [4, [Type.getIntNTy(LLVMGlobalContext, 4), DataType.I4]],
        [8, [Type.getInt8Ty(LLVMGlobalContext), DataType.I8]],
        [16, [Type.getInt16Ty(LLVMGlobalContext), DataType.I16]],
        [32, [Type.getInt32Ty(LLVMGlobalContext), DataType.I32]],
        [64, [Type.getInt64Ty(LLVMGlobalContext),DataType.I64]],
    ]);

    public static getFloatType(
        bit: number
    ): Type {
        if(LLVMDataType.floatTypeMap.has(bit))
            return LLVMDataType.floatTypeMap.get(bit)![0];

        return Type.getFloatTy(LLVMGlobalContext);
    }

    public static getFloatDataType(
        bit: number
    ): DataType {

        return bit == 32 ?
            DataType.F32 : DataType.F64;
    }

    public static getIntType(bit: number): Type {
        if(LLVMDataType.intTypeMap.has(bit))
            return LLVMDataType.intTypeMap.get(bit)![0];

        return Type.getIntNTy(LLVMGlobalContext, 0);
    }

    public static getIntDataType(bit: number): DataType {
        switch(bit) {
            case 4:
                return DataType.I4;
            case 8:
                return DataType.I8;
            case 16:
                return DataType.I16;
            case 32:
                return DataType.I32;
            case 64:
                return DataType.I64;
        }

        return DataType.UNKNOWN;
    }
}

export {
    DataType,
    LLVMDataType
};