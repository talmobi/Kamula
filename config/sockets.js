/*
 *	real time updates for kamula using sockets.io
 */


var app = require('../app');

// attach socket.io to httpServer
var io = module.exports = require('socket.io').listen(app.httpServer);

// config socket.io
io.set('heartbeat timeout', 60); // def is 60
io.set('heartbeat interval', 25); // def is 25

// socket.io
io.sockets.on('connection', function(socket) {
	console.log("new cllient");
	// send welcome message
	socket.emit('welcome', { 
		message: "Successfully connected for realtime updates.",
	});

	var count = io.sockets.clients().length;
	io.sockets.emit('usersOnline', { usersOnline: count } );

	console.log('client CONNECTED, Number of clients: ' + io.sockets.clients().length);

	socket.on('disconnect', function(socket) {
		var count = io.sockets.clients().length;
		io.sockets.emit('usersOnline', { usersOnline: count - 1 } );
		console.log('client DISCONNECTED, Number of clients: ' + count);
	});

});