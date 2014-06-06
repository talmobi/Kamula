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
		return browser.clickLink('#ProfileLink');
	})
	.then(function() {
		assert.ok(browser.success);
		testCount++;
		return 'OK';
	})

	// write tweet
	.then(function() {
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
		return browser.clickLink('#HomeLink');
	})
	.then(function() {
		assert.ok(browser.success);
		assert.equal(browser.text('#users H3'), 'Omat Kaverit');
		testCount++;
		return 'OK';
	})

	// logout
	.then(function() {
		return browser.clickLink('#LogoutLink');
	})
	.then(function() {
		assert.ok(browser.success);
	})

	// login
	.then(function() {
		return browser.clickLink('#LoginLink');
	})
	.then(function() {
		browser.fill('.myLoginForm .myUsernameInput', 'TestUser');
		browser.fill('.myLoginForm .myPasswordInput', 'password');
		return browser.pressButton('.myLoginForm .loginButton')
	})
	.then(function() {
		assert.ok('browser.success');
		testCount++;
		return 'OK';
	})

	// write comment
	.then(function() {
		return browser.clickLink('#ProfileLink');
	})
	.then(function() {
		return browser.clickLink('.tweet .media-body');
	})
	.then(function() {
		browser.fill('.tweet .writeComment input', 'My Beautiful Comment. 555');
		return browser.pressButton('.tweet .writeComment button');
	})
	.then(function() {
		asssert.ok('browser.success');
		testCount++;
		return 'OK';
	})

	// test updating of user data
	

	.then(function() {
		console.log("");
		console.log("++++++++++++++++++++");
		console.log("[" + testCount + "] tests done!");
		console.log("++++++++++++++++++++");
		console.log("");
	});

/*
	// test updating of user data

	.type(".myUpdateForm .myFullNameInput", "Stephen Fry") // uusi nimi
	.type(".myUpdateForm .myEmailInput", "new@mail.de") // uusi maili
	.click(".myUpdateForm .updateButton") // submit the updates

	// check the name change by reloading the profile page
	.open('/')
	.click("#ProfileLink") // go to profile
	.assertTextPresent("Stephen Fry") // is visible in the input placeholder attribute

	// delete the user
	.click(".myUpdateForm .deleteButton")

	// reload the page
	.open('/')

	.assertTextPresent("Register") // we should be logged out 

	// try to login to the user (and fail)
	// login
	.click('#LoginLink')
	.type('.myLoginForm .myUsernameInput', "TestUser") // set username
	.type('.myLoginForm .myPasswordInput', "losenord") // set password
	.click("myLoginForm .loginButton") // login

	.assertTextPresent("Register") // we should have failed to login

	.testComplete()
	.end(function (err) {
		if (err) throw err;
		console.log('Tests finished.');
	});


/**
	*
	* OLD SODA tests (requires selenium RC run as a host task beside the node app)
	* (clunky and complex -> zombie.js better)
	*	Do tests with SODA


	// TODO
	// Switching to other test framework for ease of use (run automatically by node)
	// maybe zombie.js

var soda = require('soda');
var assert = require('assert');
var jq = require('jquery');


var browser = soda.createClient({
	host: '127.0.0.1', // requires Selenium RC @http://docs.seleniumhq.org/download/
	port: '80',
	url: '127.0.0.1',
	browser: 'firefox'
});


// do tests

browser
	.chain
	.session()
	.open('/')

	// register user
	.type('#myUsernameInput', 'TestUser')
	.type('#myFullNameInput', 'Terrible Muriel')
	.type('#myEmailInput', 'mail@mail.com')
	.type('#myPasswordInput', 'losenord')
	.clickAndWait('#registerButton')
	.assertTextPresent('Logout')

	// go to profile view
	.click("#ProfileLink")
	.assertTextPresent('Update') // update form
	.assertTextPresent('Kirjoita') // tweet form

	// krijoita twiitti
	.type(".TwiitWritePanel input", 'Tweet Tweet 123456')
	.click(".TwiitWritePanel button")

	.assertTextPresent('Tweet Tweet 123456') // realtime updated tweet should be visible

	.click("#HomeLink") // goto home link - should see tuoreimmat tweets
	.assertTextPresent('Tweet Tweet 123456')

	.assertTextPresent('Omat Kaverit') // should see friends list

	.click("#LogoutLink") // logout

	.assertTextPresent('Register') // should see register button now
	.assertTextPresent('Not logged in.') // should see not logged in message
	.assertTextPresent('Käyttäjät') // should see käyttäjät

	.click("#userList .list-group-item") // click on any user

	.assertTextPresent("Tweets") // users tweets

	// login
	.click('#LoginLink')
	.type('.myLoginForm .myUsernameInput', "TestUser") // set username
	.type('.myLoginForm .myPasswordInput', "losenord") // set password
	.click("myLoginForm .loginButton") // login

	.assertTextPresent("Welcome, TestUser") // assert welcome message

	.click("#ProfileLink") // go to profile

	.click(".tweet .media-body") // click on first tweet (that we just made)
	.type(".tweet .writeComment input", "My Beautiful Comment. 555") // write a comment
	.click(".tweet .writeComment button") // submit the comment (input field is erased)

	.assertTextPresent("My Beautiful Comment. 555") // assert that the comment has been added

	// test updating of user data

	.type(".myUpdateForm .myFullNameInput", "Stephen Fry") // uusi nimi
	.type(".myUpdateForm .myEmailInput", "new@mail.de") // uusi maili
	.click(".myUpdateForm .updateButton") // submit the updates

	// check the name change by reloading the profile page
	.open('/')
	.click("#ProfileLink") // go to profile
	.assertTextPresent("Stephen Fry") // is visible in the input placeholder attribute

	// delete the user
	.click(".myUpdateForm .deleteButton")

	// reload the page
	.open('/')

	.assertTextPresent("Register") // we should be logged out 

	// try to login to the user (and fail)
	// login
	.click('#LoginLink')
	.type('.myLoginForm .myUsernameInput', "TestUser") // set username
	.type('.myLoginForm .myPasswordInput', "losenord") // set password
	.click("myLoginForm .loginButton") // login

	.assertTextPresent("Register") // we should have failed to login

	.testComplete()
	.end(function (err) {
		if (err) throw err;
		console.log('Tests finished.');
	});




// check registration
/* OLD TOBI tests
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