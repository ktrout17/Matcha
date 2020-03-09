const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load user model
const User = require('../models/User');

module.exports = function(passport, res) {
	passport.use(
		new localStrategy({ usernameField: 'email' }, (email, password, done) => {
			// Match user
			var criteria = {$or: [{username: email}, {email: email}]};
			User.findOne(criteria).then(user => {
				if (!user) {
					return done(null, false, { message: 'That email is not registered' });
				}

				if (!user.verified){
					return done(null, false, { message: 'Please verify email to log in.' });
				}
				
				// Match password
				bcrypt.compare(password, user.password, (err, isMatch) => {
					if (err) { return res.status(401).send({msg: err.message }); }
					if (isMatch) {
						return done(null, user);
					} else {
						return done(null, false, { message: 'Password incorrect' });
					}
				});
			});
		})
	);

	// Saves the user id as a session variable(req.session.passport.user)
	passport.serializeUser((user, done) => {
		done(null, user.id);
	});

	passport.deserializeUser((id, done) => {
		User.findById(id, (err, user) => {
			done(err, user);
		});
	});
};