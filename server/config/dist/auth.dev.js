"use strict";

module.exports = {
  ensureAuthenticated: function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }

    res.send("Please log in");
  }
};