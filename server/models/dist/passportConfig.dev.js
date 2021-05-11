"use strict";

var User = require("./User");

var bcrypt = require("bcryptjs");

var localStrategy = require("passport-local").Strategy;

module.exports = function (passport) {
  passport.use(new localStrategy({
    usernameField: "email"
  }, function (email, password, done) {
    User.findOne({
      email: email
    }, function (err, user) {
      if (err) throw err;
      if (!user) return done(null, false, {
        msg: "No User Exists"
      });
      bcrypt.compare(password, user.password, function (err, result) {
        if (err) throw err;

        if (result === true) {
          return done(null, user);
        } else {
          return done(null, false, {
            msg: "wrong password"
          });
        }
      });
    });
  }));
  passport.serializeUser(function (user, cb) {
    cb(null, user.id);
  });
  passport.deserializeUser(function (id, cb) {
    User.findOne({
      _id: id
    }, function (err, user) {
      var userInformation = {
        username: user.username,
        email: user.email,
        id: user._id
      };
      cb(err, userInformation);
    });
  });
};