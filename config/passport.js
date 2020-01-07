const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load user model
const User = require('../models/User');

module.exports = function(passport) {
	passport.use(
		new localStrategy({ usernameField: 'email' }, (email, password, done) => {
			// Match user
			User.findOne({ email: email }).then(user => {
				if (!user) {
					return done(null, false, { error: 'That email is not registered' });
				}

				// Match password
				bcrypt.compare(password, user.password, (err, isMatch) => {
					if (err) throw err;
					if (isMatch) {
						return done(null, user);
					} else {
						return done(null, false, { error: 'Password incorrect' });
					}
				});
			});
		})
	);

	// Saves the user id as a session variable(req.session.passport.user)
	passport.serializeUser((user, done) => {
		done(null, user._id);
	});

	passport.deserializeUser((id, done) => {
		User.findById(_id, (err, user) => {
			done(err, user);
		});
	});
};