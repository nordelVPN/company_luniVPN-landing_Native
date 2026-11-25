const { merge } = require('webpack-merge');
const path = require('node:path');
const common = require('./webpack.common');

const port = Number(process.env.SITE_PORT || process.env.PORT || 3002);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be a valid TCP port');

const serversApiUrl = process.env.SERVERS_API_URL || 'http://localhost:8082';
const brandSlug = process.env.BRAND_SLUG || 'luni';
const brandToken = process.env.BRAND_API_TOKEN || '';

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',
  output: { path: path.resolve(__dirname, '../build/dev') },
  devServer: {
    host: '127.0.0.1',
    port,
    hot: false,
    static: false,
    devMiddleware: { writeToDisk: true },
    proxy: [
      {
        context: ['/_api/servers'],
        target: serversApiUrl,
        changeOrigin: true,
        pathRewrite: { '^/_api/servers': '/api/v1/sites/' + brandSlug + '/servers' },
        headers: brandToken ? { Authorization: 'Bearer ' + brandToken } : {}
      }
    ]
  }
});
