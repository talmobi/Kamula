
/*
 * GET home page.
 */

//exports.index = function(req, res){
//  res.render('index', { title: 'Express' });
//};

app = require('../app');

app.get('/', function(req, res, next) {
	res.render('index', {title: 'Awsome Title'});
});