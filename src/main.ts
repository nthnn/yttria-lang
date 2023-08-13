import { TokenUtil } from "./token";
import { Tokenizer, TokenizerResult } from "./tokenizer";

function main(): void {
    console.log('Zync Programming Language Compiler v0.0.1');

    var tokenizer = new Tokenizer('<anonymous>', 'sub main');
    var token: TokenizerResult = tokenizer.scan();

    token.tokens.forEach(function(value) {
        console.log(TokenUtil.toString(value));
    });
}

main();