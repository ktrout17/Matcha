const multer = require('multer');

const User = require('../models/User');

exports.index_dashboard = (req, res) => {
	let uploads = res.locals.upload;
	uploads(req, res, function (err) {
		if (err instanceof multer.MulterError) {
			req.flash('error_msg', err);
			res.status(500).redirect('/dashboard');
		}
		else if (err) {
			req.flash('error_msg', err);
			res.status(500).redirect('/dashboard');
		}
		console.log(req.files['image2']);
		res.redirect('/dashboard');
		// if (req.files) {
		// 	if (req.files['image1'][0]) {
		// 		var val = {
		// 			$set: {
		// 				"profileImages.2.image2": req.files['image1'][0].filename
		// 			}
		// 		}
		// 	}
		// 	else if (req.files['image2'][0]) {
		// 		var val = {
		// 			$set: {
		// 				"profileImages.3.image3": req.files['image2'][0].filename
		// 			}
		// 		}
		// 	}
		// 	else if (req.files['image3'][0]) {
		// 		var val = {
		// 			$set: {
		// 				"profileImages.4.image4": req.files['image3'][0].filename
		// 			}
		// 		}
		// 	}
		// 	else if (req.files['image4'][0]) {
		// 		var val = {
		// 			$set: {
		// 				"profileImages.5.image5": req.files['image4'][0].filename
		// 			}
		// 		}
		// 	}
		// 	await User.findByIdAndUpdate(req.user.id, val, { new: true }, (err, doc) => {
		// 		if (err) {
		// 			req.flash('error_msg', err);
		// 			res.status(500).redirect('/dashboard');
		// 		}
		// 		req.flash('success_msg', 'Successfully updated information.');
		// 		res.redirect('/dashboard');
		// 	});
		// }
	});
};