'use strict';

// Passport Strategy configuration

const passport = require('passport');
const passportLocal = require('passport-local');
const bcrypt = require('bcryptjs');

const LocalStratregy = passportLocal.Strategy;

const User = require('./models/user');

// Serialization and Deserialization mechanisms for passport

passport.serializeUser((user, callback) => {
  callback(null, user._id);
});

passport.deserializeUser((id, callback) => {
  User.findById(id)
    .then((user) => {
      callback(null, user);
    })
    .catch((err) => {
      callback(err);
    });
});

// Sign in and Sign Up Strategies

passport.use(
  'sign-up',
  new LocalStratregy({}, (username, password, callback) => {
    bcrypt
      .hash(password, 10)
      .then((hashedPassword) => {
        return User.create({
          username,
          passwordHash: hashedPassword
        });
      })
      .then((user) => {
        callback(null, user);
      })
      .catch((err) => {
        callback(err);
      });
  })
);

passport.use(
  'sign-in',
  new LocalStratregy({}, (username, password, callback) => {
    let user;
    User.findOne({ username })
      .then((userDoc) => {
        user = userDoc;
        return bcrypt.compare(password, user.passwordHash);
      })
      .then((result) => {
        if (result) {
          callback(null, user);
        }
      })
      .catch((err) => {
        callback(err);
      });
  })
);
