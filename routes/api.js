
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
// read auth info syncly from file (.gitignored)
var dataBaseUrl = require('fs').readFileSync('./mongodb_auth', 'utf8');
// connect to the remote database
var mongodb = module.exports = require("mongojs").connect(dataBaseUrl, ["kamula"]);
// set handle for the database
var collection = mongodb.kamula;

app = require('../app'); // require express app

// acquire them sexy shlockets!~~
var io = require('./sockets');

// http status codes
// 400 - client side error
// 500 - server side error
// 200 - OK! happy bojangles https://www.youtube.com/watch?v=fIQJzcldzAw

// Server side functions
var addNewUser = function(json) {
	// add necessary user values to the data
	// acquired from the client
	var userData = {
		user: json.user,
		name: json.name,
		email: json.email,
		password: json.password,
		
		type: "user",
		lowercaseName: json.user.toLowerCase(),
	}

	// save the user to mongodb
	collection.save( userData );

	// delete password before sending the user data
	delete userData.password;

	// broadcast changes to all connected clients
	io.sockets.emit('newuser', userData);
}


var verify = function(req, user) {
	return true;
}

var register = function(req, res) {
	var json = req.body;
	var name = json.user;

	if (name.length > maxNameLength) {
		res.send( 400, { message: "Username too long!", errorSource: "myUsername" } ); // error
	} else if (nameExcludePattern.test(name)) {
		res.send( 400, { message: "Username must consist of a-z, A-Z and 0-9 characters only!",
										 errorSource: "myUsername" } );
	} else {	// username is fine
		// check if username already exists
		collection.findOne({ type: "user", lowercaseName: name.toLowerCase() }, function(err, doc) {
			if (err) throw err;

			console.log(doc);

			if (doc) { // exists
				res.send( 403, { message: "That Username already exists.", errorSource: "myUsername" } );
			} else {	// doesn't exists
				console.log("REGISTERED NEW USER");
				addNewUser(json);
				res.send( 200, { message: "Successfully created user: " + name } );
			}
		});
	}

	console.log(json);
}

/* API
 * Spec:sed API
 */

//Lisää käyttäjän järjestelmään	Runkona lisättävä käyttäjä JSON-muodossa
app.post('/api/users', function(req, res) {
	register(req,res);
});

// Hakee käyttäjän tiedot. Palauttaa käyttäjän tiedot JSON-muodossa
app.get('/api/users/:user', function(req, res) {
	var user = req.params.user;

	collection.findOne({ type: "user", lowercaseName: user.toLowerCase() }, function(err, doc) {
		if (err) throw err;

		if (doc) { // exists
			var data = {
				user: doc.user,
				name: doc.name,
				email: doc.email
			}
			res.send( data );
		} else {	// doesn't exists
			res.send( 404, { message: "That user doesn't exist.", errorSource: "" } );
		}
	});
});


// Päivittää käyttäjän tietoja. Runkona käyttäjän uudet tiedot JSON-muodossa,
// vaatii tunnistautumisen
app.put('/api/users/:user', function(req, res) {
	var json = req.body;

	collection.findOne({ type: "user", lowercaseName: json.user.toLowerCase() }, function(err, doc) {
		if (err) {
			console.log(err);
			res.send(400);
		}

		if (doc) { // exists

			if (verify(req, user)) {

				// take required information
				var newdata = {
					name: json.name,
					email: json.email,
					password: json.password
				}

				// update the users info
				collection.update( doc, newdata );

				res.send(200); // OK! Bojangles!

			} else {
				res.send(403); // unauthorized
			}

		} else {
			res.send(404); // user doesn't exist
		}
	});
});

// Poistaa annetun käyttäjän. Vaatii tunnistautumisen.
app.delete('/api/users/:user', function(req, res) {
	var json = req.body;

	collection.findOne({ type: "user", lowercaseName: json.user.toLowerCase() }, function(err, doc) {
		if (err) {
			console.log(err);
		}

		if (doc) {
			if (verify(req, user)) {
				// TODO
				console.log("TODO -- DELETE USER");
			} else {
				res.send(404);
			}

		} else {
			// ei ole olemassa
			res.send(404);
		}
	});
});

app.post('/register', function(req, res) {
	register(req, res);
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
	var criteria = {type: 'user'};
	var projection = {
		_id: false,
		password: false,
		lowercaseName: false,
		type: false
	};

	// sort newest first
	collection.find( criteria, projection).sort({_id: -1}, function(err, data) {
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


