import { Function, FunctionType, GlobalValue, Module, Type } from "llvm-bindings";
import LLVMGlobalContext from "./llvm_context";

class CStdlib {
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
}

export default CStdlib;