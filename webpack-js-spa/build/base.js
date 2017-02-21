/**
 * Created by chen on 2017/2/21.
 */
'use strict';
let path = require('path');
let defaultModules = require('./default');

module.exports = {
    port: defaultModules.port,
    debug: true,
    output: {
        path: path.join(__dirname, '/../dist/assets'),
        filename: 'index.js',
        publicPath: defaultModules.publicPath
    },
    devServer: {
        contentBase: defaultModules.srcPath,
        historyApiFallback: true,
        compress: true,
        hot: true,
        port: defaultModules.port,
        publicPath: defaultModules.publicPath,
        noInfo: false
    },
    resolve: {
        extensions: ['', '.js'],
        alias: {
            js: `${defaultModules.srcPath}/js/`,
            img: `${defaultModules.srcPath}/img/`,
            css: `${defaultModules.srcPath}/css/`,
            json: `${defaultModules.srcPath}/json/`
        }
    },
    module: {}
}