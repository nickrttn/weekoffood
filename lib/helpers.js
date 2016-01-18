'use strict';

// Require modules
const fs = require('fs');
const request = require('request');
const gravatar = require('gravatar');
const path = require('path');
const Grid = require('gridfs-stream');

// Require libs
const db = require('../lib/mongodb');

// Require models
const User = require('../models/user');

// Initialize GridFS
let gfs = Grid(db.db);

// Define helpers
let helpers = function () {

  // loggedIn: checks if user is logged in
  this.loggedIn = function loggedIn(req) {
    return req.session.passport ? true : false;
  }

  // getAvatar: checks if user has Gravatar and saves file in GridFS
  // after checking if it exists. If user doesn't have Gravatar or the
  // file exists, either render the file or render an upload form.
  this.getAvatar = function getAvatar(user, cb) {
    // If the user already has an avatarId, he must have an avatar.
    // return the avatarId to the user.
    if (user.avatarId) {
      cb(user.avatarId);
    } else {
      if (user.avatarSource == 'gravatar') {
        // If the user doesn't have an avatar ID we must create an avatar.
        // Download it from Gravatar and store it in GridFS.
        this.storeGravatar(user, cb);
      } else {
        cb(false);
      }
    }
  }

  this.storeGravatar = function storeGravatar(user, cb) {
    // Set up the request, where encoding: null makes request send
    // an actual Buffer instead of something else.

    let params = {
      encoding: null,
      url: gravatar.url(user.email, { s: '500', d: '404' }, true)
    };

    // Create the request
    let avatar = request.get(params);

    // When we get a response
    avatar.on('response', function(res) {

      // Create a GridFS WriteStream and set it up
      let writestream = gfs.createWriteStream({
        filename: user.username + '.' + res.headers['content-type'].split('/')[1],
        content_type: res.headers['content-type'],
        mode: 'w',
        metadata: {
          belongs_to: user._id
        }
      });

      // Pipe the data into the writestream
      avatar.pipe(writestream);

      // When it's closed, update the user with the avatarId that's just been created.
      writestream.on('close', function(file) {
        User.findOneAndUpdate({ _id: user._id }, { avatarId: file._id }, { new: true }, function(err, user) {
          cb(user.avatarId);
        });
      });
    });
  }

  this.storeAvatar = function storeAvatar(user) {}
}

exports.helpers = helpers;
