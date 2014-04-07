
/*
 * GET home page.
 */

// Tweet and name restrictions
// No restrictions on email, name or other stuff
// not even the password (according to specs).
// Not even min char len specs.

module.exports = function(app, passport, mongoose) {
	var maxNameLength = 30;
	var nameExcludePattern = /[^a-zA-Z0-9]+/;
	var maxTweetLength = 200;

	var mongoose = require('mongoose');
	var io = require('../config/sockets')(app); // acquire sockets

	var tools = require('../config/tools');

	// verification middleware
	var verify = function(req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		}

		res.send(403, "Unauthorized!");
	}

	/** 
		* API as per spec
		*/
	require('./api')(app);

	/**
		*	Registration and Login (Test)
		*/
	app.post('/register', passport.authenticate('local-register'), function(req, res) {
		console.log('in register');

		if (!req.user) {
			console.log('creating new user');
			registerNewUser(req.user);
		}
		
		console.log(req.user);
	});

	app.get('/auth', verify, function(req, res) {
		res.send(200, "Authorized");
	});

	app.post('/login', passport.authenticate('local-login'), function(req, res) {
		console.log('in login');
		if (!req.user) {
			res.send( 404, { message: "That user doesn't exist.", errorSource: "" } );
		} else {
			res.send( 200, { message: "Logged in successfully!"});
		}

		console.log(req.user);
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

			mongoose.model('Tweet').populate(tweets, { path: 'user', select: 'user -_id' }, function(err, tweets) {
				res.send(tweets);
			});
		});
	});



	// Views (hogan)
	app.get('/', function(req, res) {
		res.render('index', {title: 'Kamula'});
	});
}