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
db.once('open', function() {

	var options = {
		_id: true
	};

	var userSchema = new Schema({
		// specced
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
	}, options);

	var tweetSchema = new Schema({
		content: String,

		user: { type: Schema.ObjectId, ref: 'User' },

		comments: [{
			type: Schema.ObjectId, ref: 'Comment'
		}]
	}, options)

	var commentSchema = new Schema({
		content: String,
		user: {type: Schema.ObjectId, ref: 'User'},
		tweet: { type: Schema.ObjectId, ref: 'Tweet' }
	}, options)

	// create the models
	var User = mongoose.model('User', userSchema);
	var Tweet = mongoose.model('Tweet', tweetSchema);
	var Comment = mongoose.model('Comment', commentSchema);

});