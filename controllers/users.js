const bcrypt = require("bcryptjs");
const passport = require("passport");
const mongoose = require("mongoose");
const crypto = require("crypto-extra");
const nodemailer = require("nodemailer");
const multer = require("multer");
const { gmail_email, gmail_password } = require("../config/config");

const User = require("../models/User");
const Token = require("../models/Token");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  auth: {
    user: gmail_email,
    pass: gmail_password,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

exports.user_register = (req, res) => {
	const { password, pwd_repeat } = req.body;
	const username = req.body.username.trim();
	const email = req.body.email.trim();
	const firstname = req.body.firstname.trim();
	const lastname = req.body.lastname.trim();
	const errors = [];
	
	let lowercase = new RegExp("^(?=.*[a-z])");
	let uppercase = new RegExp("^(?=.*[A-Z])");
	let numeric = new RegExp("^(?=.*[0-9])");
	let spcharacter = new RegExp("^(?=.*[!@#\$%\^&\*])");
	
	// Check required fileds
	if (!username || !email || !password || !pwd_repeat) {
		errors.push({ msg: 'Please fill in all fields' });
	}

	// Check passwords match
	if (password != pwd_repeat) {
		errors.push({ msg: 'Passwords do not match' });
	}

	// Check pwd length
	if (password.length < 8) {
		errors.push({ msg: 'Password should be at least 8 characters' });
	}

	if (!lowercase.test(password)) {
		errors.push({ msg: 'Password should contain at least 1 lowercase character'});
	}

	if (!uppercase.test(password)) {
		errors.push({ msg: 'Password should contain at least 1 uppercase character'});
	}

	if (!numeric.test(password)) {
		errors.push({ msg: 'Password should contain at least 1 numeric value'});
	}

	if (!spcharacter.test(password)) {
		errors.push({ msg: 'Password should contain at least 1 special character'});
	}

	if (errors.length > 0) {
		res.status(400).render('register', {
			errors,
			username,
			firstname,
			lastname,
			email,
			userNameTag: ''
		});
	} else {
		// Validation pass
		User.findOne({$or:[{username: username},{ email: email }]}).then(user => {
			if (user) {
				// User exists
				errors.push({ msg: 'Email/Username already Registered' });
				res.status(400).render('register', {
					errors,
					username,
					email,
					firstname,
					lastname,
					userNameTag: ''
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
								res.status(200).render('login', { 'success_msg': 'Account created. Check your email to verify your account to log in.', userNameTag: '' });
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
		if (err) { return console.log(err) }

		if (!user) { return res.render('login', { message: info.message, userNameTag: '' }); }

		req.logIn(user, (err) => {
			if (!user.extendedProf) { return res.redirect('/users/extendedProfile'); }
			if (err) { return console.log(err) }

			if (user.views !== 0 || user.likes !== 0) {
				let num = (user.likes / user.views) * 5;
				let fame = Math.round(num * 10) / 10;

				User.findByIdAndUpdate(user.id, {$set:{fame: fame, loggedIn: true}}, {new: true}, (err) => {
					if(err) return console.log(err);
				})
			}
			
			return res.redirect('/dashboard');
		})
	})(req, res, next);
};

exports.user_logout = (req, res) => {
  User.findByIdAndUpdate(
    req.user.id,
    { $set: { loggedIn: false, lastSeen: getDateTime() } },
    (err) => {
      if (err) throw err;
      req.logout();
      req.flash("success_msg", "You are logged out");
      res.redirect("/users/login");
    }
  );
};

exports.user_confirmation = (req, res) => {
	Token.findOne({ token: req.params.userToken }, (err, token) => {
		if (err) { return res.status(500).send({ msg: err.message }); }

		if (!token)
			return res.status(404).render('login', { 'error': 'We could not find the token. Your token might have expired', userNameTag: '' });

		User.findOne({ _id: token._userId }, (err, user) => {
			if (err) { return res.status(500).send({ msg: err.message }); }

			if (!user)
				return res.status(404).render('login', { 'error': 'We were unable to find a user for this token.', userNameTag: '' });
			if (user.verified === true)
				return res.status(400).render('login', { 'error': 'This user has already been verified.', userNameTag: '' });

			user.verified = true;
			user.save((err) => {
				if (err)
					return res.status(500).send({ msg: err.message });
				return res.status(200).render('login', { 'success_msg': 'Your account has been verified. You may now log in.', userNameTag: '' });
			});
		});
	});
};

exports.user_tokenResend = (req, res) => {
	const email = req.body.email;
	const errors = [];

	if (!email)
		errors.push({ msg: 'Please fill in all fields' });

	if (errors.length > 0)
		res.status(400).render('resend', { errors, userNameTag: '' });
	else {
		User.findOne({ email: email }, (err, user) => {
			if (err) {
				return res.status(500).send({ msg: err.message })
			}
			if (!user)
				return res.status(400).render('resend', { 'error_msg': 'We were unable to find a user with that email.', userNameTag: ''  });
			if (user.verified)
				return res.status(400).render('resend', { 'error_msg': 'This account is already verified.', userNameTag: ''  });

			const newToken = new Token({
				_userId: user.id,
				token: crypto.randomKey(32)
			});

			newToken.save()
				.then(token => {
					if (err) throw err;
					var mailOptions = {
						from: '"Admin" <no-reply@matcha.com>',
						to: user.email,
						subject: 'Account Verification Token',
						text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/users\/confirmation\/' + token.token + '.\n'
					};
					transporter.sendMail(mailOptions, (err) => {
						if (err) { return res.status(500).send({ msg: err.message }) };
						return res.status(200).render('login', { 'success_msg': 'A verification email has been sent to ' + user.email + '.', userNameTag: ''  });
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
		res.status(400).render('forgotPwd', { errors, userNameTag: ''  });
	else {
		User.findOne({ email: email }, (err, user) => {
			if (err) { return res.status(500).send({ msg: err.message }) };
			if (!user)
				return res.status(400).render('forgotPwd', { 'error_msg': 'We were unable to find a user with that email.', userNameTag: ''  });

			const newToken = new Token({
				_userId: user._id,
				token: crypto.randomKey(32)
			});
			newToken.save((err) => {
				if (err) { return res.status(500).send({ msg: err.message }); }
			});

			var mailOptions = {
				from: '"Admin" <no-reply@matcha.com>',
				to: user.email,
				subject: 'Forgotten Password',
				text: 'Hello,\n\n' + 'Please click the link bellow to reset your password: \nhttp:\/\/' + req.headers.host + '\/users\/changePwd\/' + newToken.token + '.\n'
			};
			transporter.sendMail(mailOptions, (err) => {
				if (err) { return res.status(500).send({ msg: err.message }) };
				return res.status(200).render('login', { 'success_msg': 'A password reset email has been sent to ' + user.email + '.', userNameTag: ''  });
			});
		});
	}
};

exports.user_changePwd = (req, res) => {
	const { email, password, pwd_repeat } = req.body;
	const errors = [];

	let lowercase = new RegExp("^(?=.*[a-z])");
	let uppercase = new RegExp("^(?=.*[A-Z])");
	let numeric = new RegExp("^(?=.*[0-9])");
	let spcharacter = new RegExp("^(?=.*[!@#\$%\^&\*])");

	if (!email || !password || !pwd_repeat) {
		errors.push({ msg: 'Please fill in all fields' });
	}

	if (password.length < 8) {
		errors.push({ msg: 'Password should be at least 8 characters' });
	}

	if (!lowercase.test(password)) {
		errors.push({ msg: 'Password should contain at least 1 lowercase character'});
	}

	if (!uppercase.test(password)) {
		errors.push({ msg: 'Password should contain at least 1 uppercase character'});
	}

	if (!numeric.test(password)) {
		errors.push({ msg: 'Password should contain at least 1 numeric value'});
	}

	if (!spcharacter.test(password)) {
		errors.push({ msg: 'Password should contain at least 1 special character'});
	}

	// Check passwords match
	if (password != pwd_repeat) {
		errors.push({ msg: 'Passwords do not match' });
	}

	if (errors.length > 0) {
		return res.status(400).render('changePwd', { errors, token: req.params.userToken, userNameTag: ''  });
	}
	else {
		Token.findOne({ token: req.params.userToken }, (err, token) => {
			if (err) { return res.status(500).send({ msg: err.message }); }

			if (!token) {
				return res.status(404).render('changePwd', { 'error': 'We could not find the token. Your token might have expired', token: req.params.userToken, userNameTag: ''  });
			}

			User.findOne({ _id: token._userId }, (err, user) => {
				if (err) { return res.status(500).send({ msg: err.message }); }

				if (!user)
					return res.status(404).render('changePwd', { 'error': 'We were unable to find a user for this token.', token: req.params.userToken, userNameTag: ''  });

				if (user.email != email) {
					return res.status(400).render('changePwd', { 'error_msg': 'Incorrect email', token: req.params.userToken, userNameTag: ''  });
				}
			
				bcrypt.genSalt(10, (err, salt) => {
					bcrypt.hash(password, salt, (err, hash) => {
						if (err) { return res.status(500).send({ msg: err.message }); }

						user.password = hash;

						user.save((err) => {
							if (err) { return res.status(500).send({ msg: err.message }); }
							return res.status(200).render('login', { 'success_msg': 'Your password has been updated and you can now login.', userNameTag: ''  });
						});
					});
				});
			});
		});
	}
};

exports.user_updatePwd = (req, res) => {
  const { id, password, pwd_repeat } = req.body;
	const errors = [];

	let lowercase = new RegExp("^(?=.*[a-z])");
	let uppercase = new RegExp("^(?=.*[A-Z])");
	let numeric = new RegExp("^(?=.*[0-9])");
	let spcharacter = new RegExp("^(?=.*[!@#\$%\^&\*])");

	if (!password || !pwd_repeat) {
		errors.push({ msg: 'Please fill in all fields' });
	}

	if (password.length < 8) {
		errors.push({ msg: 'Password should be at least 8 characters' });
	}

	if (!lowercase.test(password)) {
		errors.push({ msg: 'Password should contain at least 1 lowercase character'});
	}

	if (!uppercase.test(password)) {
		errors.push({ msg: 'Password should contain at least 1 uppercase character'});
	}

	if (!numeric.test(password)) {
		errors.push({ msg: 'Password should contain at least 1 numeric value'});
	}

	if (!spcharacter.test(password)) {
		errors.push({ msg: 'Password should contain at least 1 special character'});
	}

	// Check passwords match
	if (password != pwd_repeat) {
		errors.push({ msg: 'Passwords do not match' });
	}

	if (errors.length > 0) {
		return res.status(400).render('updatePass', { errors, id: req.user._id, userNameTag: ''});
	}
	else {
			User.findById(id, (err, user) => {
				if (err) { return res.status(500).send({ msg: err.message }); }

				bcrypt.genSalt(10, (err, salt) => {
					bcrypt.hash(password, salt, (err, hash) => {
						if (err) { return res.status(500).send({ msg: err.message }); }

						user.password = hash;

						user.save((err) => {
							if (err) { return res.status(500).send({ msg: err.message }); }
              return res.status(200).render('editProfile', {
                'success_msg': 'Your password has been updated.',
                userNameTag: '',
                name: req.user.username,
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                email: req.user.email,
                gender: req.user.gender,
                date: req.user.dob,
                agePref: req.user.agePref,
                sexPref: req.user.sexPref,
                bio: req.user.bio,
                interests: req.user.interests,
                pp: req.user.profileImages.image1,
                userNameTag: req.user.username
            })
						});
					});
				});
			});
	}
};

exports.user_extendedProfile = (req, res) => {
  let uploads = res.locals.upload;
  uploads(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      req.flash("error_msg", err.message);
      res.status(500).redirect("/users/extendedProfile");
    } else if (err) {
      req.flash("error_msg", err.message);
      res.status(500).redirect("/users/extendedProfile");
    }

    if (req.file) {
      await User.findById(req.user.id, (err, user) => {
        if (!user) {
          if (err) {
            return res.status(500).send({ msg: err.message });
          }
        } else {
          const newDate = new Date(req.body.birthdate);
          const ageDifMs = Date.now() - newDate.getTime();
          const ageDate = new Date(ageDifMs);
          const age = Math.abs(ageDate.getUTCFullYear() - 1970);

          if (checkInterest(req.body.interests)) {
            user.interests.first = req.body.interests[0];
            user.interests.second = req.body.interests[1];
            user.interests.third = req.body.interests[2];
            user.interests.fourth = req.body.interests[3];
            user.interests.fifth = req.body.interests[4];
          } else {
            user.interests.first = req.body.interests;
            user.interests.second = null;
            user.interests.third = null;
            user.interests.fourth = null;
            user.interests.fifth = null;
          }

          user.gender = req.body.gender;
          user.dob = req.body.birthdate;
          user.agePref = req.body.age_preference;
          user.sexPref = req.body.sex_pref;
          user.bio = req.body.bio;
          user.country = req.body.country;
          user.province = req.body.province;
          user.city = req.body.city;
          user.lat = req.body.lat;
          user.long = req.body.long;
          user.profileImages.image1 = req.file.filename;
          user.profileImages.image2 = "couple15.jpg";
          user.profileImages.image3 = "couple16.jpg";
          user.profileImages.image4 = "couple17.jpg";
          user.profileImages.image5 = "couple18.jpg";
          user.gender2 = req.body.gender2;
          user.age = age;
          user.extendedProf = true;
          user.save((err) => {
            if (err) {
              return res.status(500).send({ msg: err.message });
            }
            return res.status(200).redirect("/dashboard");
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
      req.flash("error_msg", err);
      res.status(500).redirect("/users/editProfile");
    } else if (err) {
      req.flash("error_msg", err);
      res.status(500).redirect("/users/editProfile");
    }

    const newDate = new Date(req.body.birthdate);
    const ageDifMs = Date.now() - newDate.getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

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
          age: age,
          bio: req.body.bio,
          "profileImages.image1": req.file.filename,
          country: req.body.country,
          province: req.body.province,
          city: req.body.city,
          lat: req.body.lat,
          long: req.body.long,
        },
      };
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
          age: age,
          bio: req.body.bio,
          country: req.body.country,
          province: req.body.province,
          city: req.body.city,
          lat: req.body.lat,
          long: req.body.long,
        },
      };
    }
    if (
      req.user.username !== req.body.username ||
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
      await User.findOneAndUpdate(
        { _id: req.user._id },
        val,
        { new: true },
        (err, user) => {
          if (err) {
            req.flash("error_msg", err);
            res.status(500).redirect("/users/editProfile");
          }
          // return res.send(user.interests.first);
          if (checkInterest(req.body.interests)) {
            user.interests.first = req.body.interests[0];
            user.interests.second = req.body.interests[1];
            user.interests.third = req.body.interests[2];
            user.interests.fourth = req.body.interests[3];
            user.interests.fifth = req.body.interests[4];
          } else {
            user.interests.first = req.body.interests;
            user.interests.second = null;
            user.interests.third = null;
            user.interests.fourth = null;
            user.interests.fifth = null;
          }
          user.save((err) => {
            if (err) {
              return res.status(500).send({ msg: err.message });
            }
            req.flash("success_msg", "Successfully updated information.");
            res.redirect("/users/editProfile");
          });
        }
      );
    }
  });
};

function getDateTime() {
  var date = new Date();

  var hour = date.getHours();
  hour = (hour < 10 ? "0" : "") + hour;

  var min = date.getMinutes();
  min = (min < 10 ? "0" : "") + min;

  var sec = date.getSeconds();
  sec = (sec < 10 ? "0" : "") + sec;

  var year = date.getFullYear();

  var month = date.getMonth() + 1;
  month = getMonth(parseInt((month < 10 ? "0" : "") + month));

  var day = date.getDate();
  day = (day < 10 ? "0" : "") + day;

  return month + " " + day + " " + hour + ":" + min;
}

function getMonth(m) {
  switch (m) {
    case 1:
      return "Jan";
    case 2:
      return "Feb";
    case 3:
      return "Mar";
    case 4:
      return "Apr";
    case 5:
      return "May";
    case 6:
      return "Jun";
    case 7:
      return "Jul";
    case 8:
      return "Aug";
    case 9:
      return "Sep";
    case 10:
      return "Oct";
    case 11:
      return "Nov";
    case 12:
      return "Dec";
    default:
      console.log(m);
  }
}

function getMonth(m) {
  switch (m) {
    case 1:
      return "Jan";
    case 2:
      return "Feb";
    case 3:
      return "Mar";
    case 4:
      return "Apr";
    case 5:
      return "May";
    case 6:
      return "Jun";
    case 7:
      return "Jul";
    case 8:
      return "Aug";
    case 9:
      return "Sep";
    case 10:
      return "Oct";
    case 11:
      return "Nov";
    case 12:
      return "Dec";
    default:
      console.log(m);
  }
}

function checkInterest(interests) {
  if (typeof interests !== "undefined") {
    if (Array.isArray(interests)) {
      return true;
    } else {
      return false;
    }
  }
}
