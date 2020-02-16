const merge = require('webpack-merge');
const baseConfig = require('./webpack-base-config');
const { resolve } = require('path');

module.exports = merge(
  baseConfig,
  {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
      publicPath: '/',
      contentBase: resolve(__dirname, '..', 'assets'),
      contentBasePublicPath: '/',
    },
  },
);
