
/*
 * GET home page.
 */

// connect to remote database
var dataBaseUrl = "mongodb://yoshi:kamula20140o9i8uy7u8i9@ds051077.mongolab.com:51077/misc";
var collections = ["kamula"];

var mongodb = module.exports = require("mongojs").connect(dataBaseUrl, collections);

app = require('../app');

app.get('/', function(req, res, next) {
	res.render('index', {title: 'Kamula'});
});


app.get('/find', function(req, res) {
	mongodb.kamula.find({}, function(err, data) {
		res.send(data);
	});
});

app.get('/users', function(req, res) {
	mongodb.kamula.find({type: "user"}, function(err, data) {
		res.send(data);
	});
});

app.get('/latest', function(req, res) {
	mongodb.kamula.find({type: "tweet"}).sort({_id: -1}).limit( 5, function(err, data) {
		res.send(data);
	});
});