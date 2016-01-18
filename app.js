// Try this sweet ES2015 syntax. Or is it ES6? Honestly,
// pick a name, people.
'use strict';

const compression = require('compression');
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('flash');
const helmet = require('helmet');

// Load config file
let config = require('./config/config');

// Load Passport for oAuth
let passport = require('./lib/passport');

// Require and initialize helpers
const helpers = require('./lib/helpers').helpers;
let helper = new helpers();

// Load routes
let routes = require('./routes/index');
let users = require('./routes/users');
let auth = require('./routes/auth');
let recipes = require('./routes/recipes');

let app = express();

// Enable gzip compression
app.use(compression());

// Enable helmet
app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(session( config.app.session ));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));

// Passport config
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// Check if the user is logged in on each request and set
// it to app.locals.loggedIn to make it available everywhere.
app.use(function(req, res, next) {
  app.locals.loggedIn = helper.loggedIn(req);
  next();
});

// Check for a flash on every request and set the last flash to
// app.locals.flash
app.use(function(req, res, next) {
  app.locals.flash = req.session.flash.shift()
  next();
});

// Load routes after the login check to make sure it's available.
app.use('/', routes);
app.use('/users', users);
app.use('/auth', auth);
app.use('/recipes', recipes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('application/error', {
      message: err.message,
      error: err.status,
      title: 'Whoopsie'
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('application/error', {
    title: 'Whoopsie',
    message: err.message,
    error: {}
  });
});

module.exports = app;
