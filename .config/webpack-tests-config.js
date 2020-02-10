const nodeExternals = require('webpack-node-externals');

module.exports = 	{
	mode: 'none',
	target: 'node',
	module: {
		rules: [
			{
				test: /\.js$/,
				loader: 'babel-loader',
				options: {
					presets: ['@babel/preset-env'],
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
	externals: [nodeExternals()],
};
