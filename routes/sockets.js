/*
 *	real time updates for kamula using sockets.io
 */

var app = require('../app');

// attach socket.io to httpServer
var io = module.exports = require('socket.io').listen(app.httpServ);

// config socket.io
io.set('heartbeat timeout', 60); // def is 60
io.set('heartbeat interval', 25); // def is 25

// socket.io
io.sockets.on('connection', function(socket) {
	// send welcome message
	socket.emit('welcome', {message: "Successfully connected for realtime updates."});
	console.log('client CONNECTED, Number of clients: ' + io.sockets.clients().length);

	socket.on('disconnect', function(socket) {
		console.log('client DISCONNECTED, Number of clients: ' + io.sockets.clients().length);
	});
});
