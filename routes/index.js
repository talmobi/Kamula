
/*
 * GET home page.
 */

// connect to remote database
var dataBaseUrl = "mongodb://yoshi:kamula20140o9i8uy7u8i9@ds051077.mongolab.com:51077/misc";
var collections = ["kamula"];
var mongodb = module.exports = require("mongojs").connect(dataBaseUrl, collections);
var collection = mongodb.kamula;

app = require('../app'); // require express app




// API
// POST requests
app.post('/register', function(req, res) {
	console.log(req);
});


// GET requests
app.get('/find', function(req, res) {
	collection.find({}, function(err, data) {
		res.send(data);
	});
});

app.get('/users', function(req, res) {
	collection.find({type: "user"}, function(err, data) {
		res.send(data);
	});
});

app.get('/latest', function(req, res) {
	collection.find({type: "tweet"}).sort({_id: -1}).limit( 5, function(err, data) {
		res.send(data);
	});
});



// routing
app.get('/', function(req, res) {
	res.render('index', {title: 'Kamula'});
});


