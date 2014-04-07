/**
	*	Configure basic local passport authentication with sessions
	*	http://passportjs.org/guide/configure/
	*/

var LocalStrategy = require('passport-local').Strategy;
var User = require('mongoose').models('User');

module.exports = function(passport) {	// called from app.js

	passport.seralizeUser(function(user, done) {
		done(null, user.lowercaseName);
	});

	passport.deseralizeUser(function(lowercaseName, done) {
		User.findOne( {lowercaseName: lowercaseName}, function(err, user) {
			done(err, user);
		});
	});

	// init passport
	passport.use('local-signup', new LocalStrategy( {
		usernameField: 'user',
		passwordField: 'password'
	},	function(user, password, done) {
				User.findOne( { lowercaseName: user.toLowerCase() }, function(err, user) {
					if (err) return done(err);
					if (!user) return done(null, false, { message: 'Incorrect username.' });
					if (user.password !== password) return done(null, false, { message: 'Incorrect password' });
					return done(null, user); // success
				});
			}));

	passport.use('local-login', new LocalStrategy({
		usernameField: 'user',
		passwordField: 'password'
	},	function(user, password, done) {
				User.findOne( { lowercaseName: user.toLowerCase() }, function(err, user) {
					if (err) return done(err);
					if (!user) return done(null, false, { message: 'Incorrect username.' });
					if (user.password !== password) return done(null, false, { message: 'Incorrect password' });
					return done(null, user);
				});
			}));
};