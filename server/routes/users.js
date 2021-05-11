const express = require("express");
const router = express.Router();
const Merch = require("../models/merch");
const User = require("../models/User");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const passportLocal = require("passport-local").Strategy;
const session = require("express-session");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const socketio = require("socket.io");
const { http } = require("../app");
const io = socketio(http);

io.on("connection", (socket) => {
  socket.on("join", (user) => {
    const username = user.name;
    console.log(`${username} has connected.`);
  });
  socket.on("disconnect", () => {
    console.log("aaa");
  });
});

const multer = require("multer");
// const upload = multer({ dest: "uploads/" });
const stroage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + file.originalname);
  },

  // filename: function (req, file, cb) {
  //   cb(null, new Date().toISOString() + file.originalname);
  // },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: stroage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: fileFilter,
});

const urlencoded_ = express.urlencoded({ extended: true });
const json_ = express.json();

router.use(cookieParser("secretcode"));

require("../models/passportConfig")(passport);

router.use(
  session({
    secret: "secretcode",
    resave: true,
    saveUninitialized: true,
  })
);
router.use(passport.initialize());
router.use(passport.session());

router.use(urlencoded_);
router.use(json_);

router.post(
  "/register",
  [
    check("username", "The username must be 6 characters long")
      .exists()
      .isLength({ min: 6 }),
    check("email", "The email is not a standard email ").exists().isEmail(),
    check("address", "Address can't be empty").exists().isLength({ min: 1 }),
    check("password", "Password can't be empty").exists().isLength({ min: 1 }),
  ],
  async (req, res, next) => {
    const vErr = validationResult(req);
    if (!vErr.isEmpty()) {
      const alert = vErr.array();
      res.send(alert);
    } else {
      await User.findOne({ email: req.body.email }, async (err, doc) => {
        if (err) throw err;
        if (doc) res.send("Email Already Exists");
        if (!doc) {
          const hashedPassword = await bcrypt.hash(req.body.password, 10);
          const Newuser = new User({
            email: req.body.email,
            username: req.body.username,
            address: req.body.address,
            password: hashedPassword,
          });
          await Newuser.save();
          res.send("create a new account");
        }
      });
    }
  }
);

router.post(
  "/login",
  [
    check("email", "Email can not be empty").exists().isLength({ min: 1 }),
    check("password", "Password can not be empty")
      .exists()
      .isLength({ min: 1 }),
  ],
  (req, res, next) => {
    const vErr = validationResult(req);
    if (!vErr.isEmpty()) {
      const alert = vErr.array();
      res.send(alert);
    } else {
      passport.authenticate("local", (err, user, info) => {
        if (err) throw err;
        if (!user) res.send(info);
        else {
          req.logIn(user, (err) => {
            if (err) console.log(err);
            // console.log(user);
            res.send("Successfully Authenticated");
          });
        }
      })(req, res, next);
    }
  }
);

router.get("/logout", (req, res) => {
  req.logout();
  res.send("You are logged out");
});

router.post("/createNew", upload.single("merchImg"), async (req, res) => {
  console.log(req.user);
  const merch = new Merch({
    name: req.body.name,
    price: req.body.price,
    biddingTime: req.body.biddingTime,
    sellerId: req.user.id,
    photo: req.file.filename,
  });
  await merch.save();
  res.send(req.user);
});

router.post("/addMoney", async (req, res) => {
  const money = req.body.money;
  const id = req.body.id;
  let current;
  let error;
  await Merch.findOne({ _id: id }, (err, datas) => {
    if (err) throw err;
    if (datas) {
      current = datas.price;
    } else {
      error = "not found";
    }
  });
  if (error === "not found") res.send("not such data");
  console.log(money, current);
  const parsemoney = parseInt(money, 10);
  const currentmoney = parseInt(current, 10);

  if (parsemoney > current) {
    console.log(money, currentmoney);

    await Merch.updateOne(
      {
        _id: req.body.id,
      },
      {
        price: money,
        highestId: req.user.id,
        highestName: req.user.username,
      },
      (err, docs) => {
        if (err) throw err;
        res.send(docs);
      }
    );
  }
});

const { ensureAuthenticated } = require("../config/auth");

router.get("/auth", (req, res) => {
  if (req.isAuthenticated()) {
    res.send(req.user);
  } else res.send("Please log in");
});

// io.on("connection", (socket) => {
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
