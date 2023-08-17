import {
    BasicBlock,
    Function,
    FunctionType,
    GlobalValue,
    IRBuilder,
    Module,
    Type
} from "llvm-bindings";
import { DataType } from "./data_type";

import LLVMGlobalContext from "./llvm_context";

export default class YttriaRuntime {
    public static render(module: Module): Function {
        return Function.Create(
            FunctionType.get(
                Type.getInt32Ty(LLVMGlobalContext),
                [Type.getInt8PtrTy(LLVMGlobalContext)],
                true
            ),
            GlobalValue.LinkageTypes.ExternalLinkage,
            'printf',
            module
        );
    }

    public static iabs(module: Module, type: Type): Function {
        return Function.Create(
            FunctionType.get(type, [type], false),
            GlobalValue.LinkageTypes.ExternalLinkage,
            'abs',
            module
        );
    }

    public static fpabs(module: Module, type: DataType): Function {
        const llvmType: Type = type.getLLVMType();

        return Function.Create(
            FunctionType.get(llvmType, [llvmType], false),
            GlobalValue.LinkageTypes.ExternalLinkage,
            'fabs',
            module
        );
    }
}