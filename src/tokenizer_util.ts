import { TokenImages, TokenOperators } from "./token_defs";

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

export default TokenizerUtil;