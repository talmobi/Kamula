
/*
 * GET home page.
 */

// Tweet and name restrictions
// No restrictions on email, name or other stuff
// not even the password (according to specs).
// Not even min char len specs.
var maxNameLength = 30;
var nameExcludePattern = /[^a-zA-Z0-9]+/;
var maxTweetLength = 200;


// set up mongoDB
// read url with auth info from file (.gitignored)
var fs = require('fs');
// read is synchronizly (we need this info NOW)
var dataBaseUrl = fs.readFileSync('./mongodb_auth', 'utf8');
// connect to the remote database
var mongodb = module.exports = require("mongojs").connect(dataBaseUrl, ["kamula"]);
// set handle for the database
var collection = mongodb.kamula;

app = require('../app'); // require express app

// http status codes
// 400 - client side error
// 500 - server side error
// 200 - OK! happy bojangles https://www.youtube.com/watch?v=fIQJzcldzAw

// Server side functions
var saveUser = function(user) {
	// add necessary user values to the data
	// acquired from the client
	user.lowercaseName = user.username.toLowerCase();
	user.type = "user";

	// save the user to mongodb
	collection.save( user );
}

// API
// POST requests
app.post('/register', function(req, res) {
	console.log("POST REQUEST");

	var data = req.body;
	var name = data.username;

	if (name.length > maxNameLength) {
		res.send( 400, { message: "Username too long!", errorSource: "myUsername" } ); // error
	} else if (nameExcludePattern.test(name)) {
		res.send( 400, { message: "Username must consist of a-z, A-Z and 0-9 characters only!", errorSource: "myUsername" } ); // error
	} else {	// username is fine
		// check if username already exists
		collection.findOne({ type: "user", lowercaseName: name.toLowerCase() }, function(err, doc) {
			console.log(doc);

			if (doc) { // exists
				res.send( 500, { message: "That Username already exists.", errorSource: "myUsername" } );
			} else {	// doesn't exists
				console.log("REGISTERED NEW USER");
				saveUser(data);
				res.send( 200, { message: "Successfully created user: " + name } );
			}
		});
	}

	console.log(data);
});

app.post('/login', function(req, res) {
	console.log("POST REQUEST");

	var data = req.body;

	console.log(data);

	res.send('200');
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



// Views (hogan)
app.get('/', function(req, res) {
	res.render('index', {title: 'Kamula'});
});


