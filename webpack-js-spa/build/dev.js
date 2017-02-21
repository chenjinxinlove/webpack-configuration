/**
 * Created by chen on 2017/2/21.
 */
'use strict';
let path = require('path');
let webpack = require('webpack');
let baseConfig = require('./base');
let defaultModules = require('./default');

let BowerWebpackPlugin = require('bower-webpack-plugin');

let config = Object.assign({}, baseConfig, {
    entry: [
        'webpack-dev-server/client?http://127.0.0.1:' + defaultModules.port,
        'webpack/hot/only-dev-server',
        './src/index'
    ],
    cache: true,
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new BowerWebpackPlugin({
            searchResolveModulesDirectories: false
        })
    ],
    module: defaultModules.getDefaultModules()
});


module.exports = config;
