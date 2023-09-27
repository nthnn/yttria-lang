import { Type } from "llvm-bindings";
import LLVMGlobalContext from "./llvm_context";

export default class DataType {
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
        new DataType("string", 0, Type.getInt8PtrTy(LLVMGlobalContext));
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

    public static UI4: DataType =
        new DataType("u4", 4, Type.getIntNTy(LLVMGlobalContext, 4));
    public static UI8: DataType =
        new DataType("u8", 8, Type.getIntNTy(LLVMGlobalContext, 8));
    public static UI16: DataType =
        new DataType("u16", 16, Type.getInt16Ty(LLVMGlobalContext));
    public static UI32: DataType =
        new DataType("u32", 32, Type.getInt32Ty(LLVMGlobalContext));
    public static UI64: DataType =
        new DataType("u64", 64, Type.getInt64Ty(LLVMGlobalContext));

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

    public static greaterUIntegerType(
        a: DataType,
        b: DataType
    ): DataType {
        if(a == b)
            return a;
    
        switch(a) {
            case DataType.UI4:
                return b;
            case DataType.UI8:
                return (b == DataType.UI4) ?
                    a : b;
            case DataType.UI16:
                return (b == DataType.UI64) ?
                    b : a;
            case DataType.UI64:
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

    public static isOfUIntType(
        type: DataType
    ): boolean {
        switch(type) {
            case DataType.UI4:
            case DataType.UI8:
            case DataType.UI16:
            case DataType.UI32:
            case DataType.UI64:
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
