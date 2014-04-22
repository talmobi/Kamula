var User = require('mongoose').model('User');

var maxNameLength = 30;
var nameExcludePattern = /[^a-zA-Z0-9]+/;
var maxTweetLength = 200;

module.exports = {
	registerNewUser: function(json) {
		// add necessary user values to the data
		// acquired from the client
		var userData = this.toUserData(json);

		// save the user to mongodb
		userData.save(function(err) {
			if (err) throw err;
		});

		return userData;
	},

	toPlainUser: function(json) {
		var userData = {
			user: json.user || "",
			name: json.name || "",
			email: json.email || "",
			password: json.password || "",
			
			lowercaseName: json.user.toLowerCase()
		};

		return userData;
	},

	toUserData: function(json) {
		var userData = new User( {
			user: json.user || "",
			name: json.name || "",
			email: json.email || "",
			password: json.password || "",
			
			lowercaseName: json.user.toLowerCase()
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
	},

	tweetIsOk: function(tweet) {
		return true;
	}

}