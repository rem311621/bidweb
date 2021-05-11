"use strict";

var express = require("express");

var router = express.Router();

var Merch = require("../models/merch");

var passport = require("passport");

var cookieParser = require("cookie-parser");

var passportLocal = require("passport-local").Strategy;

var session = require("express-session");

var bcrypt = require("bcryptjs");

var _require = require("express-validator"),
    check = _require.check,
    validationResult = _require.validationResult;

var urlencoded_ = express.urlencoded({
  extended: true
});
var json_ = express.json();
router.use(cookieParser("secretcode")); // router.use(passport.initialize());
// router.use(passport.session());
// require("../models/passportConfig")(passport);

router.use(session({
  secret: "secretcode",
  resave: true,
  saveUninitialized: true
}));
router.use(urlencoded_);
router.use(json_);
router.get("/getMerch", function _callee(req, res) {
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          Merch.find({}, function (err, datas) {
            if (err) throw err;
            res.send(datas);
          });

        case 1:
        case "end":
          return _context.stop();
      }
    }
  });
});
router.post("/getAMerch", function _callee2(req, res) {
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          Merch.find({
            _id: req.body.id
          }, function (err, datas) {
            if (err) throw err;
            res.send(datas);
          });

        case 1:
        case "end":
          return _context2.stop();
      }
    }
  });
});

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

router.post("/searchMerch", function _callee3(req, res) {
  var regex;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          if (req.body.merchName == "") {
            res.send("error");
          } else {
            regex = new RegExp(escapeRegex(req.body.merchName), "gi");
            Merch.find({
              name: regex
            }, function (err, datas) {
              if (err) throw err;
              if (datas) res.send(datas);else {
                res.send("error");
              }
            });
          }

        case 1:
        case "end":
          return _context3.stop();
      }
    }
  });
});
router.post("/addMoney", function _callee4(req, res) {
  var money, id, current, error;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          money = req.body.money;
          id = req.body.id;
          _context4.next = 4;
          return regeneratorRuntime.awrap(Merch.findOne({
            _id: id
          }, function (err, datas) {
            if (err) throw err;

            if (datas) {
              current = datas.price;
            } else {
              error = "not found";
            }
          }));

        case 4:
          if (error === "not found") res.send("not such data");

          if (!(money > current)) {
            _context4.next = 8;
            break;
          }

          _context4.next = 8;
          return regeneratorRuntime.awrap(Merch.updateOne({
            _id: req.body.id
          }, {
            price: money
          }, function (err, docs) {
            if (err) throw err;
            res.send("sucess");
          }));

        case 8:
        case "end":
          return _context4.stop();
      }
    }
  });
});
module.exports = router;