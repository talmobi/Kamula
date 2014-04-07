/**
	*	Configure basic local passport authentication with sessions
	*	http://passportjs.org/guide/configure/
	*/

var LocalStrategy = require('passport-local').Strategy;

module.exports = function(passport, mongoose) {	// called from app.js
	var User = mongoose.model('User');

	var tools = require('./tools');

	passport.serializeUser(function(user, done) {
		done(null, user.lowercaseName);
	});

	passport.deserializeUser(function(lowercaseName, done) {
		User.findOne( {lowercaseName: lowercaseName}, function(err, user) {
			done(err, user);
		});
	});

	// init passport
	passport.use('local-register', new LocalStrategy( {
		usernameField: 'user',
		passwordField: 'password',
		passReqToCallback: true
	},	function(req, user, password, done) {
				console.log("in passport local-register");

				console.log(user);
				console.log(password);

				User.findOne( { lowercaseName: user.toLowerCase() }, function(err, dbUser) {
					if (err) return done(err);

					if (!dbUser)  {
						var data = tools.registerNewUser(req.body);

						return done(null, data);
					} 

					console.log('that username is already registered');
					return done(null, null); // fail, user already exists
				});
			}));

	passport.use('local-login', new LocalStrategy({
		usernameField: 'user',
		passwordField: 'password',
		passReqToCallback: true
	},	function(req, user, password, done) {
				console.log("in passport local-login");

				console.log(user);
				console.log(password);

				User.findOne( { lowercaseName: user.toLowerCase() }, function(err, user) {
					if (err) return done(err);
					if (!user) return done(null, false, { message: 'Incorrect username.' });
					if (user.password !== password) return done(null, false, { message: 'Incorrect password' });
					return done(null, user);
				});
			}));
};