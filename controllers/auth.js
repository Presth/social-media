import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
import { error, success } from "../config/respTypes.js";
import User from "../models/User.js"
import asyncWrapper from '../middleware/async.js';
import { createError } from '../middleware/error-handler.js';

dotenv.config();

export const login = asyncWrapper(async (req, res) => {
     const { email, password } = req.body
     const user = await User.findOne({ email });
     if (!user || !bcrypt.compareSync(password, user.password)) {
          return res.status(200).json({ error, message: "Invalid login" })
     }
     const auth_token = jwt.sign({ id: user._id, username: user.email, name: user.name }, process.env.JWT_SECRET)
     req.session.user = auth_token
     req.session.authentication = true;
     res.status(200).cookie("token", auth_token).json({ success })
})

export const logout = (req, res) => {
     req.session.destroy();
     return res.status(200).json({ message: "loggedout" });
}

export const createAccount = asyncWrapper(async (req, res) => {
     const { email, name, password } = req.body
     if (!email || email == "" || !name || name == "" || !password || password == "") {
          return res.status(204).json({ error, message: "All input fields required" })
     }
     let salt = bcrypt.genSaltSync(10);
     let hashedPass = bcrypt.hashSync(password, salt);

     const user = await User.findOne({ email });

     if (user) return res.status(200).json({ error, message: "Email already used" })
     const createdUser = await User.create({ email, name, password: hashedPass })
     res.status(200).json({ success, message: "Account Created successfully", createdUser })
})

export const AuthenticateUser = (req, res, next) => {
     if (!req.session.user) {
          return next(createError("User not authenticated", 401))
     }

     jwt.verify(req.session.user, process.env.JWT_SECRET, (err, user) => {
          req.userInfo = { id: user.id, name: user.name }
          next()
     })
}
