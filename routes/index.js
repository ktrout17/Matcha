const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const multer = require('multer');
const storage = require('../config/fileStorage');
const upload = multer({
	storage: storage.storage,
	limits: storage.limits,
	fileFilter: storage.fileFilter,
});

// Render ejs view pages
router.get('/', (req, res) => { res.render('welcome') });
router.get('/profiles', (req, res) => { res.render('profiles') });
router.get('/chats', (req, res) => res.render('chats'));
router.get('/suggestedMatchas', (req, res) => res.render('suggestedMatchas'));
// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
	res.render('dashboard', {
		name: req.user.username,
		pp: req.user.profileImages.image1,
		province: req.user.province,
		city: req.user.city,
		image1: req.user.profileImages.image2,
		image2: req.user.profileImages.image3,
		image3: req.user.profileImages.image4,
		image4: req.user.profileImages.image5
	}));

// Index Controller
const IndexController = require("../controllers/index");

router.post('/dashboard', (req,res, next) => { res.locals.upload = upload; next(); }, IndexController.index_dashboard)

module.exports = router;