/**
 * Created by chen on 2017/2/20.
 */
let webpack = require('webpack');
let HtmlWebpavckPlugin = require('html-webpack-plugin');
let path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        path: 'dist',
        filename: '[name].js'
    },
    plugins: [
        new HtmlWebpavckPlugin({
            title:'陈金鑫',
            filename:path.resolve(__dirname, 'index.html'),
            hash: true,
            inject: 'head',
            minify: {
                removeAttributeQuotes: true
            }
        })
    ]
}