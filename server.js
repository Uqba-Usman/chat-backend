require("dotenv").config();
const mongoose = require("mongoose");

const app = require("./app");

mongoose.connect(process.env.DATABASE, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

mongoose.connection.on("error", (error) => {
  console.log("Mongoose connection error: " + error.message);
});

mongoose.connection.once("open", () => {
  console.log("Mongoose connected!");
});

require("./models/User");
require("./models/Chatroom");
require("./models/Message");

const server = app.listen(8000, () => {
  console.log("Server listininig on port 8000");
});

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});
const jwt = require("jwt-then");
// const jwt = require("jsonwebtoken");

const Message = require("./models/Message");
const User = require("./models/User");

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.query.token;
    console.log("Token: ", token);
    const payload = await jwt.verify(token, process.env.SECRET);
    console.log("payload: ", payload);
    socket.userId = payload.id;
    next();
  } catch (err) {
    console.log("ERROR: " + err);
  }
});

io.on("connection", (socket) => {
  console.log("Connected: " + socket.userId);

  socket.on("disconnect", () => {
    console.log("DisConnected: " + socket.userId);
  });

  socket.on("joinRoom", ({ chatroomId }) => {
    socket.join(chatroomId);
    console.log("A user joined the chat room: " + chatroomId);
  });

  socket.on("leaveRoom", ({ chatroomId }) => {
    socket.leave(chatroomId);
    console.log("A user left the chat room: " + chatroomId);
  });

  socket.on("chatroomMessage", async ({ chatroomId, message }) => {
    if (message.trim().length > 0) {
      console.log("USER ID", socket.userId);
      const user = await User.findOne({ _id: socket.userId });

      const newMessage = new Message({
        chatroom: chatroomId,
        user: socket.userId,
        message,
      });

      io.to(chatroomId).emit("newMessage", {
        message,
        name: user.name,
        userId: socket.userId,
      });

      await newMessage.save();
    }
  });
});
