const express = require("express");
const mongoose = require("mongoose");
const socketio = require("socket.io");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5000;
var http = require("http").createServer(app);
const io = socketio(http);
const passportSocketIo = require("passport.socketio");

app.use(express.static("uploads")); //前端從server存取圖片
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000", // <-- location of the react app were connecting to
    credentials: true,
  })
);

// Get db URL
require("dotenv").config();

// Connect to database
mongoose
  .connect(process.env.DB_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connect to mydb..."))
  .catch((err) => {
    console.log(err);
  });

app.use("/users", require("./routes/users"));
app.use("/merchs", require("./routes/merchs"));

app.post("/", (req, res) => {
  res.send(req.user);
});

http.listen(PORT, () => {
  console.log(`Server start on ${PORT}`);
});
