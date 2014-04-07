
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
var io = require('./sockets'); // acquire sockets
var passport = app.passport;


// configure passport basic authentication
var BasicStrategy = require('passport-http').BasicStrategy;

passport.use(new BasicStrategy(
	function(username, password, done) {
		var User = mongoose.model('User');
		User.findOne( { lowercaseName: username.toLowerCase() }, function(err, user) {
			if (err) {
				return done(err);
			}
			if (!user) {
				console.log('unknown user');
				return done(null, false);
			}
			if (user.password !== password) {
				console.log('password wrong');
				return done(null, false);
			}
			console.log('password correct');
			return done(null, user); // valid
		});
	}
));

// passport helper function
var verify = function() {
	// session false (http basic has no sessions)
	return passport.authenticate('basic', { session: false });
}

/**
  * Server side functions
  */
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

var login = function(req, res) {
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
				// check if correct username and password
				req.login(name.user, function() {
					console.log(json);
					console.log(req.user);
					res.send(200, { message: "Logged in successfully." });
					console.log("USER LOGGED IN!");
				});
			} else {	// doesn't exists
				res.send( 403, { message: "That User doesn't exist.", errorSource: "myUsername" } );
				console.log("Login failed - username doesn't exist.");
			}
		});
	}
}


/* API
 * Spec:ed API
 */

//Lisää käyttäjän järjestelmään	Runkona lisättävä käyttäjä JSON-muodossa
app.post('/api/users', verify(), function(req, res) {
	register(req,res);
});

// Hakee käyttäjän tiedot. Palauttaa käyttäjän tiedot JSON-muodossa
app.get('/api/users/:user', function(req, res) {
	var user = req.params.user;

	mongoose.model('User').findOne({ lowercaseName: user.toLowerCase() }, function(err, doc) {
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
app.put('/api/users/:user', verify(), function(req, res) {
	var json = req.body;

	mongoose.model('User').findOne({ lowercaseName: json.user.toLowerCase() }, function(err, doc) {
		if (err) {
			console.log(err);
			res.send(400);
		}

		if (doc) { // exists
			var newdata = {
				name: json.name,
				email: json.email,
				password: json.password
			}

			// update the users info
			mongoose.model('User').update( doc, newdata );

			res.send(200); // OK! Bojangles!
		} else {
			res.send(404); // user doesn't exist
		}
	});
});

// Poistaa annetun käyttäjän. Vaatii tunnistautumisen.
app.delete('/api/users/:user', verify(), function(req, res) {
	var json = req.body;

	mongoose.model('User').findOne({ lowercaseName: json.user.toLowerCase() }, function(err, doc) {
		if (err) {
			console.log(err);
		}

		if (doc) {
			if (verify(req, user)) {
				// TODO
				mongoose.model('User').remove( { lowercaseName: json.user.toLowerCase() } );
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
	login(req, res);
});

/**
	*	GET requests
	*/
app.get('/find', function(req, res) {
	mongoose.model('User').find(function(err, users){
		mongoose.model('User').populate(users, {path: 'tweets'}, function(err, users) {
			res.send(users);
		});
	});
});

// auth test
app.get('/auth', verify(), function(req, res) {
	var criteria = {type: 'user'};
	var projection = {
		user: true,
		name: true,
		email: true
	};
	
	res.json(req.user);
});


app.get('/users', function(req, res) {
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
});



// Views (hogan)
app.get('/', function(req, res) {
	res.render('index', {title: 'Kamula'});
});


