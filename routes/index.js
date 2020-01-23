const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

// Render ejs view pages
router.get('/', (req, res) => { res.render('welcome') });
router.get('/profiles', (req, res) => { res.render('profiles') });
router.get('/chats', (req, res) => res.render('chats'));
router.get('/suggestedMatchas', (req, res) => res.render('suggestedMatchas'));
// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
	res.render('dashboard', {
		name: req.user.username
	}));

module.exports = router;