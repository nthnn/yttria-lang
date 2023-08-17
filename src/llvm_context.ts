import { LLVMContext } from "llvm-bindings"

const LLVMGlobalContext: LLVMContext =
    new LLVMContext();

export default LLVMGlobalContext;