const { resolve } = require('path');

module.exports = {
	target: 'node',
	mode: 'none',
	entry: resolve(__dirname, '..', 'test', 'index.js'),
	output: {
		path: resolve(__dirname, '..', 'bin'),
		filename: 'tests.js',
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				loader: 'babel-loader',
				options: {
					presets: [
            '@babel/preset-env',
            '@babel/preset-react',
          ],
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
		],
	},
};

