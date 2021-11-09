const path = require("path");
const fs = require("fs");

module.exports = {
    entry: "./src/index.ts",

    output: {
        path: path.resolve(__dirname, "../dist"), // 根目录
        filename: "index.js",
        publicPath: "/",
        library: "excentricLabeling",
        libraryTarget: "umd",
        globalObject: "this"
    },

    module: {
        rules: [
            {
                //ts, tsx
                test: /(\.ts)$/,
                exclude: /node_modules/,
                use: "ts-loader",
            },
            // {
            //     test: /\.js$/,
            //     exclude: /node_modules/,
            //     use: "babel-loader"
            // }
        ],
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
};
