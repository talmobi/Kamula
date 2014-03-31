
/*
 * GET home page.
 */

app = require('../app');

app.get('/', function(req, res, next) {
	res.render('index', {title: 'Awsome Title'});
});


app.get('/find', function(req, res) {
	mongodb.kamula.find({}, function(err, data) {
		res.send(data);
	});
});
