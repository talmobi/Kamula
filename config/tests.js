/**
	* tests with zombiejs (zombie.labnotes.org)
	* http://zombie.labnotes.org/API
	*/

var ZombieBrowser = require('zombie');
var assert = require('assert');


var browser = new ZombieBrowser( {debug: true, runScripts: false} );

var testCount = 0;
var tests = 1;

browser.on('error', function(err) {
	console.log("------------");
	console.log(err);
	console.log("------------");
})

browser
	.visit('http://127.0.0.1/#')

	// Register user
	.then(function() {
		console.log("+++ Register Test +++");
		return browser.clickLink('#RegisterLink'); // returns promise for fn then
	})
	.then(function() {
		browser.fill('#myUsernameInput', 'TestUser');
		browser.fill('#myFullNameInput', 'Terrible Muriel')
		browser.fill('#myEmailInput', 'mail@mail.com')
		browser.fill('#myPasswordInput', 'password');
		return browser.pressButton('#registerButton');
	})
	.then(function() {
		assert.ok(browser.success);
		testCount++;
		return 'OK';
	})

	// profile view
	.then(function() {
		console.log("+++ Profile View Test +++");
		return browser.clickLink('#ProfileLink');
	})
	.then(function() {
		assert.ok(browser.success);
		testCount++;
		return 'OK';
	})

	// write tweet
	.then(function() {
		console.log("+++ Write Tweet Test +++");
		browser.fill('.TwiitWritePanel input', 'Tweet Tweet 123456');
		return browser.pressButton('.TwiitWritePanel button');
	})
	.then(function() {
		assert.ok(browser.success);
		testCount++;
		return 'OK';
	})

	// Home link test
	.then(function() {
		console.log("+++ Home Link Test +++");
		return browser.clickLink('#HomeLink');
	})
	.then(function() {
		assert.ok(browser.success);
		testCount++;
		return 'OK';
	})

	// logout
	.then(function() {
		console.log("+++ Logout Test +++");
		return browser.clickLink('#LogoutLink');
	})
	.then(function() {
		assert.ok(browser.success);
	})

	// login
	.then(function() {
		console.log("+++ Login Test +++");
		return browser.clickLink('#LoginLink');
	})
	.then(function() {
		browser.fill('.myLoginForm .myUsernameInput', 'TestUser');
		browser.fill('.myLoginForm .myPasswordInput', 'password');
		return browser.pressButton('.myLoginForm .loginButton')
	})
	.then(function() {
		assert.ok(browser.success);
		testCount++;
		return 'OK';
	})

	// test updating of user data
	.then(function() {
		console.log("+++ User Data Update Test +++");
		return browser.clickLink('#ProfileLink');
	})
	.then(function() {
		browser.fill('.myUpdateForm .myFullNameInput', 'Stephen Fry');
		browser.fill('.myUpdateForm .myEmailInput', 'new@mail.de');
		return browser.pressButton('.myUpdateForm .updateButton');
	})
	.then(function() {
		assert.ok(browser.success);
		testCount++;
		return 'OK';
	})

	// delete
	.then(function() {
		console.log("+++ Delete Test +++");
		return browser.pressButton('.myUpdateForm .deleteButton');
	})
	.then(function() {
		assert.ok(browser.success);
		testCount++;
		return 'OK';
	})

	// reload
	.then(function() {
		return browser.visit('http://127.0.0.1/#');
	})

	// login with deleted account (and fail)
	.then(function() {
		console.log("+++ Login to Deleted account Test +++");
		return browser.clickLink('#LoginLink');
	})
	.then(function() {
		browser.fill('.myLoginForm .myUsernameInput', 'TestUser');
		browser.fill('.myLoginForm .myPasswordInput', 'password');
		return browser.pressButton('.myLoginForm .loginButton')
	})
	.then(function() {
		assert.ok(browser.query('#LoginLink')); // not logged in
		testCount++;
		return 'OK';
	})

	.then(function() {
		console.log("");
		console.log("++++++++++++++++++++");
		console.log("[" + testCount + "] tests done!");
		console.log("++++++++++++++++++++");
		console.log("");
	});