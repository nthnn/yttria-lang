import { Token, TokenUtil } from "./token";
import TokenImages from "./token_defs";
import TokenType from "./token_types";

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
    public static isWhitespace(char: string): boolean {
        switch(char) {
            case ' ':
            case '\n':
            case '\r':
            case '\t':
                return true;
        }

        return false;
    }

    public static isDigit(char: string): boolean {
        return /^[0-9]+$/.test(char);
    }

    public static isBinary(char: string): boolean {
        return char === '0' || char === '1';
    }

    public static isOctadecimal(char: string): boolean {
        return /^[0-7]+$/.test(char);
    }

    public static isHexadecimal(char: string): boolean {
        return /^[0-9A-Fa-f]+$/.test(char);
    }

    public static isIdentifier(char: string): boolean {
        return /^[a-zA-Z]+$/.test(char);
    }

    public static isKeyword(image: string): boolean {
        return TokenImages.indexOf(image) != -1;
    }
}

class Tokenizer {
    private filename: string;
    private source: string;

    private pos: number = 0;
    private column: number = 1;
    private line: number = 1;

    public constructor(_filename: string, _source: string) {
        this.filename = _filename;
        this.source = _source;

        console.log(`Initialed tokenizer for ${this.filename}`);
    }

    private current(): string {
        return this.source.charAt(this.pos);
    }

    private advance(): void {
        this.pos++;
    }

    private consume(): string {
        let char: string = this.current();

        this.advance();
        this.column++;

        return char;
    }

    private isAtEnd(): boolean {
        return this.pos == this.source.length;
    }

    public scan(): TokenizerResult {
        const results: TokenizerResult = {
            errors: [],
            tokens: []
        };

        console.log(`Starting tokenization for ${this.filename}...`);
        while(true) {
            if(this.isAtEnd())
                break;

            if(TokenizerUtil.isWhitespace(this.current())) {
                if(this.current() == '\n') {
                    this.column = 1;
                    this.line++;
                }
                else this.column++;

                this.advance();
            }
            else if(TokenizerUtil.isIdentifier(this.current())) {
                var image: string = this.consume();
                const column = this.column - 1;

                while(!this.isAtEnd() &&
                    (TokenizerUtil.isIdentifier(this.current()) ||
                     TokenizerUtil.isDigit(this.current())))
                    image += this.consume();

                results.tokens.push(
                    TokenUtil.newToken(this.filename, image, 
                        column,
                        this.line,
                        TokenizerUtil.isKeyword(image) ?
                            TokenType.TOKEN_KEYWORD :
                            TokenType.TOKEN_IDENTIFIER
                    )
                );
            }
        }

        return results;
    }
}

export { Tokenizer, TokenizerResult };