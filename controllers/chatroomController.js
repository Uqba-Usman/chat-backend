const mongoose = require("mongoose");
const Chatroom = require("../models/Chatroom");

exports.createChatroom = async (req, res) => {
  const { name } = req.body;

  const nameRegex = /[A-Za-z\s]+$/;

  if (!nameRegex.test(name)) throw "Chatroom can contain only alphabets";
  const chatroomExists = await Chatroom.findOne({ name });
  if (chatroomExists) throw "Chatroom with that name already exists";
  const chatroom = new Chatroom({
    name,
  });
  await chatroom.save();

  res.json({
    message: "Chatroom Created",
  });
};

exports.getAllChatrooms = async (req, res) => {
  console.log("Inside");
  const chatrooms = await Chatroom.find({});
  console.log("chatrooms", chatrooms);
  res.json(chatrooms);
};
