// call the packages we need
var express    = require('express')      // call express
var bodyParser = require('body-parser')
var app        = express()     // define our app using express
var mongoose = require('mongoose')
var cookieParser = require('cookie-parser')
var session = require('express-session')
mongoose.connect('mongodb://president:15hotpitches@ds139322.mlab.com:39322/choreomap', {useNewUrlParser: true})

// configure app to use bodyParser() and ejs
app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine','ejs')
app.use(express.static("public"))
app.use(express.static('public/page-icon.png'))
app.use(cookieParser())

app.use(session({
  key: 'uSessionID',
  secret: 'hotpitches',
  resave: false,
  saveUninitialized: false,/*
  cookie: {} //session cookie: expires when browser closes. Use max-age:3600 for 1 hour */
}))

require("./app/routes.js")(app)

var port = /*env.process.PORT ||*/ 3000 //tagHere for Heroku
app.listen(port, () => {
  console.log('listening on 3000')
})


/*tagHere: taskList

• figure out how to add your own page icon: public/page-icon.png
• to add encryption, just encrypt the passwords before sending to database.
  Then, when logging in, encrypt the password the user gives the same way
  and compare to the encrypted password from database
• figure out how to check if the user is logged in when new session begins
  • or why the cookie doesn't clear until you access the next page
• add to Heroku
• make a fancy canvas-expanding animation when the choreo loads
• make a fancy "sort by group" option on the edit page performers sidebar
• make the top bar a navigation bar, rather than ugly buttons
• use res.send to deal with errors, not url rewriting
• test the website on mobile with device toolbar: command + shift + M
• check thrown errors on login, signup pages, so that changing errorDiv css from
  inline-block to block doesn't make stuff ugly
• add method to edit the color of a group
• check everywhere for "tagHere"
  • undelete the window beforeunload comment
• on pause of the audio, change the formation timecode form input to the current timecode
  • you'll have to convert from seconds to the --:--.- format
• make dots able to drag as soon as they're clicked

*/
