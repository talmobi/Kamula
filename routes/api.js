
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


var mongoose = require('mongoose');
var app = require('../app'); // require express app
var io = require('./sockets'); // acquire them sexy shlockets!~~

// http status codes
// 400 - client side error
// 500 - server side error
// 200 - OK! happy bojangles https://www.youtube.com/watch?v=fIQJzcldzAw

// Server side functions
var addNewUser = function(json) {
	// add necessary user values to the data
	// acquired from the client
	var User = mongoose.model('User');
	var userData = new User( {
		user: json.user,
		name: json.name,
		email: json.email,
		password: json.password,
		
		lowercaseName: json.user.toLowerCase(),
	});

	// save the user to mongodb
	userData.save(function(err) {
		if (err) throw err;

		// delete password before sending the user data
		delete userData.password;
		
		// broadcast changes to all connected clients
		io.sockets.emit('newuser', userData);
	});
}


var verify = function(req, user) {
	return true;
}

var nameIsOk = function(name) {
	if (typeof name !== 'string') {
		return false;
	}
	if ((name.length > maxNameLength) || nameExcludePattern.test(name)) {
		return false;
	}
	return true;
}

var register = function(req, res) {
	var json = req.body;
	var name = json.user;

	if (!nameIsOk(name)) {
		res.send( 400, { message: "Username faulty!", errorSource: "myUsername" } );
	} else {	// username is fine
		// check if username already exists

		mongoose.model('User').count( {lowercaseName: name.toLowerCase() }, function(err, count) {
			if (err) throw err;

			console.log(count);

			if (count > 0) { // exists
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
	mongoose.model('User').find(function(err, users){
		mongoose.model('User').populate(users, {path: 'tweets'}, function(err, users) {
			res.send(users);
		});
	});

	/*
	mongoose.model('User').find().sort({_id: -1}).exec(function(err, users) {
		if (err) throw err;
		res.send(users);
	});
	*/
});

app.get('/users', function(req, res) {
	var criteria = {type: 'user'};
	var projection = {
		user: true,
		name: true,
		email: true
	};
	
	mongoose.model('User').find( {}, projection ).sort({_id: -1}).exec(function(err, users) {
		if (err) throw err;
		res.send(users);
	});
});

app.get('/latest', function(req, res) {
	mongoose.model('Tweet').find().sort({_id: -1}).limit(5).exec(function(err, tweets) {
		if (err) throw err;

		var match = {
			user: true
		};

		mongoose.model('Tweet').populate(tweets, { path: 'user', select: 'user -_id' }, function(err, tweets) {
			res.send(tweets);
		});
	});

/*
	collection.find({type: "tweet"}).sort({_id: -1}).limit( 5, function(err, data) {
		res.send(data);
	});*/
});



// Views (hogan)
app.get('/', function(req, res) {
	res.render('index', {title: 'Kamula'});
});


