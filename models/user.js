var mongoose = require('mongoose')
var ObjectId = mongoose.Schema.Types.ObjectId
var Blogs = require('./blogs')
var bcrypt = require('bcryptjs')
var conn = require('./conn')
console.log(conn)
conn.then(function () {
  console.log('connection successful')
}).catch(function (err) {
  console.log(err)
})
var Schema = mongoose.Schema

var UserSchema = new Schema(
  {
    account: {
      // userId: {type: ObjectId, index: true},
      username: {type: String, unique: false},
      password: {type: String},
      phone: {type: String},
      email: {type: String},
      date: {type: Date},
      level: {type: Number}
    },
    general: {
      nickname: {type: String},
      name: {type: String},
      age: {type: Number},
      gender: {type: String},
      college: {type: String},
      portrait: {type: String},
      school: {type: String},
      grade: {type: String},
      class: {type: String},
      major: {type: String},
      birthday: {type: String}
    },
    blogs: {
      favorites: [ObjectId],
      favorited: [ObjectId],
      fans: [ObjectId],
      fansed: [ObjectId],
      praises: {type: Number},
      history: [Blogs.Blogs],
      blogs: [{type: ObjectId, ref: 'Blogs'}]
    },
    userId: {type: ObjectId, index: true}
    // username: {type: String, unique: true},
    // password: {type: String},
    // name: {type: String},
    // nickname: {type: String},
    // age: {type: Number},
    // gender: {type: String},
    // portrait: {type: String},
    // school: {type: String},
    // grade: {type: String},
    // class: {type: String},
    // major: {type: String},
    // favorites: [ObjectId],
    // favorited: [ObjectId],
    // fans: [ObjectId],
    // fansed: [ObjectId],
    // praises: {type: Number},
    // history: [Blogs.Blogs],
    // blogs: [Blogs.Blogs]
  })

var User = mongoose.model('User', UserSchema)

module.exports = User
module.exports.User = UserSchema
module.exports.encrypt = function (user) {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) {
        console.error(err)
        reject(new Error(err))
      } else {
        bcrypt.hash(user.account.password, salt, function (err, saltPwd) {
          if (err) {
            console.error(err)
            reject(new Error(err))
          }
          user.account.password = saltPwd
          resolve(saltPwd)
          // user.save((err, response) => {
          //   if (err) {
          //     console.error(err)
          //     reject(new Error(err))
          //   }
          //   resolve(response)
          // })
        })
      }
    })
  })
}
module.exports.createUser = function (newUser) {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) {
        reject(new Error(err))
        throw err
      }
      bcrypt.hash(newUser.password, salt, function (err, saltPwd) {
        if (err) {
          reject(new Error(err))
          console.error(err)
        }
        newUser.password = saltPwd
        newUser.save(function (err, response) {
          if (err) {
            reject(new Error(err))
            console.error(err)
          }
          resolve(response)
        })
      })
    })
  })
}
module.exports.findUser = function (id, callback) {
  User.findById(id, function (err, response) {
    if (err) {
      console.error(err)
    }
    callback(response)
  })
}
module.exports.findUserByNameAndPwd = function (username, password) {
  return new Promise((resolve, reject) => {
    User.findOne({'account.username': username}, function (err, response) {
      if (err) {
        reject(new Error(err))
        throw err
      }
      if (response) {
        bcrypt.compare(password, response.account.password, function (err, content) {
          if (err) {
            reject(new Error(err))
            throw err
          }
          if (content) {
            resolve(response)
          } else {
            resolve(null)
          }
        })
      } else {
        resolve(null)
      }
    })
  })
}
module.exports.updateUser = function (userId, newUser, callback) {
  User.findOneAndUpdate({_id: userId}, newUser, {new: true, lean: true}, function (err, response, response2) {
    if (err) {
      console.error(err)
    }
    callback(response)
  })
}
//
// module.exports.createUser = function (newUser, callback) {
//     bcrypt.genSalt(10, function(err, salt){
//         bcrypt.hash(newUser.password, salt, function (err, saltPwd) {
//             newUser.password = saltPwd
//             newUser.save(callback)
//         })
//     })
// }
// module.exports.removeUser = function (ObjId, callback) {
//     Users.remove({ObjectId: ObjId}, callback)
// }
