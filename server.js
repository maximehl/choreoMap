// call the packages we need
var express    = require('express')      // call express
var bodyParser = require('body-parser')
var app        = express()     // define our app using express
var mongoose = require('mongoose')
var cookieParser = require('cookie-parser')
var session = require('express-session')
mongoose.connect('mongodb://president:15hotpitches@ds139322.mlab.com:39322/choreomap', {useNewUrlParser: true})

// configure app to use bodyParser() and ejs
app.use(bodyParser.json({limit: '50mb', extended: true}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.set('view engine','ejs')
app.use(express.static("public"))
app.use(express.static('/favicon.ico'))
app.use(cookieParser())

app.use(session({
  key: 'uSessionID',
  secret: 'hotpitches',
  resave: false,
  saveUninitialized: false,/*
  cookie: {} //session cookie: expires when browser closes. Use max-age:3600 for 1 hour */
}))

require("./app/routes.js")(app)

var port = process.env.PORT || 3000 //tagHere for Heroku, comment out the env.process.PORT if not on Heroku
app.listen(port, () => {
  console.log('listening on 3000')
})


/*tagHere: taskList

• figure out how to add your own page icon: public/page-icon.png
• to add encryption, just encrypt the passwords before sending to database.
  Then, when logging in, encrypt the password the user gives the same way
  and compare to the encrypted password from database
• add to Heroku
• use res.send to deal with errors, not url rewriting
• test the website on mobile with device toolbar: command + shift + M
• check everywhere for "tagHere"
• make dots able to drag as soon as they're clicked
• update the instructions
• empty response error?
*/
