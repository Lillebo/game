var express 	= require('express');
var path	 	= require('path');
var webpack		= require('webpack');
var wpConfig 	= require('./webpack.dev.config.js');
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');

// Config
var app	 		= express();
var isDev		= process.env.NODE_ENV != 'production';
var PORT 		= process.env.PORT || 3000;
var DIST_DIR	= path.join(__dirname, 'public');
var HTML_FILE	= path.join(DIST_DIR, 'index.html');
var compiler	= webpack(wpConfig);


if (isDev) {
	
	app.use(webpackDevMiddleware(compiler, {
		publicPath: wpConfig.output.publicPath,
		stats: {colors: true},
		watchOptions: {
			aggregateTimeout: 300,
			poll: 1000
		}
	}));

	app.use(webpackHotMiddleware(compiler));

} else {

	app.use(express.static(DIST_DIR));

}

app.get('/', function(req, res){
	res.sendFile(HTML_FILE);
});

app.listen(PORT, function(){
	console.log('Server listening on port ' + PORT);
});