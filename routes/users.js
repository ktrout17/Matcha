const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const multer = require('multer');
const storage = require('../config/fileStorage');
const upload = multer({
	storage: storage.storage,
	limits: storage.limits,
	fileFilter: storage.fileFilter,
}).single('profileImage');

// Render ejs view pages
router.get('/login', (req, res) => res.render('login',));
// router.get('/login', (req, res) => res.render('login', {message: req.flash('error')}));
router.get('/register', (req, res) => res.render('register'));
router.get('/resend', (req, res) => res.render('resend'));
router.get('/extendedProfile', (req, res) => {
    res.render('extendedProfile', {
        name: req.user.username
    })
});
router.get('/forgotPwd', (req, res) => res.render('forgotPwd'));
router.get('/changePwd', (req, res) => res.render('changePwd'));
router.get('/editProfile', ensureAuthenticated, (req, res) => {
    res.render('editProfile', {
        name: req.user.username,
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        email: req.user.email,
        gender: req.user.gender,
        date: req.user.dob,
        agePref: req.user.agePref,
        sexPref: req.user.sexPref,
        bio: req.user.bio,
        interests: req.user.interests,
        pp: req.user.profileImages.image1
    })
});


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
router.post('/resend', UsersController.user_tokenResend);
router.post('/forgotPwd', UsersController.user_forgotPwd);
router.post('/changePwd', UsersController.user_changePwd);
router.post('/extendedProfile', (req,res, next) => { res.locals.upload = upload; next(); }, UsersController.user_extendedProfile);
router.post('/editProfile', (req,res, next) => { res.locals.upload = upload; next(); },  UsersController.user_editProfile);

module.exports = router;


router.get('/login',(err) => {});