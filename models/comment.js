var mongoose = require('mongoose')
var ObjectId = mongoose.Schema.Types.ObjectId
var CommentSchema = new mongoose.Schema({
  commentId: {type: ObjectId, index: true},
  authorId: {type: ObjectId, ref: 'User'},
  blogId: {type: ObjectId, ref: 'Blogs'},
  addCommentId: {type: ObjectId, ref: 'Comment'},
  content: {type: String},
  praises: {type: Number},
  replies: {type: Number}
})
var Commend = mongoose.model('Comment', CommentSchema)

module.exports = Commend
module.exports.Commend = CommentSchema
module.exports.add = function (newComment, callback) {
  newComment.save(callback)
}
module.exports.getCommentByBlogId = function (blogId, callback) {
  Commend.findOne({blogId: blogId})
}
