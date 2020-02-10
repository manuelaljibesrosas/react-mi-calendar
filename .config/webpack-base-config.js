const HtmlWebpackPlugin = require('html-webpack-plugin');
const htmlWebpackTemplate = require('html-webpack-template');
const { resolve } = require('path');

module.exports = ({
  mode: 'development',
  entry: resolve(__dirname, '..', 'examples', 'default', 'index.jsx'),
  output: {
    path: resolve(__dirname, '..', 'dist'),
    filename: 'react-reactive-calendar.bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
            ],
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
        use: [ 'style-loader', 'css-loader' ],
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
      links: [
        'https://fonts.googleapis.com/css?family=Roboto:300,400,500&display=swap',
      ],
      bodyHtmlSnippet: `<div id="root"></div>`,
    }),
  ],
  devtool: 'inline-source-map',
  resolve: {
    extensions: [ '.js', '.jsx' ],
  },
});
