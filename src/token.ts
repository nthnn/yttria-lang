import TokenTypes from "./token_types";

interface Token {
    image: string;
    filename: string;
    column: number;
    line: number;
    type: TokenTypes;
}

export default Token;