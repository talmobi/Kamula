/**
	*	Do tests with SODA
	*/

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