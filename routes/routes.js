
/*
 * GET home page.
 */

// Tweet and name restrictions
// No restrictions on email, name or other stuff
// not even the password (according to specs).
// Not even min char len specs.

module.exports = function(app, passport, mongoose) {
	var mongoose = require('mongoose');

	// get sockets
	var io = require('../config/sockets');

	// get tools for checking and inserting data
	var tools = require('../config/tools');

	// verification middleware
	var verify = function(req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.send(403, "Unauthorized!");
		}
	}

	/** 
		* API as per spec
		*/
	require('./api')(app, verify, mongoose);
	/*
		TODO - unsure about self executing functin pattern here
	*/

	/**
		*	Registration and Login (Test)
		*/
	app.post('/register', passport.authenticate('local-register'), function(req, res) {
		console.log('in register');

		if (req.user) {
			// no user was found, create a new user
			console.log('creating new user');

			tools.registerNewUser(req.user, function(userData) {
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

	/**
		* check auth state
		*/
	app.get('/auth', verify, function(req, res) {
		var userData = tools.toPlainUser(req.user);
		delete userData.password; // delete the password
		console.log("in /auth");
		console.log(userData);
		res.send(200, JSON.stringify( userData ));
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
		* update
		*/
	app.post('/update', verify, function(req, res) {
		console.log('in update');
		if (!req.user) {
			res.send( 404, { message: "Not authorized" } );
		} else {
			res.send( 200, { message: "Logged in successfully!"});
		}

		console.log(req.user);
	});



	/**
		* add friend
		*/
	app.post('/addfriend', verify, function(req, res) {
		// TODO
		console.log('in /addfriend');
		if (!req.user) {
			res.send( 404, { message: "Not authorized" } );
		} else {

			var data = req.body;

			mongoose.model('User').findOne({lowercaseName: data.user.toLowerCase()})
				.exec(function (err, userDoc) {
					if (err) res.send(404);
					mongoose.model('User').findOne({lowercaseName: data.friend.toLowerCase()})
						.exec(function (err, friendDoc) {
							if (err) {
								res.send(404);
								throw err;
								return;
							}

							console.log("userDocId: " + userDoc._id);
							console.log("friendDocId: " + friendDoc._id);

							if (userDoc._id == data.user_id && friendDoc._id == data.friend_id) {
								// check that they already aren't friends
								for (var f in userDoc.friends) {
									if (f === friendDoc._id) {
										res.send(404, {message: "You are already friends with " + friendDoc.user});
										console.log("Add friend failed - they are already friends.");
										return;
									}
								}
								
								// friend them
								userDoc.friends.push( { name: friendDoc.user, _id: friendDoc._id } );
								friendDoc.friends.push( { name: userDoc.user, _id: userDoc._id } );

								var opts = {
									multi: false
								};

								// update the documents
								mongoose.model('User').update( {_id: userDoc._id}, {friends: userDoc.friends}, opts, function(err) {
									if (err) {
										res.send(404);
										throw err;
										return;
									}

									mongoose.model('User').update( {_id: friendDoc._id}, {friends: friendDoc.friends}, opts, function(err) {
										if (err) {
											res.send(404);
											throw err;
											return;
										}

										res.send( 200, {friend: friendDoc.user});
										console.log("Successfully friended " + userDoc.user + " and " + friendDoc.user);
									});
								});
							} else {
								console.log("ADD FRIEND ID ERRORS");
								console.log("user_id: " + data.user_id);
								console.log("friend_id: " + data.friend_id);
								res.send(404);
							}
						});
				});
		}

		console.log(req.user);
	});

		// delete self
	app.post('/delete', verify, function(req, res) {
		// TODO
		console.log('in /delete');

	});


	/**
		*	Twiit POST
		*	json data format: {user: 'user', content: 'twiit msg'}
		*/
	app.post('/twiit', verify, function(req, res) {
		console.log("IN TWIIT");
		console.log(req.body);

		var data = req.body;

		if (req.user.lowercaseName !== data.user.toLowerCase()) {
			console.log("ERROR IN USER");
			console.log("req.user: " + req.user.lowercaseName);
			console.log("data.user: " + data.user);
			res.send(400, {message: 'Wrong user authenticated.'});
			return;
		}

		// check tweet length etc
		if (data.content.length > 200) {
			console.log("TWEET LENGTH TOO LONG");
			res.send(400, {message: 'Tweet length too long'});
			return;
		}

		console.log(req.user);

		// create the tweet database object
		var Tweet = mongoose.model('Tweet');
		var tweetData = new Tweet({
			content: data.content, // the contents of the tweet
			user: req.user._id, // the authoring user
			comments: [] // no comments on a newly created tweet
		});

		// save the tweet to mongodb
		tweetData.save(function(err) {
			if (err) throw err;

			console.log("Saved new tweet.");

			var tweets = tweetData;

			// send the tweet (and populate it) to all clients
			// populate the user name in the tweet user reference
			mongoose.model('Tweet').populate(tweets, { path: 'user', select: 'user -_id' }, function(err, tweets) {
				// Broadcast new tweet to clients
				io.sockets.emit('newtweet', tweets );
			});

			res.send( 200, JSON.stringify({message: "saved new tweet successfully."}) );
			return;
		});

		/*
		$.ajax({
		    type: 'POST',
		    url: '/form/',
		    data: '{"name":"jonas"}', // or JSON.stringify ({name: 'jonas'}),
		    success: function(data) { alert('data: ' + data); },
		    contentType: "application/json",
		    dataType: 'json'
		});
		*/
	});

	/**
		*	GET requests
		*/
	app.get('/logout', function(req, res) {
		console.log("in logout");

		req.logout();
		res.redirect('/');
	});


	// get everything
	app.get('/find', function(req, res) {
		mongoose.model('User').find().populate('tweets').exec(function(err,users) {
			res.send(users);
		});
	});


	// get all users
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

	// get friends of a user
	app.get('/friends/:user', function(req, res) {
		var user = req.params.user;
		console.log("in friends");
		mongoose.model('User').findOne({lowercaseName: user.toLowerCase()}).populate("friends").exec(function(err, doc) {
			res.send(doc);
		});
	});

	app.get('/friends/:id', function(req, res) {
		var id = req.params.id;

		mongoose.model('User').findOne({_id: id}).populate("friends").exec(function(err, doc) {
			res.send(doc);
		});
	});

	// get all tweets
	app.get('/tweets', function(req, res) {
		mongoose.model('Tweet').find().sort({_id: -1}).exec(function(err, tweets) {
				if (err) throw err;

				mongoose.model('Tweet').populate(tweets, { path: 'user', select: 'user -_id' }, function(err, tweets) {
					res.send(tweets);
				});
			});
	});

	// get all tweets barebone (withotu population, only object Id's for users)
	app.get('/tweetsbare', function(req, res) {
		mongoose.model('Tweet').find().sort({_id: -1}).exec(function(err, tweets) {
				if (err) throw err;

				res.send(tweets);
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