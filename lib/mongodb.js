'use strict';
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');

// Load the config
let config = require('../config/config');

// Connect to MongoDB
mongoose.connect('mongodb://' + config.mongodb.host + ':' + config.mongodb.port);
let db = mongoose.connection;
Grid.mongo = mongoose.mongo;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('We\'re connected to MongoDB.');

});

module.exports = db;
