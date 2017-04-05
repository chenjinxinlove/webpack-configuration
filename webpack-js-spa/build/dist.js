/**
 * Created by chen on 2017/2/21.
 */
'use strict';

let path = require('path');
let webpack = require('webpack');

let baseConfig = require('./base');
let defaultSettings = require('./default');
let CopyWebpackPlugin = require('copy-webpack-plugin');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let ExtractTextPlugin = require('extract-text-webpack-plugin');

// Add needed plugins here
let autoprefixer = require('autoprefixer');
let BowerWebpackPlugin = require('bower-webpack-plugin');

let config = Object.assign({}, baseConfig, {
    entry: path.join(__dirname, '../src/index'),
    cache: false,
    devtool: 'sourcemap',
    plugins: [
        new webpack.optimize.DedupePlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"'
        }),
        new BowerWebpackPlugin({
            searchResolveModulesDirectories: false
        }),
        new webpack.optimize.UglifyJsPlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.AggressiveMergingPlugin(),
        new ExtractTextPlugin('style.css'),
        new webpack.NoErrorsPlugin(),
        new HtmlWebpackPlugin({
            template: __dirname + '/../src/index.html',
            filename: __dirname + '/../dist/index.html',
            hash:true,
            inject: 'body',
            title:'chen'
        }),
        new CopyWebpackPlugin([{
            from: __dirname + '/../src/favicon.ico',
            to:__dirname + '/../dist',
            force: true
        }]),
        new CopyWebpackPlugin([{
            from: __dirname + '/../src/static/',
            to:__dirname + '/../dist/static/',
            force: true
        }])
    ],
    module: defaultSettings.getDefaultModules(),
    postcss:[autoprefixer({browsers:['last 4 version', 'safari 5', 'opera 12.1', 'ios 6', 'android 4']})],
    externals: {
        'jquery': '$'
    }
});

config.module.loaders.push(
    {test: /\.css$/, loader: ExtractTextPlugin.extract('style', 'css!postcss')},
    {test: /\.sass$/, loader: ExtractTextPlugin.extract('style', 'css!postcss!sass')}
);
module.exports = config;
