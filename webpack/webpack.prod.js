const { merge } = require('webpack-merge');
const { DefinePlugin } = require('webpack');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'production',
  devtool: false,
  plugins: [
    new DefinePlugin({
      __VPN_BUILD_CONFIG__: JSON.stringify({
        brandSlug: process.env.BRAND_SLUG || 'luni',
        mode: process.env.DATA_MODE || 'live',
        dashboardApiUrl: process.env.PORTAL_API_URL || 'https://businessdashboard.cods.live',
        adminServersApiUrl: process.env.SERVERS_API_URL || 'https://vpnservers.cods.live',
        serversCatalogUrl: process.env.SERVERS_CATALOG_URL || '/_api/servers'
      })
    })
  ],
  optimization: { minimizer: ['...', new CssMinimizerPlugin()] }
});
