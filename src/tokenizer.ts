import { error } from 'console';
import { Token, TokenUtil } from './token';
import { TokenImages, TokenOperators } from './token_defs';
import TokenType from './token_types';

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
        return char == '0' || char == '1';
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

    public static isOperator(image: string): boolean {
        return TokenOperators.indexOf(image) != -1;
    }
}

class Tokenizer {
    private filename: string;
    private source: string;

    private pos: number = 0;
    private column: number = 1;
    private line: number = 1;

    private results: TokenizerResult = {
        errors: [],
        tokens: []
    };

    public constructor(_filename: string, _source: string) {
        this.filename = _filename;
        this.source = _source;

        console.log(`Initialized tokenizer for ${this.filename}`);
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

    private pushToken(image: string, type: TokenType): void {
        this.results.tokens.push(
            TokenUtil.newToken(
                this.filename,
                image, 
                this.column - image.length,
                this.line,
                type
            )
        );
    }

    private consumeWhitespace(): void {
        if(this.current() == '\n') {
            this.column = 1;
            this.line++;
        }
        else this.column++;

        this.advance();
    }

    private consumeByValidator(
        validator: (_: string)=> boolean,
        validatorName: string,
        callback: ()=> void): void {

        while(!this.isAtEnd())
            if(validator(this.current()))
                callback();
            else if(TokenizerUtil.isWhitespace(this.current()))
                break;
            else {
                if(validator == TokenizerUtil.isDigit &&
                    this.current() == '.')
                    break;
                this.results.errors.push({
                    message: 'Expecting ' +
                        validatorName + '.',
                    line: this.line,
                    column: this.column
                });

                break;
            }
    }

    private consumeDigit(): string {
        var image: string = '';

        this.consumeByValidator(
            TokenizerUtil.isDigit,
            'digit',
            ()=> image += this.consume()
        );
        
        if(this.current() == '.')
            image += this.consume();

        this.consumeByValidator(
            TokenizerUtil.isDigit,
            'digit',
            ()=> image += this.consume()
        );

        return image;
    }

    private consumeBinary(): string {
        var image: string = this.consume();

        this.consumeByValidator(
            TokenizerUtil.isBinary,
            'binary',
            ()=> image += this.consume()
        );

        return image;
    }

    private consumeOctadecimal(): string {
        var image: string = this.consume();

        this.consumeByValidator(
            TokenizerUtil.isOctadecimal,
            'octadecimal',
            ()=> image += this.consume()
        );

        return image;
    }

    private consumeHexadecimal(): string {
        var image: string = this.consume();

        this.consumeByValidator(
            TokenizerUtil.isHexadecimal,
            'hexadecimal',
            ()=> image += this.consume()
        );

        return image;
    }

    private consumeNumber(): void {
        var image: string = this.consume();

        if(image == '0') {
            if(this.current() == 'b')
                image += this.consumeBinary();
            else if(this.current() == 'o')
                image += this.consumeOctadecimal();
            else if(this.current() == 'x')
                image += this.consumeHexadecimal();
            else image += this.consumeDigit();
        }
        else image += this.consumeDigit();

        this.pushToken(image, TokenType.TOKEN_DIGIT);
    }

    private consumeComment(): void {
        while(!this.isAtEnd() &&
        this.current() != '\n')
            this.consume();
    }

    private consumeIdentifier(): void {
        var image: string = this.consume();

        while(!this.isAtEnd() &&
            (TokenizerUtil.isIdentifier(this.current()) ||
             TokenizerUtil.isDigit(this.current())))
            image += this.consume();

        this.pushToken(image, TokenizerUtil.isKeyword(image) ?
            TokenType.TOKEN_KEYWORD :
            TokenType.TOKEN_IDENTIFIER
        );
    }

    private consumeString(): void {
        let sign: string = this.consume();
        var stringContent: string = '';

        while(!this.isAtEnd())
            if(this.current() == sign) {
                this.consume();
                break;
            }
            else if(this.current() == '\n') {
                this.results.errors.push({
                    message: "Unclosed literal encountered.",
                    line: this.line,
                    column: (this.column - stringContent.length) - 1
                });

                this.consume();
            }
            else stringContent += this.consume();

        this.results.tokens.push(
            TokenUtil.newToken(
                this.filename,
                stringContent,
                (this.column - stringContent.length) - 2,
                this.line,
                TokenType.TOKEN_STRING
            )
        );
    }

    public scan(): TokenizerResult {
        while(true) {
            if(this.isAtEnd())
                break;

            if(TokenizerUtil.isWhitespace(this.current()))
                this.consumeWhitespace();
            else if(this.current() == '#')
                this.consumeComment();
            else if(this.current() == '\'' ||
                this.current() == '\"')
                this.consumeString();
            else if(TokenizerUtil.isDigit(this.current()))
                this.consumeNumber();
            else if(TokenizerUtil.isIdentifier(this.current()))
                this.consumeIdentifier();
            else this.results.errors.push({
                message: `Unidentified '${this.consume()}' character encountered.`,
                column: this.column,
                line: this.line
            });
        }

        return this.results;
    }
}

export { Tokenizer, TokenizerResult };