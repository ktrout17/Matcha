const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

// Render ejs view pages
router.get('/', (req, res) => { res.render('welcome') });

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
	res.render('dashboard', {
		name: req.user.username
	}));

module.exports = router;