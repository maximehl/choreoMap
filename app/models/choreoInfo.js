var mongoose = require("mongoose")

var infoSchema = mongoose.Schema({
  choreoName: String,
  owner: String,
  fileLink: String
})

module.exports = mongoose.model('ChoreoInfo', infoSchema)
