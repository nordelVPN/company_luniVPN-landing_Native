const { merge } = require('webpack-merge');
const path = require('node:path');
const common = require('./webpack.common');
const port = Number(process.env.SITE_PORT || 8080);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be a valid TCP port');
module.exports = merge(common, { mode: 'development', devtool: 'eval-cheap-module-source-map', output: { path: path.resolve(__dirname, '../build/dev') }, devServer: { host: '127.0.0.1', port, hot: false, static: false, devMiddleware: { writeToDisk: true } } });
