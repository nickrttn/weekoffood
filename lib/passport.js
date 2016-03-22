'use strict';

// Load modules
const mongoose = require('mongoose');
const passport = require('passport');
const Trello = require('node-trello');
const oAuthStrategy = require('passport-oauth').OAuthStrategy;
const User = require('../models/user');

// Load the config file
let config = require('../config/config');

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findOne({ _id: id }, (err, user) => {
    done(err, user);
  });
});

// Set up the Passport Strategy
passport.use('trello', new oAuthStrategy(
  // Use the passport config object from the config file
  config.trello, (req, token, tokenSecret, profile, done) => {
    // Initialize a connection with Trello using those tokens we just got.
    let t = new Trello(config.trello.consumerKey, token);

    // request the user profile
    t.get('/1/members/me', (err, data) => {

      // console.log(data);

      // Find or create the User by trelloId
      User.findOrCreate({ trelloId: data.id }, {
        token:        token,
        fullName:     data.fullName,
        username:     data.username,
        email:        data.email,
        boards:       data.idBoards,
        avatarSource: data.avatarSource
      }, (err, user, created) => {
        if(err) throw err;
        done(null, user);
      });
    });
	}
));

// Export the module
module.exports = passport;
