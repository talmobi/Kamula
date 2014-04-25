/**
	*	Do tests with SODA
	*/

var soda = require('soda');
var assert = require('assert');
var jq = require('jquery');

var browser = soda.createClient({
	host: '127.0.0.1',
	port: '80',
	url: 'http://www.google.com',
	browser: 'firefox'
});


// check registration

browser
	.chain
	.session()
	.open('/')
	.type('user', 'TestUser')
	.type('passwd', 'losenord')
	.clickAndWait('registerButton')
	.assertTextPresent('logout')
	.testComplete()
	.end(function (err) {
		if (err) throw err;
		console.log('Test finished.');
	});


// check registration
/*
browser.get('/', function (res, jq) {
	console.log("doing tests.");

	jq('.myRegisterForm')
	.fill({
		myUsernameInput: 'TestUser',
		myFullNameInput: 'Terrible Muriel',
		myEmailInput: 'mail@snailmail.com',
		myPasswordInput: 'losenord'
	})
	.submit(function (res, jq) {
		jq(".navContainer .userName").text().should.requal('TestUser');
	})


	console.log("Tests finished.");
});
*/