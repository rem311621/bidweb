"use strict";

var mongoose = require("mongoose");

var MerchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  photo: {
    type: String
  },
  sellerId: {
    type: String,
    required: false
  },
  biddingTime: {
    type: String,
    required: true
  },
  highestId: {
    type: String,
    required: false
  },
  highestName: {
    type: String,
    required: false
  },
  date: {
    type: Date,
    "default": Date.now
  }
});
var Merch = mongoose.model("Merch", MerchSchema, "merchs");
module.exports = Merch;