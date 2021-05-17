var mongoose = require('mongoose')
var ObjectId = mongoose.Schema.Types.ObjectId

var BlogsScmea = new mongoose.Schema({
  blogsId: {type: ObjectId, index: true},
  author: {type: ObjectId, ref: 'User'},
  category: {type: String},
  title: {type: String},
  sub_title: {type: String},
  content: {type: String},
  imgs: [],
  comments: [],
  visits: {type: Number},
  praises: {type: Number},
  date: {type: Date},
  isIssue: {type: String}
})

var Blogs = mongoose.model('Blogs', BlogsScmea)
module.exports = Blogs
module.exports.Blogs = BlogsScmea
module.exports.getBlogsTop = function (callback) {
  Blogs.find({isIssue: true}, {_id: 1, title: 1, sub_title: 1, date: 1, author: 1}).sort({visits: -1}).limit(20).exec(function (err, response) {
    if (err) {
      console.error((err))
    }
    callback(response)
  })
}
module.exports.findBlogs = function (query, callback) {
  // var condition = {$or: [{title: {$regex: '[' + query + ']', $options: 'i'}}, {sub_title: {$regex: '[' + query + ']', $options: 'i'}}]}
  var condition = {$or: [{title: {$regex: '' + query + '', $options: 'i'}}, {sub_title: {$regex: '[' + query + ']', $options: 'i'}}]}
  Blogs.find(condition, {_id: 1, title: 1, sub_title: 1, date: 1, author: 1}).sort({visits: -1}).exec(function (err, response) {
    if (err) {
      console.err(err)
    }
    callback(response)
  })
}
module.exports.findBlogs2 = function (query, callback) {
  Blogs.find({$text: {$search: query}}, {score: {$meta: 'textScore'}}, {_id: 1, title: 1, sub_title: 1, date: 1, author: 1}).sort({score: {$meta: 'textScore'}}).exec(function (err, response) {
    if (err) {
      console.error(err)
    }
    console.log(response)
    callback(response)
  })
}
module.exports.create = function (newBlog, callback) {
  newBlog.save(callback)
}
module.exports.getBlogById = function (id, callback) {
  // Blogs.findById(id, callback)
  Blogs.findOne({_id: id}).populate('author').exec(function (err, response) {
    if (err) {
      console.error(err)
    }
    callback(response)
  })
  // Blogs.find({_id: id}).populate('author').run(callback)
}
module.exports.addComment = function (blogId, comment, callback) {
  console.log(comment)
  Blogs.updateOne({_id: blogId}, {$push: {comments: comment}}, function (err, response) {
    if (err) {
      console.error(err)
    }
    callback(response)
  })
}
module.exports.findBlogsByHot = function (callback) {
  Blogs.find({}, {_id: 1, title: 1, sub_title: 1}).limit(10).sort({visits: -1}).exec(function (err, response) {
    if (err) {
      console.error(err)
    }
    callback(response)
  })
}
module.exports.findBlogsByDate = function (callback) {
  Blogs.find({}, {_id: 1, title: 1, sub_title: 1}).limit(10).sort({date: -1}).exec(function (err, response) {
    if (err) {
      console.error(err)
    }
    callback(response)
  })
}
