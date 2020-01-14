const bcrypt = require('bcryptjs');
const passport = require('passport');
const mongoose = require('mongoose');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
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
								_userId: newUser.id,
								token: crypto.randomBytes(16).toString('hex')
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
								res.status(200).redirect('/users/login');
							});
						});
					});
				});
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

exports.user_confirmation = (req, res) => {
	Token.findOne({ token: req.params.userToken }, (err, token) => {
		if (err) { return res.status(500).send({ msg: err.message }); }

		if (!token)
			return res.status(404).render('login', { 'error': 'We could not find the token. Your token might have expired' });

		User.findOne({ id: token.userId }, (err, user) => {
			if (!user)
				return res.status(404).render('login', { 'error': 'We were unable to find a user for this token.' });
			if (user.verified)
				return res.status(400).render('login', { 'error': 'This user has already been verified.' });

			user.verified = true;
			user.save((err) => {
				if (err)
					return res.status(500).send({ msg: err.message });
				return res.status(200).render('login', { 'success_msg': 'The account has been verified. Please log in.' });
			});
		});
		// return res.status(200).send({msg: 'token found'});
	});
}

exports.user_tokenResend = (req, res) => {
	const email = req.body.email;
	const errors = [];

	if (!email)
		errors.push({ msg: 'Please fill in all fields' });

	if (errors.length > 0)
		res.status(400).render('resend', { errors });
	else {
		User.findOne({ email: email }, (err, user) => {
			if (err) { return res.status(500).send({ msg: err.message }) };
			if (!user)
				return res.status(400).render('resend', { 'error_msg': 'We were unable to find a user with that email.' });
			if (user.verified)
				return res.status(400).render('resend', { 'error_msg': 'This account is already verified.' });

			const newToken = new Token({
				_userId: user.id,
				token: crypto.randomBytes(16).toString('hex')
			});

			newToken.save()
				.then(token => {
					if (err) throw err;
					console.log(user.email);
					var mailOptions = {
						from: 'no-reply@matcha.com',
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
					{ return res.status(500).send({ msg: err.message }) };
				});
		});
	}
}

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
				from: 'no-reply@gmail.com',
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
}

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
	if (password.length < 6) {
		errors.push({ msg: 'Password should be at least 6 characters' });
	}

	if (errors.length > 0) {
		return res.status(400).render('changePwd', { errors });
	}
	else {
		User.findOne({ email: email }).then((user) => {
			if(!user)
				{ return res.status(400).render('changePwd', {'error_msg': 'Incorrect email'}); }
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
}
