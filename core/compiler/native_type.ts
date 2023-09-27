import { Type } from "llvm-bindings";
import LLVMGlobalContext from "./llvm_context";
import DataType from "./data_type";

export default class LLVMDataType {
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

    private static uintTypeMap: Map<number, [Type, DataType]> =
        new Map<number, [Type, DataType]>([
        [4, [Type.getIntNTy(LLVMGlobalContext, 4), DataType.UI4]],
        [8, [Type.getInt8Ty(LLVMGlobalContext), DataType.UI8]],
        [16, [Type.getInt16Ty(LLVMGlobalContext), DataType.UI16]],
        [32, [Type.getInt32Ty(LLVMGlobalContext), DataType.UI32]],
        [64, [Type.getInt64Ty(LLVMGlobalContext),DataType.UI64]],
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

    public static getUIntType(bit: number): Type {
        if(LLVMDataType.uintTypeMap.has(bit))
            return LLVMDataType.uintTypeMap.get(bit)![0];

        return Type.getIntNTy(LLVMGlobalContext, 0);
    }

    public static getUIntDataType(bit: number): DataType {
        switch(bit) {
            case 4:
                return DataType.UI4;
            case 8:
                return DataType.UI8;
            case 16:
                return DataType.UI16;
            case 32:
                return DataType.UI32;
            case 64:
                return DataType.UI64;
        }

        return DataType.UNKNOWN;
    }
}