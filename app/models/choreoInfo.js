var mongoose = require("mongoose")

var infoSchema = mongoose.Schema({
  choreoName: {type: String, text: true},
  owner: String,
  fileLink: String
})

module.exports = mongoose.model('ChoreoInfo', infoSchema)
