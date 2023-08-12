import Tokenizer from "./tokenizer";

function main(): void {
    console.log('Zync Programming Language Compiler v0.0.1');

    var tokenizer = new Tokenizer('<anonymous>', 'sub main() {}');
    tokenizer.scan();
}

main();