const mongoose = require("mongoose");
const User = require("../models/User");
const jwt = require("jwt-then");
// const jwt = require("jsonwebtoken");
const sha256 = require("js-sha256");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    email,
    password: sha256(password + process.env.SALT),
  });

  if (!user) throw "Email and password dit not match.";

  console.log("ID", user);
  const token = await jwt.sign({ id: user._id }, process.env.SECRET);

  res.json({
    message: "User logged in successfully",
    token,
  });
};

exports.register = async (req, res) => {
  console.log("Reg req body", req.body);
  const { name, email, password } = req.body;

  const emailRegex = /@gmail.com|@yahoo.com|@hotmail.com!@live.com/;

  if (!emailRegex.test(email)) throw "Email is not supported from your domain.";

  if (password.length < 6) throw "Password must be at least 6 characters long.";

  const userExist = await User.findOne({
    email,
  });

  if (userExist) throw "User with same email already exists.";

  const user = new User({
    name,
    email,
    password: sha256(password + process.env.SALT),
  });

  await user.save();

  res.json({
    message: "User [" + name + "] registered successfully",
  });
};
