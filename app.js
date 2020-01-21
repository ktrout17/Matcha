const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const morgan = require('morgan');
const path = require('path');

const app = express();

// console logs Dev information
app.use(morgan('dev'));


// Passport Config
require('./config/passport')(passport);

// DB config
const db = require('./config/keys').MongoURI;
mongoose.set('useCreateIndex', true);

// Connect to Mongo
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
	.then(() => console.log('MongoDb Connected... '))
	.catch(err => console.log(err));

// ejs
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Bodypaser
app.use(express.urlencoded({ extended: false }));
// app.use(express.json());

// Express session
app.use(session({
	secret: 'slacker',
	resave: true,
	saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global Variables
app.use((req, res, next) => {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.message = req.flash('message');
	next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

module.exports = app;