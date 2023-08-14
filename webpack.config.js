const path = require('path');

module.exports = {
    mode: 'production',
    entry: {
        main: './src/main.ts',
    },
    output: {
        path: path.resolve(__dirname, './build'),
        clean: true,
        filename: 'yttria.js'
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader"
            }
        ]
    }
};