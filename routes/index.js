const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const multer = require('multer');
const storage = require('../config/fileStorage');
const upload = multer({
	storage: storage.storage,
	limits: storage.limits,
	fileFilter: storage.fileFilter,
}).fields([{
	name: 'image1', maxCount: 1
}, {
	name: 'image2', maxCount: 1
} , {
	name: 'image3', maxCount: 1
}, {
	name: 'image4', maxCount: 1
}
]);

// Render ejs view pages
router.get('/', (req, res) => { res.render('welcome') });
router.get('/profiles', (req, res) => { res.render('profiles') });
router.get('/chats', (req, res) => res.render('chats'));
// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
	res.render('dashboard', {
		name: req.user.username,
		pp: req.user.profileImages.image1,
		province: req.user.province,
        city: req.user.city
	}));

// Index Controller
const IndexController = require("../controllers/index");

router.post('/dashboard', (req,res, next) => { res.locals.upload = upload; next(); }, IndexController.index_dashboard)

module.exports = router;