/*
 *	Init models for monogoose and mongodb
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// connect to mongodb from config file (.gitignored)
var dataBaseUrl = require('fs').readFileSync('./mongodb_auth', 'utf8');
mongoose.connect(dataBaseUrl);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

// auto add _id's (this is the default behaviour but I'm being explicit)
var options = { _id: true };

// helper function
var model = function(name, schema) {
	mongoose.model(name, new Schema( schema, options ));
};

// init models once connected to mongodb
db.once('open', function() {
	model('User', {
		// according to specs
		user: String,
		name: String,
		email: String,
		password: String,

		// additional
		auth: { time: Number, val: String },
		lowercaseName: String,

		friends: [{
			type: Schema.ObjectId, ref: 'User'
		}],

		tweets: [{
			type: Schema.ObjectId, ref: 'Tweet'
		}]
	});

	model('Tweet', {
		content: String,

		user: { type: Schema.ObjectId, ref: 'User' },

		comments: [{
			type: Schema.ObjectId, ref: 'Comment'
		}]
	});

	model('Comment', {
		content: String,
		user: { type: Schema.ObjectId, ref: 'User' },
		tweet: { type: Schema.ObjectId, ref: 'Tweet' }
	})
});