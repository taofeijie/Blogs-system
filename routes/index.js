
const api = require('./api')

function setroute (app) {
  app.use(function (req, res, next) {
    next()
  })
  app.use('/', api)
  app.use('/api', api)
}

exports.setroute = setroute
