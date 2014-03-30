
/*
 * GET home page.
 */

//exports.index = function(req, res){
//  res.render('index', { title: 'Express' });
//};

app = require('../app');

app.get('/', function(req, res) {
	res.send('home Test');
});

require('./user');