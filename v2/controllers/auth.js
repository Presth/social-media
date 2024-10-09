import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { v4 as uuid } from "uuid";
import { error, success } from "../config/respTypes.js";
import User from "../models/User.js";
import asyncWrapper from "../middleware/async.js";
import { createError } from "../middleware/error-handler.js";

dotenv.config();

export const login = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;
  let user = await User.findOne({ email });
  if (!user) user = await User.findOne({ username: email });

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res
      .status(200)
      .json({ error, message: "Invalid email or password" });
  }
  const auth_token = jwt.sign(
    { id: user._id, user_id: user.id, username: user.email, name: user.name },
    process.env.JWT_SECRET
  );
  req.session.user = auth_token;
  req.session.authentication = true;
  res
    .status(200)
    .cookie("auth_token", auth_token)
    .json({ success, token: auth_token });
});

export const logout = (req, res) => {
  req.session.destroy();
  return res.status(200).json({ message: "loggedout" });
};

export const createAccount = asyncWrapper(async (req, res) => {
  const { email, name, password, username, phoneNo } = req.body;
  const phone_no = phoneNo;

  if (
    !email ||
    email == "" ||
    !name ||
    name == "" ||
    !password ||
    password == ""
  ) {
    return res
      .status(200)
      .json({ error, message: "All input fields required" });
  }
  let salt = bcrypt.genSaltSync(10);
  let hashedPass = bcrypt.hashSync(password, salt);

  const email_used = await User.findOne({ email });

  if (email_used)
    return res.status(200).json({ error, message: "Email already used" });

  const username_used = await User.findOne({ username });
  if (username_used)
    return res.status(200).json({ error, message: "Username already used" });

  const id = uuid();

  const createdUser = await User.create({
    id,
    username,
    name,
    password: hashedPass,
    email,
    phone_no,
  });
  const auth_token = jwt.sign(
    {
      id: createdUser._id,
      user_id: createdUser.id,
      username: createdUser.email,
      name: createdUser.name,
    },
    process.env.JWT_SECRET
  );

  req.session.user = auth_token;
  req.session.authentication = true;

  res.status(200).cookie("auth_token", auth_token).json({
    success,
    message: "Account Created successfully",
    createdUser,
    token: auth_token,
  });
});

export const AuthenticateUser = (req, res, next) => {
  if (!req.session.user) {
    if (req.cookies.auth_token) {
      req.session.user = req.cookies.auth_token;
      req.session.authentication = true;
    } else {
      return next(createError("User not authenticated", 401));
    }
  }

  jwt.verify(req.session.user, process.env.JWT_SECRET, (err, user) => {
    req.userInfo = {
      id: user.id,
      user_id: user.user_id,
      name: user.name,
      email: user.username,
    };
    next();
  });
};

export const updateUserPassword = asyncWrapper(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  if (oldPassword == "" || newPassword == "")
    return res
      .status(200)
      .json({ success: false, message: "Passwords cant be empty" });

  if (newPassword.length < 6)
    return res.status(200).json({
      success: false,
      message: "New Password must be up to 6 characters",
    });
  123;

  if (newPassword !== confirmPassword)
    return res
      .status(200)
      .json({ success: false, message: "New Passwords does not match" });

  const user = await User.findOne({ id: req.userInfo.user_id });
  if (!bcrypt.compareSync(oldPassword, user.password)) {
    return res
      .status(200)
      .json({ success: false, message: "Old Password is not Correct" });
  }

  const salt = bcrypt.genSaltSync(10);
  const hashedPass = bcrypt.hashSync(newPassword, salt);
  const updatePass = await User.findOneAndUpdate(
    { _id: req.userInfo.id },
    {
      password: hashedPass,
    }
  );

  if (updatePass)
    return res.status(200).json({ success: true, message: "Password updated" });

  return res.status(200).json({ success: true, message: "User not found" });
});
