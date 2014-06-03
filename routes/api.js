/**
	*	API as demanded by spec
	*/


var tools = require('../config/tools.js');

module.exports = function(app, verify, mongoose, passport) {
	//Lisää käyttäjän järjestelmään	Runkona lisättävä käyttäjä JSON-muodossa
	app.post('/api/users', passport.authenticate('local-register'), function (req, res) {
		console.log('in register');

		if (req.user) {
			// no user was found, create a new user
			console.log('creating new user');

			tools.registerNewUser(req.user, function (userData) {
				// success
				var plainData = tools.toPlainUser( userData );
				res.send(200, {message: "You successfully registered new user"});

				// delete password before sending the user data
				delete plainData.password;
				
				// broadcast changes to all connected clients
				io.sockets.emit('newuser', userData);
				console.log(userData);
			}, function() {
				// failed
				res.send(400, {message: "Failed to register"});
			});
		} else {
			res.send(403, {message: "A user with that name already exists."})
		}
	});

	// Hakee käyttäjän tiedot. Palauttaa käyttäjän tiedot JSON-muodossa
	app.get('/api/users/:user', function(req, res) {
		var user = req.params.user;

		mongoose.model('User').findOne({ lowercaseName: user.toLowerCase() }, function(err, doc) {
			if (err) throw err;

			if (doc) { // exists

				// populate the doc with tweets list manually.
				// we won't use the populate command since it would require us
				// to push reference to the User db Object (and keep track of two sets of pointers)
				// that may go out of sync. Easier and cleaner to just get the data we need and
				// send it back as a json object.
				 mongoose.model('Tweet')
					.find({ user: doc._id })
					.exec(function (err, tweetsList) {
						if (err) console.log("Error getting tweets");

						// TODO populate friends list

						console.log(doc);

						var data = {
							user: doc.user,
							name: doc.name,
							email: doc.email,

							friends: doc.friends,
							tweets: tweetsList,
							_id: doc._id
						}

						res.send( data );
					});
			} else {	// doesn't exists
				res.send( 404, { message: "That user doesn't exist.", errorSource: "" } );
			}
		});
	});


	// Päivittää käyttäjän tietoja. Runkona käyttäjän uudet tiedot JSON-muodossa,
	// vaatii tunnistautumisen
	app.put('/api/users/:user', verify, function(req, res) {
		var json = req.body;

		if (json.user.toLowerCase() !== req.user.lowercaseName) {
			console.log("in app.put API - error");
			res.send(404);
			return;
		}

		mongoose.model('User').findOne({ lowercaseName: json.user.toLowerCase() }, function(err, doc) {
			if (err) {
				console.log(err);
				res.send(400);
			}

			if (doc) { // exists
				var data = {
					user: doc.user,
					name: json.name,
					email: json.email,
					password: json.password
				}

				// update the users info
				mongoose.model('User').update( {_id: doc._id} , data, {multi:false}, function (err) {
					if (err) {
						res.send(404);
						throw err;
						return;
					}

					res.send(200, data); // OK! Bojangles!
				});
			} else {
				res.send(404); // user doesn't exist
			}
		});
	});

	// Poistaa annetun käyttäjän. Vaatii tunnistautumisen.
	app.delete('/api/users/:user', verify, function(req, res) {
		var json = req.body;

		if (json.user.toLowerCase() !== req.user.lowercaseName) {
			console.log("in app.delete API - error");
			res.send(404);
			return;
		}

		mongoose.model('User').findOne({ lowercaseName: json.user.toLowerCase() }, function(err, doc) {
			if (err) {
				console.log(err);
			}

			if (doc) {
					mongoose.model('User').update( {_id: doc._id}, {locked: true}, {multi:false}, function (err) {
						if (err) {
							res.send(404);
							throw err;
							return;
						}

						req.logout();
						res.send(200, {message: "User successfully deleted."});
					});
					
					//mongoose.model('User').remove( { lowercaseName: json.user.toLowerCase() } );
			} else {
				// ei ole olemassa
				res.send(404);
			}
		});
	});
}