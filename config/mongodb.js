/*
 *	Init models for monogoose and mongodb
 */
module.exports = function(mongoose) {
	var Schema = mongoose.Schema;

	// connect to mongodb (mongolabs.com) from config file (.gitignored)
	var dataBaseUrl = require('fs').readFileSync('./mongodb_auth', 'utf8');
	mongoose.connect(dataBaseUrl);

	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));

	// helper function
	var model = function(name, schema) {
		mongoose.model(name, new Schema( schema, { _id: true } ));
	};

	/**
		* Init models now (blocking) to mongodb
		*/
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
			type: Schema.Types.ObjectId, ref: 'User'
		}],

		tweets: [{
			type: Schema.Types.ObjectId, ref: 'Tweet'
		}]
	});

	model('Tweet', {
		content: String,
		user: { type: Schema.Types.ObjectId, ref: 'User' },
		comments: [{
			type: Schema.Types.ObjectId, ref: 'Comment'
		}]
	});

	model('Comment', {
		content: String,
		user: { type: Schema.Types.ObjectId, ref: 'User' },
		tweet: { type: Schema.Types.ObjectId, ref: 'Tweet' }
	})
}