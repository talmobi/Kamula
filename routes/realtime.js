var httpServer = require('../app');

var io = require('socket.io').listen(httpServer); // attach socket.io to httpServer

var mongodb = require('./index');
var collection = mongodb.kamula;

// socket.io
io.sockets.on('connection', function(socket) {
	socket.emit('welcome', {message: "Successfully connected for realtime updates."});

	collection.update({type: "counter" }, { $inc: { counter: 1 } });

	socket.on('newtweet', function(data) {
		// handle the new tweet
		if (typeof data === 'object') {
			if (data.message.length < 20 && data.name.length > 0) { // error check tweet
				console.log("got new tweet"); // log
				collection.save(data); // save to db
				socket.emit('newtweet', data); // update clients
			} else {
				console.log("tweet was too long");
				socket.emit('event', {type: 'error', message: 'Tweet too long.'});
			}
		} else {
			console.log("unidentified data");
		}
	});	


});