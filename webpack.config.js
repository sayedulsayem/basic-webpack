const fs = require("fs");
const path = require('path');

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const RemoveEmptyScriptsPlugin = require("webpack-remove-empty-scripts");
const TerserPlugin = require("terser-webpack-plugin");
// const WebpackObfuscator = require('webpack-obfuscator');

// change these variables to fit your project
const jsPath = "./assets/dev/js";
const cssPath = "./assets/dev/sass";

const jsPathAdmin = "./assets/dev/admin/js";
const cssPathAdmin = "./assets/dev/admin/sass";

const outputPath = "./assets";

let entryPoints = {};

// Load front-end JS
fs.readdirSync(jsPath).forEach((file) => {
	const filename = file.split(".").slice(0, -1).join(".");
	const fileExt = path.extname(file);
	if (fileExt === ".js") {
		entryPoints["js/" + filename] = jsPath + "/" + file;
		entryPoints["js/" + filename + ".min"] = jsPath + "/" + file;
	}
});

// Load forn-end CSS
fs.readdirSync(cssPath).forEach((file) => {
	const filename = file.split(".").slice(0, -1).join(".");
	const fileExt = path.extname(file);
	if (fileExt === ".scss" && !filename.startsWith("_")) {
		entryPoints["css/" + filename] = cssPath + "/" + file;
		entryPoints["css/" + filename + ".min"] =
			cssPath + "/" + file;
	}
});

// Load Admin JS
fs.readdirSync(jsPathAdmin).forEach((file) => {
	const filename = file.split(".").slice(0, -1).join(".");
	const fileExt = path.extname(file);
	if (fileExt === ".js") {
		entryPoints["admin/js/" + filename] = jsPathAdmin + "/" + file;
		entryPoints["admin/js/" + filename + ".min"] = jsPathAdmin + "/" + file;
	}
});

// Load Admin CSS
fs.readdirSync(cssPathAdmin).forEach((file) => {
	const filename = file.split(".").slice(0, -1).join(".");
	const fileExt = path.extname(file);
	if (fileExt === ".scss" && !filename.startsWith("_")) {
		entryPoints["admin/css/" + filename] = cssPathAdmin + "/" + file;
		entryPoints["admin/css/" + filename + ".min"] =
			cssPathAdmin + "/" + file;
	}
});


// Hard code this to production but can be adapted to accept args to change env.
const mode = 'development';

module.exports = [
    {
        mode,

        output: {
            path: path.resolve(__dirname, outputPath),
            filename: '[name].js'
        },

        entry: entryPoints,

        // entry: {
        //     "css/style": './assets/dev/sass/style.scss',
        //     "css/style.min": './assets/dev/sass/style.scss',
        //     "css/test": './assets/dev/sass/test.scss',
        //     "css/test.min": './assets/dev/sass/test.scss',
        //     "js/app": './assets/dev/js/app.js',
        //     "js/app.min": './assets/dev/js/app.js',
        // },

        module: {
            rules: [
                {
                    test: /\.js$/,
                    use: "babel-loader",
                    exclude: /node_modules/,
                },
                {
                    // regex to match scss and css files
                    test: /\.s?[c]ss$/i,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: "css-loader",
                            options: { url: false },
                        },
                        "postcss-loader",
                        "sass-loader"
                    ],
                },
                {
                    // regex to match sass files
                    test: /\.sass$/i,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: "css-loader",
                            options: { url: false },
                        },
                        "postcss-loader",
                        "sass-loader"
                    ],
                },
            ],
        },

        externals: {
            jquery: "jQuery",
        },

        optimization: {
            minimize: true,
            minimizer: [
                new CssMinimizerPlugin({
                    test: /\.min\.css$/,
                    minimizerOptions: {
                        preset: [
                            "default",
                            {
                                discardComments: { removeAll: true },
                            },
                        ],
                    },
                }),
                new TerserPlugin({
                    parallel: 4,
                    extractComments: false,
                    test: /\.min.js(\?.*)?$/i,
                }),
            ],
        },
        plugins: [
            new RemoveEmptyScriptsPlugin(),
            new MiniCssExtractPlugin({
                filename: "[name].css",
            }),
            // TODO: Need to thing again because of wp org rules
            // new WebpackObfuscator ({
            //     rotateStringArray: true
            // }, ['!**.min.js'])
        ],
    }
];