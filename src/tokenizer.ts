import Token from "./token";

interface TokenizerError {
    message: string;
    column: number;
    line: number;
}

interface TokenizerResult {
    tokens: Array<Token>;
    errors: Array<TokenizerError>;
}

class TokenizerUtil {
    public static isBinary(char: string): boolean {
        return char[0] == '0' || char[0] == '1';
    }
}

class Tokenizer {
    private filename: string;
    private source: string;

    public constructor(_filename: string, _source: string) {
        this.filename = _filename;
        this.source = _source;

        console.log(`Initialed tokenizer for ${this.filename}`);
    }

    public scan(): TokenizerResult {
        const results: TokenizerResult = {
            errors: [],
            tokens: []
        };

        console.log(`Starting tokenization for ${this.filename}...`);

        return results;
    }
}

export default Tokenizer;