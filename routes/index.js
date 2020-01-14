const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

// Render ejs view pages
router.get('/', (req, res) => { res.render('welcome') });
router.get('/editProfile', (req, res) => res.render('editProfile'));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
	res.render('dashboard', {
		name: req.user.username
	}));

module.exports = router;