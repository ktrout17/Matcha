const bcrypt = require('bcryptjs');
const passport = require('passport');
const mongoose = require('mongoose');
const crypto =  require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Token = require('../models/Token');

exports.user_register = (req, res) => {
	const { username, email, password, pwd_repeat, firstname, lastname } = req.body;
	const errors = [];

	// Check required fileds
	if (!username || !email || !password || !pwd_repeat) {
		errors.push({msg: 'Please fill in all fields' });
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
		res.render('register', {
			errors,
			username,
			firstname,
			lastname,
			email
		});
	} else {
		// Validation pass
		User.findOne({ email: email }).then(user => {
				if(user) {
					// User exists
					errors.push({msg: 'Email already Registered'});
					res.render('register', {
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
					bcrypt.genSalt(10,(err, salt) =>
						bcrypt.hash(newUser.password, salt, (err, hash) => {
							if (err) throw err;
							// Set pwd to hashed
							newUser.password = hash;
							// Save user
							newUser.save()
								.then(user => {
									// Create token for user and save to the database
									var newToken = new Token({
										_userId: user._id,
										token: crypto.randomBytes(16).toString('hex')
									});
									newToken.save((err) =>{
										if (err) throw err;
										// Send email
										var transporter = nodemailer.createTransport({
											service: 'Sendgid',
											auth: {user: process.env.SENDGRID_USERNAME, pass: process.env.SENDGRID_PASSWORD}
										});
										var mailOptions = {
											from: 'no-reply@matcha.com',
											to: user.email,
											subject: 'Account Verificatin',
											text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + newToken.token + '.\n'
										};
										transporter.sendMail(mailOptions, req.flash('success_msg', 'You are now registered, Verify email to log in.'))
									});
									
									res.redirect('/users/login');
								})
								.catch(err => console.log(err));
						}));
				}
			});
	}
}

exports.user_login = (req, res, next) => {
	passport.authenticate('local', {
		successRedirect: '/dashboard',
		failureRedirect: '/users/login',
		failureFlash: true
	})(req, res, next);
}

exports.user_logout = (req, res) => {
	req.logout();
	req.flash('success_msg', 'You are logged out');
	res.redirect('/users/login');
}