import { TokenUtil } from './token';
import { Tokenizer, TokenizerResult } from './tokenizer';

function main(): void {
    console.log('Zync Programming Language Compiler v0.0.1');

    var tokenizer = new Tokenizer(
        '<anonymous>',
        '#hello\nsub main\n0b0101011 0xcafebabe hh 3.14'
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

main();