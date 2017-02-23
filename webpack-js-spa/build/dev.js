/**
 * Created by chen on 2017/2/21.
 */
'use strict';
let path = require('path');
let webpack = require('webpack');
let baseConfig = require('./base');
let defaultModules = require('./default');
let autoprefixer = require('autoprefixer');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let BowerWebpackPlugin = require('bower-webpack-plugin');

let config = Object.assign({}, baseConfig, {
    entry: [
        'webpack-dev-server/client?http://127.0.0.1:' + defaultModules.port,
        'webpack/hot/only-dev-server',
        './src/index'
    ],
    cache: false,
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new BowerWebpackPlugin({
            searchResolveModulesDirectories: false
        }),
        new HtmlWebpackPlugin({
            template: defaultModules.srcPath + '/index.html',
            hash:true,
            inject: 'body'
        })
    ],
    module: defaultModules.getDefaultModules(),
    postcss:[autoprefixer({browsers:['last 4 versions']})],
    externals: {
        'jquery': '$'
    }
});

config.module.loaders.push({
    test: /\.css$/,
    loader: 'style-loader!css-loader!postcss-loader'
},{
    test: /\.scss$/,
    loader: 'style-loader!css-loader!postcss-loader!sass-loader?outputStyle=expanded'
},{
    test: /\.sass$/,
    loader: 'style-loader!css-loader!postcss-loader!sass-loader?outputStyle=expanded&indentedSyntax'
});

module.exports = config;
