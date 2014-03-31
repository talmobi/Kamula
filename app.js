
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');

var app = module.exports = express();

// connect to remote database
var dataBaseUrl = "mongodb://yoshi:kamula20140o9i8uy7u8i9@ds051077.mongolab.com:51077/misc";
var collections = ["kamula"];

mongodb = require("mongojs").connect(dataBaseUrl, collections);

/*
var MongoClient = require('mongodb').MongoClient;
var format = require('util').format;

MongoClient.connect('mongodb://127.0.0.1:27017/misc', function(err, db) {
	if (err) throw err;

	var collection = db.collection('kamula');

	collection.find().

});
*/

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');
app.use(express.favicon(path.join(__dirname, 'favicon.ico')));

app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
  app.use(express.logger('dev'));
}

require('./routes');

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
