var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParse = require('cookie-parser');
var session = require('express-session')
var app = express();


// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/src/assets/favicon.ico'))
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParse('sessiontest'));
app.use(session({
  secret: 'sessiontest',
  resave: true,
  saveUninitialized: true
}))

/**
 * 设置应用路由
 */
var routes = require('./routes/index');
routes.setroute(app);


module.exports = app;
