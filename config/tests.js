/**
	* tests with zombiejs (zombie.labnotes.org)
	*/

var ZombieBrowser = require('zombie');
var assert = require('assert');


var browser = new ZombieBrowser();

browser.on('error', function(err) {
	console.log(err);
})

browser
	.visit('http://localhost:80/')

	// register user
	.then(function() { // promise
		browser.fill('#myUsernameInput', 'TestUser')
		browser.fill('#myFullNameInput', 'Terrible Muriel')
		browser.fill('#myEmailInput', 'mail@mail.com')
		browser.fill('#myPasswordInput', 'losenord')
		.clickAndWait('#registerButton')
		.assertTextPresent('Logout')
	})

	// go to profile view
	.then(function() {
		browser.pressButton("#ProfileLink")
		browser.assertTextPresent('Update') // update form
		browser.assertTextPresent('Kirjoita') // tweet form
	})

	// krijoita twiitti
	browser.fill(".TwiitWritePanel input", 'Tweet Tweet 123456')
	browser.pressButton(".TwiitWritePanel button")

	browser.assertTextPresent('Tweet Tweet 123456') // realtime updated tweet should be visible

	browser.pressButton("#HomeLink") // goto home link - should see tuoreimmat tweets
	browser.assertTextPresent('Tweet Tweet 123456')

	browser.assertTextPresent('Omat Kaverit') // should see friends list

	browser.pressButton("#LogoutLink") // logout

	browser.assertTextPresent('Register') // should see register button now
	browser.assertTextPresent('Not logged in.') // should see not logged in message
	browser.assertTextPresent('Käyttäjät') // should see käyttäjät

	browser.pressButton("#userList .list-group-item") // click on any user

	browser.assertTextPresent("Tweets") // users tweets

	// login
	browser.pressButton('#LoginLink')
	browser.fill('.myLoginForm .myUsernameInput', "TestUser") // set username
	browser.fill('.myLoginForm .myPasswordInput', "losenord") // set password
	browser.pressButton("myLoginForm .loginButton") // login

	browser.assertTextPresent("Welcome, TestUser") // assert welcome message

	browser.pressButton("#ProfileLink") // go to profile

	browser.pressButton(".tweet .media-body") // click on first tweet (that we just made)
	browser.fill(".tweet .writeComment input", "My Beautiful Comment. 555") // write a comment
	browser.pressButton(".tweet .writeComment button") // submit the comment (input field is erased)

	browser.assertTextPresent("My Beautiful Comment. 555") // assert that the comment has been added

	// test updating of user data

	browser.fill(".myUpdateForm .myFullNameInput", "Stephen Fry") // uusi nimi
	browser.fill(".myUpdateForm .myEmailInput", "new@mail.de") // uusi maili
	browser.pressButton(".myUpdateForm .updateButton") // submit the updates

	// check the name change by reloading the profile page
	browser.open('/')
	browser.pressButton("#ProfileLink") // go to profile
	browser.assertTextPresent("Stephen Fry") // is visible in the input placeholder attribute

	// delete the user
	browser.pressButton(".myUpdateForm .deleteButton")

	// reload the page
	browser.open('/')

	browser.assertTextPresent("Register") // we should be logged out 

	// try to login to the user (and fail)
	// login
	browser.pressButton('#LoginLink')
	browser.fill('.myLoginForm .myUsernameInput', "TestUser") // set username
	browser.fill('.myLoginForm .myPasswordInput', "losenord") // set password
	browser.pressButton("myLoginForm .loginButton") // login

	browser.assertTextPresent("Register") // we should have failed to login

	browser.testComplete()
	browser.end(function (err) {
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