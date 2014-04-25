Kamula
======

Testit pitää ajaa Seleniumilla https://github.com/LearnBoost/soda/

Ajaaksen apin pitää vain pull:ata repo githubista, asentaa dependenciet 'npm install' kommennolla ja olet valmis.

Aja appi "node app" komennolla.

Tietokantana on käytössa mongolabs.com:in remote:i mongodb. pullauksen ohella tulee mongodb_auth tekstitiedosto missä on tietokanna tunnukset jota app:i etsii aloitusvaiheessa ja kytkee itsensä automaattisesti tietokantaan.


Description:	Kankea Twitter SPA tyyppinen appi toteutettu ainoastaan jQuery:illa (koin kankeaksi tehdä SPA appi jqueryilla pelkästään. En suosittele. (: ))


Kommentit (jos niitä on) saa näkyviin valitsemalla/klikkaamalla haluttua twiittiä (myös uudet kommentit tehdään näin (vaatii tunnistautumisen)).




[Toteutettu REST-rajapinta pitää dokumentoida (ks. esimerkki työohjeesta) ja dokumentti on myös Git-repositoriossa]
Vaadittu REST API, kai se tätä tarkotti?

//Lisää käyttäjän järjestelmään	Runkona lisättävä käyttäjä JSON-muodossa
app.post('/api/users')

// Hakee käyttäjän tiedot. Palauttaa käyttäjän tiedot JSON-muodossa
app.get('/api/users/:user)

// Päivittää käyttäjän tietoja. Runkona käyttäjän uudet tiedot JSON-muodossa,
// vaatii tunnistautumisen
app.put('/api/users/:user')

// Poistaa annetun käyttäjän. Vaatii tunnistautumisen.
app.delete('/api/users/:user')


Sitten vielä olemassa pari omaa rajapintaa missä saa esim 5 tuoreemmat twiitit, twiitin kirjoitus jne, tässä tärkeimmät:

/twiit POST
/addfriend POST
/addcomment POST
/tweets GET
/latest GET
/latestfriends GET
/logout GET
/users GET

Nyt pitäis kaikki olla kohdallaan, kello 23:52 -> git push