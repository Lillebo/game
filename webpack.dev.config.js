var path = require('path');
var webpack = require('webpack');

module.exports = {
	devtool: 'source-map',
	entry: [
		'webpack-hot-middleware/client',
		'./src/init.js'
	],
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'public'),
		publicPath: '/'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: '/node_modules/',
				loader: 'babel-loader'
			},
			{
				test: /\.handlebars$/,
				exclude: '/node_modules',
				loader: ['handlebars-loader']
			},
			{
				test: /\.scss$/,
				exclude: '/node_modules',
				loader: ['style-loader', 'css-loader', 'sass-loader']
			},
			{
				test: /\.(png)$/,
				exclude: '/node_modules',
				loader: 'file-loader'
			},
			{
				test: /\.(ogg)$/,
				exclude: '/node_modules',
				loader: 'file-loader'
			}
		]
	},
	resolve: {
		alias: {
			'handlebars' : 'handlebars/dist/handlebars.js'
		}
	},
	node: {
		fs: 'empty'
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin()
	]
};