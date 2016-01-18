'use strict';
const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');
const db = require('../lib/mongodb');

// Define a User schema
let userSchema = mongoose.Schema({
  trelloId:     String,
  token:        String,
  fullName:     String,
  username:     String,
  email:        String,
  avatarSource: String,
  avatarId:     String,
  recipeBoard:  String,
  thisWeek:     Array,
  boards:       Array,
});

// Create a findOrCreate function
userSchema.plugin(findOrCreate);

// Compile the schema to a MongoDB model
let User = mongoose.model('User', userSchema);

module.exports = User;
