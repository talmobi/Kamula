var User = require('mongoose').model('User');
var io = require('./sockets');

module.exports =  {
	registerNewUser: function(json) {
		// add necessary user values to the data
		// acquired from the client
		var userData = new User( {
			user: json.user || "",
			name: json.name || "",
			email: json.email || "",
			password: json.password || "",
			
			lowercaseName: json.user.toLowerCase(),
		});

		// save the user to mongodb
		userData.save(function(err) {
			if (err) throw err;

			// delete password before sending the user data
			delete userData.password;
			
			// broadcast changes to all connected clients
			//io.sockets.emit('newuser', userData);
		});

		return userData;
	},

	nameIsOk: function(name) {
		if (typeof name !== 'string') {
			return false;
		}
		if ((name.length > maxNameLength) || nameExcludePattern.test(name)) {
			return false;
		}
		return true;
	}
}