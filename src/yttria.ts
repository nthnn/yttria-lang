import {
    BasicBlock,
    ConstantInt,
    Function,
    FunctionType,
    IRBuilder,
    Module,
    verifyModule
} from 'llvm-bindings';

import { Token, TokenUtil } from './token';
import { Tokenizer, TokenizerResult } from './tokenizer';
import { ExprASTFloat, ExprASTInt, ExprASTString, ExprASTUnary } from './ast_expr';
import { hideBin } from 'yargs/helpers';

import colors from 'colors';
import LLVMGlobalContext from './llvm_context';
import YttriaRuntime from './yttria_runtime';
import yargs from 'yargs';
import YttriaUtil from './util';
import { ASTNode, ExpressionAST } from './ast';

function tokenizerTest() {
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
}

function llvmTest() {
    const nullToken = null as unknown as Token;

    const module: Module = new Module(
        YttriaUtil.generateRandomHash(),
        LLVMGlobalContext
    );
    const builder: IRBuilder = new IRBuilder(LLVMGlobalContext);

    const expr1: ExprASTString = new ExprASTString(nullToken, "Value is '%g'.\n");
    const expr2: ExprASTFloat = new ExprASTFloat(nullToken, 3.14, 64);
    const expr3: ExprASTUnary = new ExprASTUnary(nullToken, '-', expr2);

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
        YttriaRuntime.render(module),
        [
            expr1.visit(builder, module, main),
            expr3.visit(builder, module, main)
        ]
    );
    builder.CreateRet(ConstantInt.get(builder.getInt32Ty(), 0, true));

    const verifyResult = verifyModule(module);
    if(verifyResult)
        return;

    console.log('\nModule:\n\n' + module.print());
}

function printBanner(args: any) {
    console.log();
    console.log('┌──────────────────────────────────────┐');
    console.log('│                                      │');

    // Here comes the wizardry.
    console.log('│' + '  ▀▀▌' + '───────'.gray + '▐▀▀' + '                       │');
    console.log('│' + '  ▄▀' + '░'.blue + '◌'.bold + '░░░░░░░'.blue + '▀▄' + '  ┓┏            •'.cyan.bold + '      │');
    console.log('│' + ' ▐' + '░░'.blue + '◌'.bold + '░'.blue + '▄▀██▄█' + '░░░'.blue + '▌' + ' ┗┫  ╋  ╋  ┏┓  ┓  ┏┓'.cyan.bold + '  │');
    console.log('│' + ' ▐' + '░░░'.blue + '▀████▀▄' + '░░░'.blue + '▌' + ' ┗┛  ┗  ┗  ┛   ┗  ┗┻'.cyan.bold + '  │');
    console.log('│' + ' ▐' + '░░░░░░░░░░░░░'.blue + '▌ ' + 'Programming Language'.bgRed + ' │');
    console.log('│' + '  ▀▄▄▄▄▄▄▄▄▄▄▄▀' + '  v0.0.1'.yellow.bold + '               │');
    console.log('│                                      │');

    if(args.help || args.h ||
        args._.length == 0) {

        console.log('├──────────────────────────────────────┤');
        console.log('│ Use ' + '-h'.italic + ' to print help screen.         │');
        console.log('│                                      │');
        console.log('│ For more details, visit:             │');
        console.log('│ ' + 'https://nthnn.github.io/yttria-lang'.underline + '  │');
        console.log('└──────────────────────────────────────┘');
        console.log();
    }
    else console.log('└──────────────────────────────────────┘\n');
}

function main(): void {
    const args = yargs(hideBin(process.argv))
        .option('help', {
            alias: 'h',
            type: 'boolean'
        })
        .showHelp(()=> { })
        .exitProcess(false)
        .argv;

    colors.enable();
    //printBanner(args);
    llvmTest();
}

main();