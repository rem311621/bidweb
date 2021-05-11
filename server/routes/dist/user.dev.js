"use strict";

var express = require("express");

var router = express.Router();
router.get("/login", function (req, res) {
  res.send("login");
});
router.get("/register", function (req, res) {
  res.send("register");
});