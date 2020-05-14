'use strict';

// Passport Strategy configuration

const passport = require('passport');
const passportLocal = require('passport-local');
const passportGithub = require('passport-github');
const bcrypt = require('bcryptjs');

const LocalStratregy = passportLocal.Strategy;
const GithubStrategy = passportGithub.Strategy;

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

// Github Strategy and Sign in and Sign Up Strategies

passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_API_CLIENT_ID,
      clientSecret: process.env.GITHUB_API_CLIENT_SECRET,
      callbackURL: process.env.GITUHUB_CALLBACK_URL,
      scope: 'user:email'
    },
    (accessToken, refreshToken, profile, callback) => {
      const name = profile.displayName;
      const email = profile.emails.length ? profile.emails[0].value : null;
      const photo = profile._json.avatar_url;
      const githubId = profile.id;

      User.findOne({ githubId })
        .then((user) => {
          if (user) {
            return Promise.resolve(user);
          } else {
            return User.create({ email, name, photo, githubId });
          }
        })
        .then((user) => {
          callback(null, user);
        })
        .catch((err) => {
          callback(err);
        });
    }
  )
);

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
