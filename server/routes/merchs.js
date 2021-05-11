const express = require("express");
const router = express.Router();
const Merch = require("../models/merch");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const passportLocal = require("passport-local").Strategy;
const session = require("express-session");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");

const urlencoded_ = express.urlencoded({ extended: true });
const json_ = express.json();

router.use(cookieParser("secretcode"));
// router.use(passport.initialize());
// router.use(passport.session());
// require("../models/passportConfig")(passport);

router.use(
  session({
    secret: "secretcode",
    resave: true,
    saveUninitialized: true,
  })
);

router.use(urlencoded_);
router.use(json_);

router.get("/getMerch", async (req, res) => {
  Merch.find({}, (err, datas) => {
    if (err) throw err;
    res.send(datas);
  });
});

router.post("/getAMerch", async (req, res) => {
  Merch.find({ _id: req.body.id }, (err, datas) => {
    if (err) throw err;
    res.send(datas);
  });
});

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

router.post("/searchMerch", async (req, res) => {
  if (req.body.merchName == "") {
    res.send("error");
  } else {
    const regex = new RegExp(escapeRegex(req.body.merchName), "gi");
    Merch.find({ name: regex }, (err, datas) => {
      if (err) throw err;
      if (datas) res.send(datas);
      else {
        res.send("error");
      }
    });
  }
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
  if (money > current) {
    await Merch.updateOne(
      { _id: req.body.id },
      { price: money },
      (err, docs) => {
        if (err) throw err;
        res.send("sucess");
      }
    );
  }
});

module.exports = router;
