'use strict';

// Require modules
let express = require('express');

// Initialize router
let router = express.Router();

// Require and initialize helpers
const helpers = require('../lib/helpers').helpers;
let helper = new helpers();

// [GET] /
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Welcome to Week of Food',
    loggedIn: req.app.locals.loggedIn,
    flash: req.app.locals.flash
  });
});

module.exports = router;
