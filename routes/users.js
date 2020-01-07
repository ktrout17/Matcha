const express = require('express');
const router = express.Router();

// Render ejs view pages
router.get('/login', (req, res) => res.render('login'));
router.get('/register', (req, res) => res.render('register'));
router.get('/profile', (req, res) => res.render('profile'));
router.get('/', (req, res) => { res.render('welcome') });


// Import Controllers
const UsersController = require('../controllers/users');

// Handles user Register
router.post('/register', UsersController.user_register);

// Handles user Login
router.post('/login', UsersController.user_login);

// Handles user Logout
router.get('/logout', UsersController.user_logout);

module.exports = router;