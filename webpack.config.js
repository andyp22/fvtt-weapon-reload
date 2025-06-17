/* eslint-disable */
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const path = require('path');
const glob = require('glob');
const moduleJson = require('./module.json');

const allTemplates = () => {
    return glob
        .sync('**/*.hbs', { cwd: path.join(__dirname, 'templates') })
        .map((file) => `modules/${moduleJson.id}/templates/${file}`)
        .join(',');
};

module.exports = (env) => {
    const defaults = {
        watch: false,
        mode: 'development',
    };

    const environment = { ...defaults, ...env };
    const isDevelopment = environment.mode === 'development';

    const config = {
        entry: ['./src/index.ts', './src/styles/module.scss'],
        watch: environment.watch,
        devtool: 'inline-source-map',
        stats: 'minimal',
        mode: environment.mode,
        resolve: {
            extensions: ['.wasm', '.mjs', '.ts', '.js', '.json'],
        },
        output: {
            filename: 'index.mjs',
            path: path.resolve(__dirname, 'build'),
            publicPath: '',
        },
        devServer: {
            hot: true,
            writeToDisk: true,
            proxy: [
                {
                    context: (pathname) => {
                        return !pathname.match('^/sockjs');
                    },
                    target: 'http://localhost:30000',
                    ws: true,
                },
            ],
        },
        module: {
            rules: [
                isDevelopment
                    ? {
                          test: /\.html$/,
                          loader: 'raw-loader',
                      }
                    : {
                          test: /\.html$/,
                          loader: 'null-loader',
                      },
                {
                    test: /\.ts$/,
                    use: [
                        'ts-loader',
                        'webpack-import-glob-loader',
                        'source-map-loader',
                        {
                            loader: 'string-replace-loader',
                            options: {
                                search: '__ALL_TEMPLATES__',
                                replace: allTemplates,
                            },
                        },
                    ],
                },
                {
                    test: /\.scss$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                outputPath: 'styles/',
                                name: 'module.css',
                                sourceMap: true,
                            },
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: isDevelopment,
                            },
                        },
                    ],
                },
            ],
        },
        plugins: [
            new CleanWebpackPlugin(),
            new ESLintPlugin({
                extensions: ['ts'],
            }),
        ],
    };

    if (!isDevelopment) {
        delete config.devtool;
    }

    return config;
};
