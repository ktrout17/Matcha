const multer = require('multer');

const User = require('../models/User');
const Likes = require('../models/Likes');

exports.index_dashboard = (req, res, next) => {
	let uploads = res.locals.upload.fields([{
		name: 'image1', maxCount: 1
	}, {
		name: 'image2', maxCount: 1
	}, {
		name: 'image3', maxCount: 1
	}, {
		name: 'image4', maxCount: 1
	}
	]);
	uploads(req, res, async function (err) {
		if (err instanceof multer.MulterError) {
			req.flash('error_msg', err);
			res.status(500).redirect('/dashboard');
			next();
		}
		else if (err) {
			req.flash('error_msg', err);
			res.status(500).redirect('/dashboard');
			next();
		}
		if (req.files['image1']) {
			var val = {
				$set: {
					"profileImages.image2": req.files['image1'][0].filename
				}
			}
		}
		else if (req.files['image2']) {
			var val = {
				$set: {
					"profileImages.image3": req.files['image2'][0].filename
				}
			}
		}
		else if (req.files['image3']) {
			var val = {
				$set: {
					"profileImages.image4": req.files['image3'][0].filename
				}
			}
		}
		else if (req.files['image4']) {
			var val = {
				$set: {
					"profileImages.image5": req.files['image4'][0].filename
				}
			}
		}
		await User.findByIdAndUpdate(req.user.id, val, { new: true }, (err, doc) => {
			if (err) {
				req.flash('error_msg', err);
				res.status(500).redirect('/dashboard');
				next();
			}
			req.flash('success_msg', 'Successfully updated picture.');

			res.redirect('/dashboard');
			next();
		});
	});
};

exports.index_profile = (req, res) => {
	const id = req.params.id;
	let liked;

	Likes.findOne({ $and: [{ _userId: req.user.id }, { likedId: id }] })
		.exec()
		.then((user) => {
			if (!user) {
				liked = "liked";
				User.findByIdAndUpdate(id, { $inc: { likes: 1 } })
					.exec()
					.then(() => {
						const newLike = new Likes({
							_userId: req.user.id,
							likedId: id
						});
						newLike.save()
						User.findById(id)
			.exec()
			.then( doc => {
				res.render("profiles", {
					user: doc,
					liked: liked
				})
			})
			.catch(err => {console.log(err); res.end(); })
					}).catch((err) => {console.log(err); res.end(); });
			} else {
				liked = "like";
				User.findByIdAndUpdate(id, { $inc: { likes: -1 }})
					.exec()
					.then(() => { 
						Likes.deleteOne({ $and: [{ _userId: req.user.id }, { likedId: id }] })
							.exec()
							.then(
								User.findById(id)
			.exec()
			.then( doc => {
				res.render("profiles", {
					user: doc,
					liked: liked
				})
			})
			.catch(err => {console.log(err); res.end(); })
							)
							.catch(err => {console.log(err); res.end()});
						}).catch(err => {console.log(err); res.end();});
			}

		}).catch((err) => {console.log(err); res.end(); });
};

exports.index_advancedMathas = (req, res) => {
	const search = req.body.search;

	if (req.body.sSubmit === 'sSubmit') {
		User.find({ username: search })
		.exec()
		.then(docs => {
			console.log(docs);
				res.render("suggestedMatchas", {
					"users": docs.map(doc => {
						return {
							firstname: doc.firstname,
							lastname: doc.lastname,
							username: doc.username,
							profileImage: doc.profileImages.image1,
							request: {
								url: '/profiles/' + doc.id
							}
						}
					})
				});
			});
	}
	else if (req.body.aSubmit === 'aSubmit') {
		const agePref = req.body.age_preference;
		const interests = req.body.interests;
		const fame = parseInt(req.body.fame);
		const loc = req.body.loc;
		let interestsQuery;
		let ageQuery;
		let fameQuery;
		let locQuery;

		switch (agePref) {
			case 'age1':
				ageQuery = { age: { $gte: 18, $lte: 24 } }
				break;
			case 'age2':
				ageQuery = { age: { $gte: 25, $lte: 31 } }
				break;
			case 'age3':
				ageQuery = { age: { $gte: 32, $lte: 38 } }
				break;
			case 'age4':
				ageQuery = { age: { $gte: 39, $lte: 45 } }
				break;
			case 'age5':
				ageQuery = { age: { $gte: 46, $lte: 52 } }
				break;
			case 'age6':
				ageQuery = { age: { $gte: 53, $lte: 59 } }
				break;
			case 'age7':
				ageQuery = { age: { $gte: 60, $lte: 66 } }
				break;
				default:
					ageQuery = {};
		}

		if (typeof interests !== 'undefined') {
			if (Array.isArray(interests)) {
				interestsQuery = {
					$or: [{
						"interests.first": { $in: [interests[0], interests[1], interests[2], interests[3], interests[4]] },
					}, {
						"interests.second": { $in: [interests[0], interests[1], interests[2], interests[3], interests[4]] },
					}, {
						"interests.third": { $in: [interests[0], interests[1], interests[2], interests[3], interests[4]] },
					}, {
						"interests.fourth": { $in: [interests[0], interests[1], interests[2], interests[3], interests[4]] },
					}, {
						"interests.fifth": { $in: [interests[0], interests[1], interests[2], interests[3], interests[4]] },
					}]
				};
			} else {
				interestsQuery = {
					$or: [{
						"interests.first": { $eq: interests }
					}, {
						"interests.second": { $eq: interests }
					}, {
						"interests.third": { $eq: interests }
					}, {
						"interests.fourth": { $eq: interests }
					}, {
						"interests.fifth": { $eq: interests }
					}]
				};
			}
		}
		else {
			interestsQuery = {};
		}

		fameQuery = {fame: fame};

		switch (loc) {
			case 'near':
				locQuery = {}

		}

		User.find({
			$and:
				[
					ageQuery,
					interestsQuery,
					fameQuery
				]
		})
			.exec()
			.then(doc => {
				res.send(doc)
			});
	}
}