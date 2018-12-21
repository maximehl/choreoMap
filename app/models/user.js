var mongoose = require("mongoose")

var userSchema = mongoose.Schema({
  username: String,
  password: String
  //this is a very safe storage solution
})

module.exports = mongoose.model('User', userSchema)
