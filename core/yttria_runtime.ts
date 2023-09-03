import llvm, {
    Function,
    FunctionType,
    GlobalValue,
    Module,
    Type
} from "llvm-bindings";
import { DataType } from "./data_type";

import LLVMGlobalContext from "./llvm_context";
import { CompileTarget } from "./project_structure";

export default class YttriaRuntime {
    public static render(
        module: Module
    ): Function {
        if(CompileTarget.projectType == 'micro')
            return Function.Create(
                FunctionType.get(
                    Type.getVoidTy(LLVMGlobalContext),
                    [Type.getInt8PtrTy(LLVMGlobalContext)],
                    false
                ),
                GlobalValue.LinkageTypes.ExternalLinkage,
                '__yttria_uart_print',
                module
            );

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

    public static uartWait(
        module: Module,
    ): Function {
        return Function.Create(
            FunctionType.get(
                Type.getVoidTy(LLVMGlobalContext),
                [],
                false
            ),
            GlobalValue.LinkageTypes.ExternalLinkage,
            '__yttria_uart_wait',
            module
        );
    }

    public static usartInit(
        module: Module,
    ): Function {
        return Function.Create(
            FunctionType.get(
                Type.getVoidTy(LLVMGlobalContext),
                [Type.getInt16Ty(LLVMGlobalContext)],
                false
            ),
            GlobalValue.LinkageTypes.ExternalLinkage,
            '__yttria_uart_init',
            module
        );
    }

    public static iabs(
        module: Module,
        type: Type
    ): Function {
        return Function.Create(
            FunctionType.get(type, [type], false),
            GlobalValue.LinkageTypes.ExternalLinkage,
            'abs',
            module
        );
    }

    public static fpabs(
        module: Module,
        type: DataType
    ): Function {
        const llvmType: Type = type.getLLVMType();

        return Function.Create(
            FunctionType.get(
                llvmType,
                [llvmType],
                false
            ),
            GlobalValue.LinkageTypes.ExternalLinkage,
            'fabs', module
        );
    }

    public static concatStrStr(
        module: Module
    ): Function {
        const llvmStringType: Type =
            DataType.STRING.getLLVMType();

        return Function.Create(
            FunctionType.get(
                llvmStringType,
                [
                    llvmStringType,
                    llvmStringType
                ],
                false
            ),
            GlobalValue.LinkageTypes.ExternalLinkage,
            '__yttria_concat_str',
            module
        );
    }

    public static convertI2S(
        module: Module,
        outType: Type
    ): Function {
        const stringType: Type =
            DataType.STRING.getLLVMType();

            return Function.Create(
            FunctionType.get(
                stringType,
                [
                    outType,
                    stringType
                ],
                false
            ),
            GlobalValue.LinkageTypes.ExternalLinkage,
            '__yttria_conv_i2s',
            module
        );
    }

    public static convertF2S(
        module: Module,
        outType: Type
    ): Function {
        const stringType: Type =
            DataType.STRING.getLLVMType();

            return Function.Create(
            FunctionType.get(
                stringType,
                [
                    outType,
                    stringType
                ],
                false
            ),
            GlobalValue.LinkageTypes.ExternalLinkage,
            '__yttria_conv_f2s',
            module
        );
    }
}