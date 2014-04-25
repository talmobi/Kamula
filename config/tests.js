/**
	*	Do tests with tobi
	*/

var tobi = require('tobi');
var browser = tobi.createBrowser(80, '127.0.0.1');

// check registration
browser.get('/', function (res, $)) {
	console.log("doing tests.");

	$('myRegisterForm')
	.fill({
		myUsernameInput: 'TestUser',
		myFullNameInput: 'Terrible Muriel',
		myEmailInput: 'mail@snailmail.com',
		myPasswordInput: 'losenord'
	})
	.submit(function (res, $) {
		$(".navContainer .userName").text().should.requal('TestUser');
	})


	console.log("Tests finished.");
}