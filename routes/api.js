module.exports = function(app, verify, mongoose) {
	//Lisää käyttäjän järjestelmään	Runkona lisättävä käyttäjä JSON-muodossa
	app.post('/api/users', function(req, res) {
		// proxy to /register on this server

		var opts = {
			host: 'localhost',
			port: 80,
			path: '/register',
			method: 'POST',
			headers: req.headers
		};

		var http = require('http');
		var proxyReq = http.request(opts, function(proxyRes) {
			proxyRes.setEncoding('utf8');

			proxyRes.on('data', function(chunk) {
				res.write(chunk);
			});

			proxyRes.on('close', function(chunk) {
				res.writeHead(proxyRes.statusCode);
				res.end();
			});
		})
			.on('error', function(err) {
				console.log(err.message);
				res.writeHead(500);
				res.end();
			});

		proxyReq.end();
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
					name: doc.name,
					email: doc.email
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
					mongoose.model('User').remove( { lowercaseName: json.user.toLowerCase() } );
			} else {
				// ei ole olemassa
				res.send(404);
			}
		});
	});
}