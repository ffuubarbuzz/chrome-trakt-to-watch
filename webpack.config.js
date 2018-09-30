module.exports = {
	context: __dirname + '/app/scripts.babel/',
	entry: {
		background: './background.js',
		chromereload: './chromereload.js',
		contentscript: './contentscript.js',
		iframe: './iframe.js',
		options: './options.js',
	},
	output: { filename: '[name].js' },
	module: {
		rules: [{
			test: /\.js$/,
			loader: 'babel-loader'
		}, {
			test: /\.vue$/,
			loader: 'vue-loader'
		}]
	},
	node: {
		fs: "empty",
		net: "empty",
	}
}
