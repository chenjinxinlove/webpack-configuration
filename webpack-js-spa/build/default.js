/**
 * Created by chen on 2017/2/21.
 */
'use strict';

const path = require('path');
//编辑目录
const srcPath = path.join(__dirname, '/../src');


//默认的端口
const defaultPort = 8080;

/**
 * 设置公共默认的module
 * @returns {{preLoaders: *[], loaders: *[]}}
 */

function getDefaultModules() {
    return {
        preLoaders: [
            {
                test: /\.js$/,
                loader: 'eslint-loader',
                include: srcPath,
                exclude: /node_modules/
            }
        ],
        loaders: [
            { test: /\.hbs$/, loader: "handlebars-loader" },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                include: srcPath,
                exclude: /node_modules/
            },
            {
                test: /\.json$/,
                loader: 'json-loader'
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader!postcss-loader'
            },
            {
                test: /\.sass$/,
                loader: 'style-loader!css-loader!postcss-loader!sass-loader?outputStyle=expanded&indentedSyntax'
            },
            {
                test: /\.scss$/,
                loader: 'style-loader!css-loader!postcss-loader!sass-loader?outputStyle=expanded'
            },
            {
                test: /\.(png|jpg|gif|svg|woff|woff2)$/,
                loader: 'url-loader',
                query: {
                    limit: 1000
                }
            }
        ]
    }
}

module.exports = {
    srcPath: srcPath,
    port: defaultPort,
    publicPath: '/assets/',
    getDefaultModules: getDefaultModules
};