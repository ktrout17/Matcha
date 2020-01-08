const express = require('express');
const router = express.Router();

// Render ejs view pages
router.get('/login', (req, res) => res.render('login', {message: req.flash('error')}));
router.get('/register', (req, res) => res.render('register'));
router.get('/dashboard', (req, res) => res.render('dashboard'));


// Import Controllers
const UsersController = require('../controllers/users');

// Handles user Register
router.post('/register', UsersController.user_register);

// Handles user Login
router.post('/login', UsersController.user_login);

// Handles user Logout
router.get('/logout', UsersController.user_logout);

module.exports = router;