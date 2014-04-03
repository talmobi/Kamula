/*
 *	real time updates for kamula using sockets.io
 *
 */

var app = require('../app');

var io = require('socket.io').listen(app.httpServ); // attach socket.io to httpServer

var mongodb = require('./api');
var collection = mongodb.kamula;

// socket.io
io.sockets.on('connection', function(socket) {
	socket.emit('welcome', {message: "Successfully connected for realtime updates."});

	collection.update({type: "counter" }, { $inc: { counter: 1 } });

	socket.on('newtweet', function(data) {
		// handle the new tweet
		if (typeof data === 'object') {
			if (data.type === 'tweet') { 
				socket.emit('newtweet', data); // update clients
			} else {
				console.log("Unkown tweet.");
			}
		}
	});
});