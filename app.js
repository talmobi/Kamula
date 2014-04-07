
/**
 * Module dependencies.
 */
var express = require('express');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');

require('./config/mongodb')(mongoose); // config mongodb
require('./config/passport')(passport, mongoose); // config passport

// app config
var app = express();
// set explicit httpServer for socket.io (required since Express 3)
app.httpServer = http.createServer(app);
app.set('port', process.env.PORT || 80);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs'); // hogan
app.use(express.favicon(path.join(__dirname, 'favicon.ico')));

app.use(express.json());
app.use(express.urlencoded());

app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());

// init passport
app.use(express.session( { secret: "My little ponies" }));
app.use(passport.initialize());
app.use(passport.session());
app.use(require('connect-flash')());

app.use(app.router);
app.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
  app.use(express.logger('dev'));
}

// require routes (SPA app, only one)
require('./routes/index.js')(app, passport, mongoose);

app.listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});