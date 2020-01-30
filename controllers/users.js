const bcrypt = require('bcryptjs');
const passport = require('passport');
const mongoose = require('mongoose');
const crypto = require('crypto-extra');
const nodemailer = require('nodemailer');
const multer = require('multer');

const User = require('../models/User');
const Token = require('../models/Token');

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'matcha420x@gmail.com',
		pass: 'ThankU420x'
	}
});

exports.user_register = (req, res) => {
	const { username, email, password, pwd_repeat, firstname, lastname } = req.body;
	const errors = [];

	// Check required fileds
	if (!username || !email || !password || !pwd_repeat) {
		errors.push({ msg: 'Please fill in all fields' });
	}

	// Check passwords match
	if (password != pwd_repeat) {
		errors.push({ msg: 'Passwords do not match' });
	}

	// Check pwd length
	if (password.length < 6) {
		errors.push({ msg: 'Password should be at least 6 characters' });
	}

	if (errors.length > 0) {
		console.log(errors);
		res.status(400).render('register', {
			errors,
			username,
			firstname,
			lastname,
			email
		});
	} else {
		// Validation pass
		User.findOne({ email: email }).then(user => {
			if (user) {
				// User exists
				errors.push({ msg: 'Email already Registered' });
				res.status(400).render('register', {
					errors,
					username,
					email,
					firstname,
					lastname
				});
			} else {
				// Validation pass
				const newUser = new User({
					_id: new mongoose.Types.ObjectId(),
					username,
					email,
					firstname,
					lastname,
					password
				});
				// Hash pwd
				bcrypt.genSalt(10, (err, salt) => {
					bcrypt.hash(newUser.password, salt, (err, hash) => {
						if (err) { return res.status(500).send({ msg: err.message }); }
						// Set pwd to hashed
						newUser.password = hash;
						// Save user
						newUser.save((err) => {
							if (err) { return res.status(500).send({ msg: err.message }); }

							// Create token for user and save to the database
							const newToken = new Token({
								_userId: newUser._id,
								token: crypto.randomKey(32)
							});
							newToken.save((err) => {
								if (err) { return res.status(500).send({ msg: err.message }); }
							});

							// Setup transporter for email

							// Define email content
							const mailOptions = {
								from: '"Admin" <no-reply@matcha.com>',
								to: newUser.email,
								subject: 'Account Verification',
								text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/users\/confirmation\/' + newToken.token + '.\n'
							};

							// Send email
							transporter.sendMail(mailOptions, (err) => {
								if (err) { return res.status(500).send({ msg: err.message }); }
								res.status(200).render('login', { 'success_msg': 'Account created. Check your email to verify your account to log in.' });
							});
						});
					});
				});
			}
		});
	}
};

exports.user_login = (req, res, next) => {
	passport.authenticate('local', (err, user, info) => {
		if (err) { return next(err); }

		if (!user) { return res.render('login', { message: info.message }); }

		req.logIn(user, (err) => {
			if (!user.extendedProf) { return res.redirect('/users/extendedProfile'); }
			if (err) { return next(err); }

			return res.redirect('/dashboard');
		})
	})(req, res, next);
};

exports.user_logout = (req, res) => {
	req.logout();
	req.flash('success_msg', 'You are logged out');
	res.redirect('/users/login');
};

exports.user_confirmation = (req, res) => {
	Token.findOne({ token: req.params.userToken }, (err, token) => {
		if (err) { return res.status(500).send({ msg: err.message }); }

		if (!token)
			return res.status(404).render('login', { 'error': 'We could not find the token. Your token might have expired' });

		User.findOne({ _id: token._userId }, (err, user) => {
			if (err) { return res.status(500).send({ msg: err.message }); }

			if (!user)
				return res.status(404).render('login', { 'error': 'We were unable to find a user for this token.' });
			console.log(user);
			if (user.verified === true)
				return res.status(400).render('login', { 'error': 'This user has already been verified.' });

			user.verified = true;
			user.save((err) => {
				if (err)
					return res.status(500).send({ msg: err.message });
				return res.status(200).render('login', { 'success_msg': 'Your account has been verified. You may now log in.' });
			});
		});
		// return res.status(200).send({msg: 'token found'});
	});
};

exports.user_tokenResend = (req, res) => {
	const email = req.body.email;
	const errors = [];

	if (!email)
		errors.push({ msg: 'Please fill in all fields' });

	if (errors.length > 0)
		res.status(400).render('resend', { errors });
	else {
		User.findOne({ email: email }, (err, user) => {
			if (err) {
				return res.status(500).send({ msg: err.message })
			}
			if (!user)
				return res.status(400).render('resend', { 'error_msg': 'We were unable to find a user with that email.' });
			if (user.verified)
				return res.status(400).render('resend', { 'error_msg': 'This account is already verified.' });

			const newToken = new Token({
				_userId: user.id,
				token: crypto.randomKey(32)
			});

			newToken.save()
				.then(token => {
					if (err) throw err;
					console.log(user.email);
					var mailOptions = {
						from: '"Admin" <no-reply@matcha.com>',
						to: user.email,
						subject: 'Account Verification Token',
						text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/users\/confirmation\/' + token.token + '.\n'
					};
					// transporter.verify(function (error, success) {
					// 	if (error) {
					// 		return res.status(500).send(error);
					// 	} else {
					// 		return res.status(500).send("Server is ready to take our messages");
					// 	}
					// });
					transporter.sendMail(mailOptions, (err) => {
						if (err) { return res.status(500).send({ msg: err.message }) };
						return res.status(200).render('login', { 'success_msg': 'A verification email has been sent to ' + user.email + '.' });
					});
				})
				.catch((err) => {
					{
						return res.status(500).send({ msg: err.message })
					}
				});
		});
	}
};

exports.user_forgotPwd = (req, res) => {
	const email = req.body.email;
	const errors = [];

	if (!email)
		errors.push({ msg: 'Please fill in all fields' });

	if (errors.length > 0)
		res.status(400).render('forgotPwd', { errors });
	else {
		User.findOne({ email: email }, (err, user) => {
			if (err) { return res.status(500).send({ msg: err.message }) };
			if (!user)
				return res.status(400).render('forgotPwd', { 'error_msg': 'We were unable to find a user with that email.' });

			var mailOptions = {
				from: '"Admin" <no-reply@matcha.com>',
				to: user.email,
				subject: 'Forgotten Password',
				text: 'Hello,\n\n' + 'Please click the link bellow to reset your password: \nhttp:\/\/' + req.headers.host + '\/users\/changePwd.\n'
			};
			transporter.sendMail(mailOptions, (err) => {
				if (err) { return res.status(500).send({ msg: err.message }) };
				return res.status(200).render('login', { 'success_msg': 'A password reset email has been sent to ' + user.email + '.' });
			});
		});
	}
};

exports.user_changePwd = (req, res) => {
	const { email, password, pwd_repeat } = req.body;
	const errors = [];

	// regexp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
	// if (regexp.test(password))
	// 	errors.push({ msg: 'Please use at least 1 Upper case letter'});

	if (!email || !password || !pwd_repeat) {
		errors.push({ msg: 'Please fill in all fields' });
	}

	// Check passwords match
	if (password != pwd_repeat) {
		errors.push({ msg: 'Passwords do not match' });
	}

	// Check pwd length
	console.log(password);
	if (password.length < 6) {
		errors.push({ msg: 'Password should be at least 6 characters' });
	}

	if (errors.length > 0) {
		return res.status(400).render('changePwd', { errors });
	}
	else {
		User.findOne({ email: email }).then((user) => {
			if (!user) { return res.status(400).render('changePwd', { 'error_msg': 'Incorrect email' }); }
			bcrypt.genSalt(10, (err, salt) => {
				bcrypt.hash(password, salt, (err, hash) => {
					if (err) { return res.status(500).send({ msg: err.message }); }

					user.password = hash;

					user.save((err) => {
						if (err) { return res.status(500).send({ msg: err.message }); }
						return res.status(200).render('login', { 'success_msg': 'Your password has been updated and you can now login.' });
					});
				});
			});
		});
	}
};

exports.user_extendedProfile = (req, res) => {
	let uploads = res.locals.upload;
	console.log(req.file);
	uploads(req, res, async function (err) {
		if (err instanceof multer.MulterError) {
			req.flash('error_msg', err.message);
			res.status(500).redirect('/users/extendedProfile');
		}
		else if (err) {
			req.flash('error_msg', err.message);
			res.status(500).redirect('/users/extendedProfile');
		}

		if (req.file) {
			await User.findById(req.user.id, (err, user) => {
				if (!user) {
					if (err) { return res.status(500).send({ msg: err.message }); }
				}
				else {
					const newDate = new Date(req.body.birthdate);
					const ageDifMs = Date.now() - newDate.getTime();
					const ageDate = new Date(ageDifMs);
					const age = Math.abs(ageDate.getUTCFullYear() - 1970);

					user.gender = req.body.gender;
					user.dob = req.body.birthdate;
					user.agePref = req.body.age_preference;
					user.sexPref = req.body.sex_pref;
					user.bio = req.body.bio;
					user.interests.first = req.body.interests[0];
					user.interests.second = req.body.interests[1];
					user.interests.third = req.body.interests[2];
					user.interests.fourth = req.body.interests[3];
					user.interests.fifth = req.body.interests[4];
					user.country = req.body.country;
					user.province = req.body.province;
					user.city = req.body.city;
					user.lat = req.body.lat;
					user.long = req.body.long;
					user.profileImages.image1 = req.file.filename;
					user.profileImages.image2 = 'couple15.jpg';
					user.profileImages.image3 = 'couple16.jpg';
					user.profileImages.image4 = 'couple17.jpg';
					user.profileImages.image5 = 'couple18.jpg';
					user.gender2 = req.body.gender2;
					user.age = age;
					user.extendedProf = true;
					user.save((err) => {
						if (err) { return res.status(500).send({ msg: err.message }); }
						return res.status(200).redirect('/dashboard');
					});
				}
			});
		}
	});
};

exports.user_editProfile = (req, res, next) => {
	let uploads = res.locals.upload;
	var val;
	uploads(req, res, async function (err) {
		if (err instanceof multer.MulterError) {
			req.flash('error_msg', err);
			res.status(500).redirect('/users/editProfile');
		}
		else if (err) {
			req.flash('error_msg', err);
			res.status(500).redirect('/users/editProfile');
		}
		if (req.file) {
			val = {
				$set: {
					username: req.body.username,
					firstname: req.body.firstname,
					lastname: req.body.lastname,
					email: req.body.email,
					gender: req.body.gender,
					dob: req.body.birthdate,
					agePref: req.body.age_preference,
					sexPref: req.body.sex_pref,
					bio: req.body.bio,
					interests: {
						first: req.body.interests[0],
						second: req.body.interests[1],
						third: req.body.interests[2],
						fourth: req.body.interests[3],
						fifth: req.body.interests[4]
					},
					"profileImages.image1": req.file.filename,
					country: req.body.country,
					province: req.body.province,
					city: req.body.city,
					lat: req.body.lat,
					long: req.body.long
				}
			}
		} else if (!req.file) {
			val = {
				$set: {
					username: req.body.username,
					firstname: req.body.firstname,
					lastname: req.body.lastname,
					email: req.body.email,
					gender: req.body.gender,
					dob: req.body.birthdate,
					agePref: req.body.age_preference,
					sexPref: req.body.sex_pref,
					bio: req.body.bio,
					interests: {
						first: req.body.interests[0],
						second: req.body.interests[1],
						third: req.body.interests[2],
						fourth: req.body.interests[3],
						fifth: req.body.interests[4]
					},
					country: req.body.country,
					province: req.body.province,
					city: req.body.city,
					lat: req.body.lat,
					long: req.body.long
				}
			};
		}
		if (req.user.username !== req.body.username ||
			req.user.firstname !== req.body.firstname ||
			req.user.lastname !== req.body.lastname ||
			req.user.username !== req.body.username ||
			req.user.email !== req.body.email ||
			req.user.gender !== req.body.gender ||
			req.user.dob !== req.body.birthdate ||
			req.user.agePref !== req.body.age_preference ||
			req.user.sexPref !== req.body.sex_pref ||
			req.user.bio !== req.body.bio ||
			req.user.interests.first !== req.body.interests[0] ||
			req.user.interests.second !== req.body.interests[1] ||
			req.user.interests.third !== req.body.interests[2] ||
			req.user.interests.fourth !== req.body.interests[3] ||
			req.user.interests.fifth !== req.body.interests[4] ||
			req.user.country !== req.body.country ||
			req.user.province !== req.body.province ||
			req.user.city !== req.body.city ||
			req.user.lat !== req.body.lat ||
			req.user.long !== req.body.long
		) {
			await User.findOneAndUpdate({ _id: req.user._id }, val, { new: true }, (err, doc) => {
				if (err) {
					req.flash('error_msg', err);
					res.status(500).redirect('/users/editProfile');
				}
				req.flash('success_msg', 'Successfully updated information.');
				res.redirect('/users/editProfile');
			});
		}
	});
};