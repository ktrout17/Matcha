const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Likes = require("../models/Likes");
const Views = require("../models/Views");
const { ensureAuthenticated } = require("../config/auth");
const multer = require("multer");
const storage = require("../config/fileStorage");
const upload = multer({
	storage: storage.storage,
	limits: storage.limits,
	fileFilter: storage.fileFilter
});

// Render ejs view pages
router.get("/", (req, res) => {
	res.render("welcome");
});

let find = (req, res, next, id) => {
	Views.findOne(
		{ $and: [{ _userId: req.user.id }, { viewedId: id }] },
		(err, doc) => {
			if (err) {
				req.flash("error_msg", "1" + err.message);
				return res.status(500).redirect("/profiles/" + id);
			}
			if (!doc) {
				const newView = new Views({
					_userId: req.user.id,
					viewedId: id
				});
				newView.save(err => {
					if (err) {
						req.flash("error_msg", "2" + err.message);
						return res.status(500).redirect("/profiles/" + id);
					}
				});
				User.findOneAndUpdate(
					{ _id: id },
					{ $inc: { views: 1 } },
					err => {
						if (err) {
							req.flash("error_msg", "3" + err.message);
							return res.status(500).redirect("/profiles/" + id);
						} else {
							next();
						}
					}
				);
			} else {
				next();
			}
		}
	);
};

router.get(
	"/profiles/:id",
	// (req, res, next) => {
	// 	console.log("req.params.id: " + req.params.id)
	// 	find(req, res, next, req.params.id);
	// },
	(req, res, next) => {
		const id = req.params.id;
		let liked;
		// const userId = req.user.id;

		// Views.findOne({ _userId: userId, viewedId: id }).then(result => {
		// 	let visitor = false;

		// 	if (!result) {
		// 		visitor = true;
		// 		const newView = new Views({
		// 			_userId: req.user.id,
		// 			viewedId: id
		// 		});

		// 		newView.save(err => {
		// 			console.log(err);
		// 		});

		// 		User.findById( id )
		// 			.exec()
		// 			.then(user => {
		// 				if (visitor) {
		// 					user.views = user.views + 1;
							// User.updateOne({ _id: id }, { $inc: { views: 1 } });
							// return res.redirect("/profiles/" + id);
							// return res.send("user" + user);
					// 	}
					// 	else {
					// 		return res.redirect("/profiles/" + id);
					// 	}
					// });
				// } else {
				// return res.send();
			// } else {
			// 	res.send("done");
				// return res.redirect("/profiles/" + id);
			// }
		// });

		// 	if (id.match(/^[0-9a-fA-F]{24}$/)) {
		User.findById(id)
			.exec()
			.then(doc => {
		Likes.countDocuments(
			{ $and: [{ _userId: req.user.id }, { likedId: id }] },
			(err, likeDoc) => {
				if (err) {
					req.flash("error_msg", "4" + err.message);
					return res.status(500).redirect("/profiles/" + id);
					// next();
				}
				if (likeDoc > 0) liked = "unlike";
				else liked = "like";

			return res.render("profiles", {
				user: doc,
				liked: liked
			});
		});
		});
		// 	} else {
		// 		res.send("not match");
		// 		res.end();
		// 	}
	}
);

router.get("/chats", ensureAuthenticated, (req, res) => res.render("chats"));

router.get("/suggestedMatchas", (req, res) => {
	User.find({
		$or: [
			// change $or back to $and for suggested searches
			{
				city: req.user.city
			},
			{
				$or: [
					{
						"interests.first": {
							$in: [
								req.user.interests["first"],
								req.user.interests["second"],
								req.user.interests["third"],
								req.user.interests["fourth"],
								req.user.interests["fifth"]
							]
						}
					},
					{
						"interests.second": {
							$in: [
								req.user.interests["first"],
								req.user.interests["second"],
								req.user.interests["third"],
								req.user.interests["fourth"],
								req.user.interests["fifth"]
							]
						}
					},
					{
						"interests.third": {
							$in: [
								req.user.interests["first"],
								req.user.interests["second"],
								req.user.interests["third"],
								req.user.interests["fourth"],
								req.user.interests["fifth"]
							]
						}
					},
					{
						"interests.fourth": {
							$in: [
								req.user.interests["first"],
								req.user.interests["second"],
								req.user.interests["third"],
								req.user.interests["fourth"],
								req.user.interests["fifth"]
							]
						}
					},
					{
						"interests.fifth": {
							$in: [
								req.user.interests["first"],
								req.user.interests["second"],
								req.user.interests["third"],
								req.user.interests["fourth"],
								req.user.interests["fifth"]
							]
						}
					}
				]
			},
			{
				$or: [
					{
						$and: [
							{ gender: { $eq: req.user.sexPref } },
							{ gender: { $eq: "male" } }
						]
					},
					{
						$and: [
							{ gender: { $eq: req.user.sexPref } },
							{ gender: { $eq: "female" } }
						]
					},
					{ gender2: { $eq: req.user.sexPref } }
				]
			},
			{ _id: { $ne: req.user.id } }
		]
	})
		.sort({ fame: -1 })
		.select("firstname lastname username profileImages.image1")
		.exec()
		.then(docs => {
			res.status(200).render("suggestedMatchas", {
				users: docs.map(doc => {
					return {
						firstname: doc.firstname,
						lastname: doc.lastname,
						username: doc.username,
						profileImage: doc.profileImages.image1,
						request: {
							url: "/profiles/" + doc.id
						}
					};
				})
			});
		})
		.catch();
});
// Dashboard
router.get("/dashboard", ensureAuthenticated, (req, res) =>
	res.render("dashboard", {
		name: req.user.username,
		pp: req.user.profileImages.image1,
		province: req.user.province,
		city: req.user.city,
		image1: req.user.profileImages.image2,
		image2: req.user.profileImages.image3,
		image3: req.user.profileImages.image4,
		image4: req.user.profileImages.image5,
		gender: req.user.gender,
		sexPref: req.user.sexPref,
		interests: req.user.interests,
		bio: req.user.bio,
		views: req.user.views,
		likes: req.user.likes
	})
);
router.get("/notifications", (req, res) => res.render("notifications"));

// Index Controller
const IndexController = require("../controllers/index");

router.post(
	"/dashboard",
	(req, res, next) => {
		res.locals.upload = upload;
		next();
	},
	IndexController.index_dashboard
);
router.post("/profiles/:id", IndexController.index_profile);
router.post("/suggestedMatchas", IndexController.index_advancedMathas);

module.exports = router;
