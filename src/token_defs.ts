const TokenImages: Array<string> = [
    'i4', 'i8', 'i16', 'i32', 'i64',
    'f32', 'f64', 'bool', 'string',

    'true', 'false', 'nil', 'nan',
    'sub', 'main', 'render',
    'return'
];

const TokenOperators: Array<string> = [
    '+', '-', '/', '*', '%', '=',
    '==', '!=', '^', '&', '&&', ',',
    '.', '(', ')', '[', ']', ':',
    '{', '}', '|', '||', '<', '<<',
    '<=', '>', '>=', '>>', '?', ';'
];

export {
    TokenImages,
    TokenOperators
};