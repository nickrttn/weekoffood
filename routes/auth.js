'use strict';

const express = require('express');
const passport = require('../lib/passport');

let router = express.Router();

// Redirect the user to the Trello oAuth API for
// authentication. When complete, redirect the user back
// to the application at /auth/provider/callback
router.get('/trello', passport.authenticate('trello'));

// The OAuth provider has redirected the user back to the
// application. Finish the authentication process by attempting
// to obtain an access token.  If authorization was granted,
// the user will be logged in. Otherwise, authentication has failed.
router.get('/trello/callback', passport.authenticate('trello', {
	successRedirect: '/users',
	failureRedirect: '/users/login'
}));

module.exports = router;
