var mongoose = require('mongoose')

var classificationSchema = new mongoose.Schema({
  软件工程: {type: Number},
  计算机科学与技术: {type: Number},
  计算机图形学: {type: Number},
  计算机应用: {type: Number},
  高等数学: {type: Number},
  高等英语: {type: Number},
  计算机视觉: {type: Number},
  else: {type: Number}
})
var Classification = mongoose.model('Classification', classificationSchema)
module.exports = Classification
module.exports.Classification = classificationSchema
module.exports.getCategory = function (callback) {
  Classification.findOne({}, {_id: 0, __v: 0}, function (err, response) {
    if (err) { throw err }
    callback(response)
  })
}
