var mongoose = require("mongoose")

var positionSchema = mongoose.Schema({
  xCoord: Number,
  yCoord: Number
})

var performerSchema = mongoose.Schema({
  perfName: String,
  groupN: Number,
  positions: [positionSchema]
})

var groupSchema = mongoose.Schema({
  groupName: String,
  groupColor: String //hexcode of group color
})

var formationSchema = mongoose.Schema({
  formName: String,
  timecode: Number,
  moveLength: Number
})

var dataSchema = mongoose.Schema({
  choreoName: String,
  fileLink: String,
  performers: [performerSchema],
  groups: [groupSchema],
  formations: [formationSchema]
})

module.exports = mongoose.model('ChoreoData', dataSchema)
