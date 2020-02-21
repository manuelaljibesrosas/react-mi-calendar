const HtmlWebpackPlugin = require('html-webpack-plugin');
const htmlWebpackTemplate = require('html-webpack-template');
const { resolve } = require('path');

module.exports = ({
  mode: 'production',
  entry: {
    main: resolve(__dirname, '..', 'src', 'index.jsx'),
    worker: resolve(__dirname, '..', 'src', 'worker.js'),
  },
  output: {
    path: resolve(__dirname, '..', 'docs'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.jsx$/,
        loader: 'babel-loader',
        options: {
          presets: [
            '@babel/preset-env',
            '@babel/preset-react',
          ],
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/preset-react',
              ],
            },
          },
          {
            loader: 'react-svg-loader',
            options: {
              jsx: true,
              svgo: {
                plugins: [
                  {
                    cleanupIDs: false,
                  },
                ],
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: false,
      template: htmlWebpackTemplate,
      title: 'React MI Calendar',
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1, shrink-to-fit=no viewport-fit=cover',
        },
      ],
      links: [
        'https://fonts.googleapis.com/css?family=Roboto:300,400,500&display=swap',
        {
          rel: 'manifest',
          href: 'manifest.json',
        },
      ],
      bodyHtmlSnippet: `<div id="root"></div>`,
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
});
