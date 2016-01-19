'use strict';

// Require modules
const express = require('express');
const Trello = require('node-trello');
const marked = require('marked');
const async = require('async');

// Require model
const User = require('../models/user');

// Require config file
let config = require('../config/config');

// Initialize the router
let router = express.Router();

// Catch all non-logged in users and send them to login
router.get('*', function(req, res, next) {
	if (req.app.locals.loggedIn) {
			next();
	} else {
		res.redirect(303, '/');
	}
});

// [GET] /recipes
router.get('/', function(req, res, next) {

	User.findOne({ _id: req.session.passport.user }, function(err, user) {
		if (err) throw err;

		// If the user has already set a recipe board,
		if(user.recipeBoard) {

			// initialize a new Trello connection,
			let t = new Trello(config.trello.consumerKey, user.token);

			// and get the corresponding cards,
			t.get('/1/boards/' + user.recipeBoard + '/lists?cards=open&card_fields=name,idList', function(err, data) {

				// Create a new array for all the individual cards
				let cards = [];

				data.forEach(function(list) {
					cards.push.apply(cards, list.cards);
				});

				// and pass them to the template, along with a markdown function.
				res.render('recipes/index', {
					title: 'Your recipes',
					lists: data,
					cards: cards,
					marked: marked,
					flash: req.app.locals.flash
				});
			});

			// If the user doesn't have recipeBoard set,
		} else {
			// redirect them back to /users with a flash message
			req.flash('info', 'Please select a Trello board.');
			res.redirect(303, '/users');
		}
	});
});

// [POST] /recipes/board
router.post('/board', function(req, res, next) {

	if (req.app.locals.loggedIn) {
		User.findOneAndUpdate({ _id: req.session.passport.user }, { recipeBoard: req.body.recipeBoard }, { new: true }, function(err, user){

			let t = new Trello(config.trello.consumerKey, user.token);
			t.get('/1/boards/' + req.body.recipeBoard, function(err, data) {

				res.render('recipes/board', {
					title: 'You succesfully changed your board.',
					board: data
				});
			});
		});
	} else {
		res.redirect(303, '/users/login');
	}
});

router.get('/thisweek', function(req, res, next) {

	// Get our user from the db
	User.findOne({ _id: req.session.passport.user }, function(err, user) {
		console.log(user);
		res.render('recipes/thisweek', {
			title: 'Your Week of Food',
			recipes: user.thisWeek,
			marked: marked,
			flash: req.app.locals.flash
		});
	});
});

// [POST] /recipes/thisweek
router.post('/thisweek', function(req, res, next) {

	// create an array using our cards post data.
	let cards = req.body.cards.split(',');
	let cardsData = [];

	// Find the current user
	User.findOne({ _id: req.session.passport.user }, function(err, user) {

		// request the cards data using the Trello API
		// use async to query the Trello API for each board ID
		async.each(cards, function(card, cb) {

			let t = new Trello(config.trello.consumerKey, user.token);

			t.get('/1/cards/' + card, function(err, data) {

				// push the retrieved data into the cardsData Array
				cardsData.push(data);

				// signal async we're done with this one call
				cb();

			});
			 // run this function when we're done with all calls
		}, function(err) {

			User.findOneAndUpdate({ _id: user.id }, { thisWeek: cardsData }, function(err) {
				res.redirect(303, '/recipes/thisweek');
			});
		});
	});
});

module.exports = router;
