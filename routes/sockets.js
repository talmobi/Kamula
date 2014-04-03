/*
 *	real time updates for kamula using sockets.io
 */

var app = require('../app');

// attach socket.io to httpServer
var io = module.exports = require('socket.io').listen(app.httpServ);

// config socket.io
io.set('heartbeat timeout', 120); // def is 60
io.set('heartbeat interval', 50); // def is 25

var mongodb = require('./api');
var collection = mongodb.kamula;

// socket.io
io.sockets.on('connection', function(socket) {
	socket.emit('welcome', {message: "Successfully connected for realtime updates."});
	collection.update({type: "counter" }, { $inc: { counter: 1 } });

	// broadcasts and realtime updates are handled by the REST API
	// in api.js

	/*
	socket.on('newtweet', function(data) {
		// handle the new tweet
		if (typeof data === 'object') {
			if (data.type === 'tweet') { 
				socket.emit('newtweet', data); // update clients
			} else {
				console.log("Unkown event.");
			}
		}
	});

	socket.on('newuser', function(data) {
		// handle the new user
		if (typeof data === 'object') {
			if (data.type === 'user') { 
				socket.emit('newuser', data); // update clients
			} else {
				console.log("Unkown event.");
			}
		}
	});
	*/
});