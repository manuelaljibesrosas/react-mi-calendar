const presets = [
	[
		'@babel/preset-env',
		{
			targets: {
				node: true,
			},
			modules: 'commonjs',
		},
	],
];

module.exports = { presets };

