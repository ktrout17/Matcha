const express = require('express');
const router = express.Router();

// Render ejs view pages
router.get('/login', (req, res, next) => {
	res.render('login', { 
		message: req.flash('error')
	});
});
// router.get('/login', (req, res) => res.render('login', {message: req.flash('error')}));
router.get('/register', (req, res) => res.render('register'));
router.get('/dashboard', (req, res) => res.render('dashboard'));
router.get('/resend', (req, res) => res.render('resend'));


// Import Controllers
const UsersController = require('../controllers/users');

// Handles user Register
router.post('/register', UsersController.user_register);

// Handles user Login
router.post('/login', UsersController.user_login);

// Handles user Logout
router.get('/logout', UsersController.user_logout);

// Handles user Token for email verification
router.get('/confirmation/:userToken', UsersController.user_confirmation);
router.post('/resend', UsersController.user_tokenResend)

module.exports = router;