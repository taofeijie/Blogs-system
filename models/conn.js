const mongoose = require('mongoose')
module.exports = new Promise((resolve, reject) => {
  mongoose.connect('mongodb://localhost:27017/my-website', {useNewUrlParser: true})
  mongoose.connection.once('open', err => {
    if (!err) {
      resolve()
    } else {
      // eslint-disable-next-line prefer-promise-reject-errors
      reject('the connect mongodb have err:' + err)
    }
  })
})
