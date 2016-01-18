'use strict';

// Require modules
const express = require('express');
const async = require('async');
const gravatar = require('gravatar');
const Trello = require('node-trello');
const request = require('request');
const Grid = require('gridfs-stream');
const Busboy = require('busboy');
const flash = require('express-flash-notification');

// Require libs
const db = require('../lib/mongodb');
const passport = require('../lib/passport');

// Require models
const User = require('../models/user');

// Initialize GridFS
let gfs = Grid(db.db);

// Require and initialize helpers
const helpers = require('../lib/helpers').helpers;
let helper = new helpers();

// Require config
let config = require('../config/config');

// Initialize the router
let router = express.Router();

/* [GET] /users */
router.get('/', function(req, res, next) {

  // If the proper session exists
  if ( req.app.locals.loggedIn ) {

    // find the user in the database
    User.findOne({ _id: req.session.passport.user }, function(err, user) {
      if (err) throw err;

      helper.getAvatar(user, function(avatarId) {

        // create a new Trello instance
        let t = new Trello(config.trello.consumerKey, user.token);

        // create an empty array to hold user board info
        let boards = [];

        // use async to query the Trello API for each board ID
        async.each(user.boards, function(board, callback) {

          // add the necessary data for each board to the boards array
          t.get('/1/boards/' + board, function(err, data) {
            boards.push( { id: data.id, name: data.name } );

            // signal async we're done
            callback();

          });
        }, function(err){
          if (err) throw err;

          res.render('users/index', {
            title: 'Profile',
            name: user.fullName,
            username: user.username,
            boards: boards,
            avatarId: avatarId,
            flash: req.app.locals.flash
          });
        });
      });
    });

    // if it doesn't
  } else {
    // redirect to /users/login
    res.redirect(303, '/users/login');
  }
});

// Redirect the user to oAuth immediately.
// We just want this route for neat presentation.
router.get('/login', function(req, res) {
	res.redirect(303, '/auth/trello');
});

// [GET] /users/avatar/:id
router.get('/avatar/:id', function(req, res, next) {

  // Find the requested ID in GridFS,
  gfs.findOne({ _id: req.params.id }, function(err, file) {

    res.set('Content-Type', file.contentType);

    // set up a stream,
    let readStream = gfs.createReadStream({ _id: file._id });

    // and stream the avatar to the user.
    readStream.pipe(res);
  });
});

// [POST] /users/avatar/upload
router.post('/avatar/upload', function(req, res) {

  // Initialize busboy with the request headers
  let busboy = new Busboy({ headers: req.headers });

  // Listen for a file event to start streaming
  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {

    // Create a GridFS WriteStream
    let writestream = gfs.createWriteStream({
      filename: filename,
      content_type: mimetype,
      mode: 'w',
      metadata: {
        belongs_to: req.session.passport.user
      }
    });

    // Pipe the file into GridFS
    file.pipe(writestream);

    // When it's closed, update the user with the avatarId that's just been created.
    writestream.on('close', function(file) {
      User.findOneAndUpdate({ _id: req.session.passport.user }, { avatarId: file._id }, function(req, user) {
        res.redirect(303, '/users');
      });
    });
  });

  // Actually pipe the request into busboy, or it won't work.
  req.pipe(busboy);
});

// [GET] /users/logout
router.get('/logout', function(req, res) {
  req.session.destroy();
  res.redirect(303, '/');
});

module.exports = router;
