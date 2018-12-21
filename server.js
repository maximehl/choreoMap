// call the packages we need
var express    = require('express')      // call express
var bodyParser = require('body-parser')
var app        = express()     // define our app using express
var mongoose = require('mongoose')
mongoose.connect('mongodb://president:15hotpitches@ds139322.mlab.com:39322/choreomap', {useNewUrlParser: true})

// configure app to use bodyParser() and ejs
app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine','ejs')
app.use(express.static("public"))

require("./app/routes.js")(app);

app.listen(3000, () => {
  console.log('listening on 3000')
})
