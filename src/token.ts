import TokenType from "./token_types";

interface Token {
    image: string;
    filename: string;
    column: number;
    line: number;
    type: TokenType;
}

class TokenUtil {
    public static newToken(filename: string, image: string, column: number, line: number, type: TokenType): Token {
        return {
            filename: filename,
            image: image,
            column: column,
            line: line,
            type: type
        };
    }

    public static toString(token: Token) {
        return '[line ' + token.line +
            ', column ' + token.column +
            '] ' + token.image +
            ' (' + token.filename + ')';
    }
}

export { Token, TokenUtil };