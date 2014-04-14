var User = require('mongoose').model('User');

module.exports = {
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