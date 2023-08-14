import {
    BasicBlock,
    ConstantInt,
    Function,
    FunctionType,
    IRBuilder,
    Module,
    verifyModule
} from 'llvm-bindings';

import { TokenUtil } from './token';
import { Tokenizer, TokenizerResult } from './tokenizer';
import { ExprASTString } from './ast_expr';

import CStdlib from './cstdlib';
import LLVMGlobalContext from './llvm_context';

function main(): void {
    console.log('Yttria Programming Language Compiler v0.0.1');

    var tokenizer = new Tokenizer(
        '<anonymous>',
        '#hello\nsub main\n0b0101011 0xcafebabe hh 3.14 "Hello\\tworld!" +++ <<< >>>'
    );
    var tokenizerResult: TokenizerResult = tokenizer.scan();

    if(tokenizerResult.tokens.length != 0) {
        console.log('Tokens:');
        tokenizerResult.tokens.forEach(function(token) {
            console.log(TokenUtil.toString(token));
        });
    }

    if(tokenizerResult.errors.length != 0) {
        console.log('\nErrors:');
        tokenizerResult.errors.forEach(function(error) {
            console.log('[line ' + error.line + ', column ' + error.column + '] ' + error.message);
        });
    }

    const module: Module = new Module('test', LLVMGlobalContext);
    const builder: IRBuilder = new IRBuilder(LLVMGlobalContext);

    const expr1: ExprASTString = new ExprASTString("Value is '%s'");
    const expr2: ExprASTString = new ExprASTString("Hello, world!");

    const main: BasicBlock = BasicBlock.Create(
        LLVMGlobalContext,
        'entry',
        Function.Create(
            FunctionType.get(
                builder.getInt32Ty(),
                [],
                false
            ),
            Function.LinkageTypes.ExternalLinkage,
            'main',
            module
        )
    );

    builder.SetInsertPoint(main);
    builder.CreateCall(
        CStdlib.render(module),
        [
            expr1.visit(builder, module, main),
            expr2.visit(builder, module, main)
        ],
        'printfCall',
    );
    builder.CreateRet(ConstantInt.get(builder.getInt32Ty(), 0, true));

    const verifyResult = verifyModule(module);
    if(verifyResult) {
        console.log('LLVM Verification:\n' + verifyResult);
        return;
    }

    console.log('\nModule:\n\n' + module.print());
}

main();