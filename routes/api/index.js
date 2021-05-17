var express = require('express')
var fs = require('fs')
var path = require('path')
var multer = require('multer')
var User = require('../../models/user')
var Blogs = require('../../models/blogs')
var Classi = require('../../models/classification')
var router = express.Router()
var hljs = require('highlight.js')
var container = require('markdown-it-container')
var md = require('markdown-it')({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
          hljs.highlight(lang, str, true).value +
          '</code></pre>'
      } catch (__) {}
    }

    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'
  }
}).use(container, 'spoiler', {
  validate: function (params) {
    return params.trim().match(/^spoiler\s+(.*)$/)
  },

  render: function (tokens, idx) {
    var m = tokens[idx].info.trim().match(/^spoiler\s+(.*)$/)

    if (tokens[idx].nesting === 1) {
      // opening tag
      return '<details><summary>' + md.utils.escapeHtml(m[1]) + '</summary>\n'
    } else {
      // closing tag
      return '</details>\n'
    }
  }
}).use(require('markdown-it-deflist'))
// var md = new MarkdownIt()

var upload = multer({dest: 'public/images/'})

function jsonToString (json) {
  if (json.length < 1) {
    return
  }
  var chunk = ''
  for (var i = 0; i < json.length; ++i) {
    chunk += JSON.stringify(json[i]) + '|'
  }
  return chunk
}
function ifDir (thisPath) {
  // console.log(thisPath)
  return new Promise((resolve, reject) => {
    fs.access(thisPath, function (err) {
      if (err && err.code === 'ENOENT') {
        fs.mkdir(thisPath, function (err) {
          if (err) {
            console.error(err)
            reject(new Error(''))
          }
          resolve()
        })
      }
      resolve()
    })
  })
}
function saveImg (file, savePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(file.path, function (err, data) {
      if (err) {
        reject(new Error(err))
        console.error(err)
      }
      let time = Date.now() + parseInt(Math.random() * 999) + parseInt(Math.random() * 2222)
      let extname = file.mimetype.split('/')[1]
      let keepname = time + '.' + extname
      fs.writeFile(savePath + '/' + keepname, data, (err) => {
        if (err) {
          reject(new Error(err))
          console.error(err)
        }
        resolve(keepname)
        // newUser.portrait = 'images/' + newUser._id + '/' + keepname
      })
    })
  })
}
router.post('/login', function (req, res, next) {
  if (req.session.user) {
    User.findById(req.session.user._id).then(response => {
      res.send(response)
      res.end()
    })
  } else {
    if (req.body.username && req.body.password) {
      // 用于修改密码为加密格式
      // User.findOne({'account.username': req.body.username}).then(response => {
      //   console.log(response)
      //   User.encrypt(response).then(() => {
      //     new User(response).save().then(() => {
      //       console.log('保存成功！')
      //     })
      //   })
      // })
      User.findUserByNameAndPwd(req.body.username, req.body.password).then(response => {
        if (response) {
          req.session.user = response
          // res.cookie('userId', response._id, {maxAge: 1000 * 60 * 60 * 24 * 7})
          res.send(response)
          res.end()
        } else {
          res.send()
          res.end()
        }
      }).catch(err => {
        console.error(err)
      })
      // User.findUserByNameAndPwd(req.body.username, req.body.password, function (response) {
      //   if (response) {
      //     req.session.user = response
      //     // res.cookie('userId', response._id, {maxAge: 1000 * 60 * 60 * 24 * 7})
      //     res.send(response)
      //     res.end()
      //   } else {
      //     res.send('failed')
      //     res.end()
      //   }
      // })
    } else {
      res.send()
      res.end()
    }
  }
})
router.get('/exit', function (req, res, next) {
  req.session.user = null
  res.send()
  res.end()
})
router.get('/blogs', function (req, res, next) {
  Blogs.getBlogsTop(function (response) {
    // var chunk = ''
    // for (var i = 0; i < response.length; ++i) {
    //   chunk += JSON.stringify(response[i]) + '|'
    // }
    res.send(jsonToString(response))
    res.end()
  })
})
router.get('/findBlogs', function (req, res, next) {
  Blogs.findBlogs2(req.query.params, function (response) {
  // Blogs.findBlogs(req.query.params, function (response) {
    // var chunk = ''
    // for (var i = 0; i < response.length; ++i) {
    //   chunk += JSON.stringify(response[i]) + '|'
    // }
    res.send(jsonToString(response))
    res.end()
  })
})
router.get('/getBlog', function (req, res, next) {
  Blogs.updateOne({_id: req.query.blogId}, {$inc: {visits: 1}}, function (err, response) {
    if (err) {
      console.error(err)
    }
  })
  Blogs.getBlogById(req.query.blogId, function (response) {
    response.content = md.render(response.content)
    res.send(response)
    res.end()
  })
})
router.post('/getUserBlogs', function (req, res, next) {
  if (req.session.user) {
    Blogs.find({author: req.session.user._id}, {_id: 1, title: 1, author: 1, sub_title: 1, date: 1, isIssue: 1, visits: 1, comments: 1, category: 1}).sort({isIssue: 1}).then(response => {
      // console.log(response)
      res.send(jsonToString(response))
      res.end()
    })
  } else {
    res.send('toLogin')
    res.end()
  }
})
router.post('/deleteBlog', function (req, res, next) {
  Blogs.findOneAndDelete({_id: req.body.blogId}).then(response => {
    if (response) {
      res.send('successful')
      res.end()
    } else {
      res.send('filed')
      res.end()
    }
  })
})
router.post('/getBlogNoIssue', function (req, res, next) {
  if (req.session.user) {
    Blogs.findOne({author: req.session.user._id, isIssue: false}, {_id: -1, content: 1}, function (err, response) {
      if (err) {
        console.error(err)
      }
      if (response) {
        res.send(response.content)
        res.end()
      } else {
        res.send()
        res.end()
      }
    })
  } else {
    res.send('toLogin')
    res.end()
  }
})
router.get('/hotBlogs', function (req, res, next) {
  Blogs.findBlogsByHot(function (response) {
    res.send(jsonToString(response))
    res.end()
  })
})
router.get('/newBlogs', function (req, res, next) {
  Blogs.findBlogsByDate(function (response) {
    res.send(jsonToString(response))
    res.end()
  })
})
router.get('/getCategory', function (req, res, next) {
  if (!req.session.user) {
    res.send('toLogin')
    res.end()
  } else {
    Classi.getCategory(function (response) {
      res.send(response)
      res.end()
    })
  }
})
router.post('/issue', function (req, res, next) {
  if (req.session.user) {
    Blogs.findOneAndUpdate({author: req.session.user._id, isIssue: false}, {$set: {
      title: req.body.title,
      sub_title: req.body.sub_title,
      category: req.body.category,
      praises: 0,
      visits: 0,
      isIssue: true,
      date: new Date().toLocaleString()}}, {lean: true}, function (err, response) {
      if (err) {
        console.error(err)
      }
      if (response) {
        // 更新用户信息当中的blogs信息，保存以发布的博客ID
        User.findOneAndUpdate({_id: req.session.user._id}, {$push: {'blogs.blogs': response._id}}, {lean: true, new: true}).then(resp => {
          // console.log(resp)
        })
        res.send('successful')
        res.end()
      } else {
        res.send('failed')
        res.end()
      }
    })
  } else {
    res.send('toLogin')
    res.end()
  }
  // if (req.session.user) {
  //   var date = new Date()
  //   var blog = new Blogs({
  //     author: req.session.user._id,
  //     title: req.body.title,
  //     sub_title: req.body.sub_title,
  //     category: req.body.category,
  //     content: req.body.content,
  //     imgs: [],
  //     comments: [],
  //     praises: 0,
  //     visits: 0,
  //     date: date.toLocaleString()
  //   })
  //   blog.save(function (err, response) {
  //     if (err) {
  //       console.error(err)
  //     }
  //     if (response) {
  //       res.send('successful')
  //       res.end()
  //     } else {
  //       res.send('failed')
  //       res.end()
  //     }
  //   })
  // } else {
  //   res.send('toLogin')
  //   res.end()
  // }
})
router.post('/getBlogsByUser', function (req, res, next) {
  Blogs.find({author: req.body.userId, isIssue: true}, {_id: 1, title: 1, visits: 1}).then(response => {
    res.send(jsonToString(response))
    res.end()
  })
})
router.post('/issueComment', function (req, res, next) {
  if (req.session.user) {
    var comment = {
      authorID: req.session.user._id,
      authorName: req.session.user.general.nickname,
      content: req.body.content,
      commentDate: req.body.date
    }
    Blogs.addComment(req.body.blogId, comment, function (response) {
      if (response.ok >= 1) {
        res.send('successful')
        res.end()
      } else {
        res.send('failed')
        res.end()
      }
    })
  } else {
    res.send('toLogin')
    res.end()
  }
})
router.post('/getUser', function (req, res, next) {
  if (req.session.user) {
    var condition = {}
    if (req.body.filter) {
      condition = JSON.parse(req.body.filter)
      console.log(condition)
    }
    User.findById(req.session.user._id, condition).then(response => {
      console.log(response)
      res.send(response)
      res.end()
    }).catch(err => {
      console.error(err)
    })
  } else {
    res.send('toLogin')
    res.end()
  }
})
router.post('/setUser', upload.single('photo'), async function (req, res, next) {
  if (req.session.user) {
    var newUser
    var filter
    if (req.body.filter === 'general') {
      newUser = JSON.parse(req.body.user)
      console.log(newUser)
      filter = {general: newUser}
    } else if (req.body.filter === 'account') {
      newUser = JSON.parse(req.body.account)
      var json = {account: newUser}
      if (newUser.password) {
        newUser.password = await User.encrypt(json)
        filter = {'account.username': newUser.username, 'account.phone': newUser.phone, 'account.email': newUser.email, 'account.password': newUser.password}
      } else {
        filter = {'account.username': newUser.username, 'account.phone': newUser.phone, 'account.email': newUser.email}
      }
      console.log(filter)
    }

    if (req.file) {
      var thisPath = path.join(__dirname, '../../public/images/' + req.session.user._id + '/')
      ifDir(thisPath).then(() => {
        saveImg(req.file, thisPath).then(keepname => {
          newUser.portrait = 'images/' + req.session.user._id + '/' + keepname
          User.findOneAndUpdate({_id: req.session.user._id}, {$set: filter}, {lean: true, new: true}, function (err, response) {
            if (err) {
              console.error(err)
            }
            res.send(response)
            res.end()
          })
        })
      })
    } else {
      User.findOneAndUpdate({_id: req.session.user._id}, {$set: filter}, {lean: true, new: true}, function (err, response) {
        if (err) {
          console.error(err)
        }
        res.send(response)
        res.end()
      })
    }
    // var thisPath = path.join(__dirname, '../../public/images/' + req.session.user._id + '/')
    // console.log('path:', thisPath)
    // ifDir(thisPath).then(() => {
    //   if (req.file) {
    //     fs.readFile(req.file.path, (err, data) => {
    //       if (err) {
    //         console.error(err)
    //       }
    //       let time = Date.now() + parseInt(Math.random() * 999) + parseInt(Math.random() * 2222)
    //       let extname = req.file.mimetype.split('/')[1]
    //       let keepname = time + '.' + extname
    //       fs.writeFile(thisPath + '/' + keepname, data, (err) => {
    //         if (err) {
    //           console.error(err)
    //         }
    //         newUser.portrait = 'images/' + newUser._id + '/' + keepname
    //       })
    //     })
    //   }
    //   User.updateUser(req.session.user._id, newUser, function (response) {
    //     console.log(response)
    //     res.send(response)
    //     res.end()
    //   })
    // }).catch()
  } else {
    res.send('toLogin')
    res.end()
  }
})
router.post('/img', upload.single('test'), function (req, res, next) {
  if (req.session.user) {
    var thisPath = path.join(__dirname, '../../public/images/' + req.session.user._id + '/')
    ifDir(thisPath).then(() => {
      fs.readFile(req.file.path, (err, data) => {
        if (err) {
          console.error(err)
        }
        let time = Date.now() + parseInt(Math.random() * 999) + parseInt(Math.random() * 2222)
        let extname = req.file.mimetype.split('/')[1]
        let keepname = time + '.' + extname
        var filePath = path.join(thisPath, keepname)
        fs.writeFile(filePath, data, (err) => {
          if (err) {
            console.error(err)
          }
          res.send('images/' + req.session.user._id + '/' + keepname)
          res.end()
        })
      })
    }).catch()
  } else {
    res.send('toLogin')
    res.end()
  }
})
router.post('/generateMarkdown', function (req, res, next) {
  // console.log(req.body.data)
  // console.log(markdown.parse(req.body.data))
  // console.log(md.render(req.body.data))
  if (req.session.user) {
    var html = md.render(req.body.data)
    Blogs.findOneAndUpdate({author: req.session.user._id, isIssue: false}, {$set: {content: req.body.data}}, {upsert: true, lean: true}, function (err, response) {
      if (err) {
        console.error(err)
      }
    })
    res.send(html)
    res.end()
  } else {
    res.send('toLogin')
    res.end()
  }
})
router.post('/userPortrait', function (req, res, next) {
  // if (req.session.user) {
  if (req.body.userId) {
    User.findOne({_id: req.body.userId}, {'general.portrait': 1}, function (err, response) {
      if (err) {
        console.error(err)
      }
      res.send(response.general.portrait)
      res.end()
    })
  } else {
    res.send('needUserId')
    res.end()
  }
  // } else {
  //   res.send('toLogin')
  //   res.end()
  // }
})
router.post('/usernameVerify', function (req, res, next) {
  User.findOne({'account.username': req.body.username}, function (err, response) {
    if (err) {
      console.error(err)
    }
    if (!response) {
      res.send('successful')
    } else {
      res.send('not')
    }
    res.end()
  })
})
router.post('/register', upload.single('photo'), async function (req, res, next) {
  var user = new User({account: {username: req.body.username, password: req.body.password, date: new Date().toLocaleDateString()}, general: {nickname: '', name: '', portrait: ''}, blogs: {fans: [], favorites: [], praises: 0, level: 0}})
  if (req.file) {
    var thisPath = path.join(__dirname, '../../public/images/' + user._id + '/')
    await ifDir(thisPath).then(async () => {
      await saveImg(req.file, thisPath).then(imgPath => {
        user.general.portrait = 'images/' + user._id + '/' + imgPath
      })
    })
  }
  User.encrypt(user).then(() => {
    // console.log(user)
    user.save().then(response => {
      res.send(response)
      res.end()
    }).catch(err => {
      console.error(err)
      res.send('failed', err)
      res.end()
    })
  }).catch(err => {
    console.error(err)
    res.send('failed', err)
    res.end()
  })
})
module.exports = router
