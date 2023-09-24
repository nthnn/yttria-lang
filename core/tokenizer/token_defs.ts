const TokenImages: Array<string> = [
    'ui4', 'ui8', 'ui16', 'ui32',
    'ui64', 'i4', 'i8', 'i16',
    'i32', 'i64', 'f32', 'f64',
    'bool', 'string',

    'true', 'false', 'nil', 'main',
    'render', 'return', 'defer'
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