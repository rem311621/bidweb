"use strict";

var express = require("express");

var router = express.Router();

var Merch = require("../models/merch");

var User = require("../models/User");

var passport = require("passport");

var cookieParser = require("cookie-parser");

var passportLocal = require("passport-local").Strategy;

var session = require("express-session");

var bcrypt = require("bcryptjs");

var _require = require("express-validator"),
    check = _require.check,
    validationResult = _require.validationResult;

var socketio = require("socket.io");

var _require2 = require("../app"),
    http = _require2.http;

var io = socketio(http);
io.on("connection", function (socket) {
  socket.on("join", function (user) {
    var username = user.name;
    console.log("".concat(username, " has connected."));
  });
  socket.on("disconnect", function () {
    console.log("aaa");
  });
});

var multer = require("multer"); // const upload = multer({ dest: "uploads/" });


var stroage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function filename(req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + file.originalname);
  } // filename: function (req, file, cb) {
  //   cb(null, new Date().toISOString() + file.originalname);
  // },

});

var fileFilter = function fileFilter(req, file, cb) {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

var upload = multer({
  storage: stroage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});
var urlencoded_ = express.urlencoded({
  extended: true
});
var json_ = express.json();
router.use(cookieParser("secretcode"));

require("../models/passportConfig")(passport);

router.use(session({
  secret: "secretcode",
  resave: true,
  saveUninitialized: true
}));
router.use(passport.initialize());
router.use(passport.session());
router.use(urlencoded_);
router.use(json_);
router.post("/register", [check("username", "The username must be 6 characters long").exists().isLength({
  min: 6
}), check("email", "The email is not a standard email ").exists().isEmail(), check("address", "Address can't be empty").exists().isLength({
  min: 1
}), check("password", "Password can't be empty").exists().isLength({
  min: 1
})], function _callee2(req, res, next) {
  var vErr, alert;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          vErr = validationResult(req);

          if (vErr.isEmpty()) {
            _context2.next = 6;
            break;
          }

          alert = vErr.array();
          res.send(alert);
          _context2.next = 8;
          break;

        case 6:
          _context2.next = 8;
          return regeneratorRuntime.awrap(User.findOne({
            email: req.body.email
          }, function _callee(err, doc) {
            var hashedPassword, Newuser;
            return regeneratorRuntime.async(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    if (!err) {
                      _context.next = 2;
                      break;
                    }

                    throw err;

                  case 2:
                    if (doc) res.send("Email Already Exists");

                    if (doc) {
                      _context.next = 11;
                      break;
                    }

                    _context.next = 6;
                    return regeneratorRuntime.awrap(bcrypt.hash(req.body.password, 10));

                  case 6:
                    hashedPassword = _context.sent;
                    Newuser = new User({
                      email: req.body.email,
                      username: req.body.username,
                      address: req.body.address,
                      password: hashedPassword
                    });
                    _context.next = 10;
                    return regeneratorRuntime.awrap(Newuser.save());

                  case 10:
                    res.send("create a new account");

                  case 11:
                  case "end":
                    return _context.stop();
                }
              }
            });
          }));

        case 8:
        case "end":
          return _context2.stop();
      }
    }
  });
});
router.post("/login", [check("email", "Email can not be empty").exists().isLength({
  min: 1
}), check("password", "Password can not be empty").exists().isLength({
  min: 1
})], function (req, res, next) {
  var vErr = validationResult(req);

  if (!vErr.isEmpty()) {
    var alert = vErr.array();
    res.send(alert);
  } else {
    passport.authenticate("local", function (err, user, info) {
      if (err) throw err;
      if (!user) res.send(info);else {
        req.logIn(user, function (err) {
          if (err) console.log(err); // console.log(user);

          res.send("Successfully Authenticated");
        });
      }
    })(req, res, next);
  }
});
router.get("/logout", function (req, res) {
  req.logout();
  res.send("You are logged out");
});
router.post("/createNew", upload.single("merchImg"), function _callee3(req, res) {
  var merch;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          console.log(req.user);
          merch = new Merch({
            name: req.body.name,
            price: req.body.price,
            biddingTime: req.body.biddingTime,
            sellerId: req.user.id,
            photo: req.file.filename
          });
          _context3.next = 4;
          return regeneratorRuntime.awrap(merch.save());

        case 4:
          res.send(req.user);

        case 5:
        case "end":
          return _context3.stop();
      }
    }
  });
});
router.post("/addMoney", function _callee4(req, res) {
  var money, id, current, error, parsemoney, currentmoney;
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
          console.log(money, current);
          parsemoney = parseInt(money, 10);
          currentmoney = parseInt(current, 10);

          if (!(parsemoney > current)) {
            _context4.next = 12;
            break;
          }

          console.log(money, currentmoney);
          _context4.next = 12;
          return regeneratorRuntime.awrap(Merch.updateOne({
            _id: req.body.id
          }, {
            price: money,
            highestId: req.user.id,
            highestName: req.user.username
          }, function (err, docs) {
            if (err) throw err;
            res.send(docs);
          }));

        case 12:
        case "end":
          return _context4.stop();
      }
    }
  });
});

var _require3 = require("../config/auth"),
    ensureAuthenticated = _require3.ensureAuthenticated;

router.get("/auth", function (req, res) {
  if (req.isAuthenticated()) {
    res.send(req.user);
  } else res.send("Please log in");
}); // io.on("connection", (socket) => {
//   socket.on("join", () => {
//     const text = `a has joined the server`;
//     console.log(`ahas connected.`);
//   });
//   socket.on("sendMessage", (msg) => {});
//   socket.on("disconnect", () => {
//     console.log(`a has left`);
//   });
// });

module.exports = router;