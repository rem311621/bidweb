"use strict";

var express = require("express");

var mongoose = require("mongoose");

var socketio = require("socket.io");

var cors = require("cors");

var app = express();
var PORT = process.env.PORT || 5000;

var http = require("http").createServer(app);

var io = socketio(http);

var passportSocketIo = require("passport.socketio");

app.use(express["static"]("uploads")); //前端從server存取圖片

app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
  // <-- location of the react app were connecting to
  credentials: true
})); // Get db URL

require("dotenv").config(); // Connect to database


mongoose.connect(process.env.DB_CONNECTION, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(function () {
  return console.log("Connect to mydb...");
})["catch"](function (err) {
  console.log(err);
});
app.use("/users", require("./routes/users"));
app.use("/merchs", require("./routes/merchs"));
app.post("/", function (req, res) {
  res.send(req.user);
});
http.listen(PORT, function () {
  console.log("Server start on ".concat(PORT));
});