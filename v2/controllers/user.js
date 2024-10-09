import { error, success } from "../config/respTypes.js";
import asyncWrapper from "../middleware/async.js";
import Follows from "../models/Follows.js";
import User from "../models/User.js";
import { deleteFile } from "../config/fileUpload.js";

export const getUserInfo = asyncWrapper(async (req, res) => {
  const userInfo = await User.findOne({ email: req.userInfo.email });

  const { email, name, _id, phone_no, img_location } = userInfo;
  return res.status(200).json({
    success,
    userInfo: { email, name, id: _id, phone_no, image: img_location },
  });
});

export const getOtherUserInfo = asyncWrapper(async (req, res) => {
  const { userId } = req.params;

  const userInfo = await User.findOne({ _id: userId });

  if (userInfo) {
    const { email, name, _id, img_location } = userInfo;
    return res.status(200).json({
      success,
      userInfo: { email, name, id: _id, image: img_location },
    });
  } else {
    return res.status(200).json({
      error,
    });
  }
});

export const getFollowings = asyncWrapper(async (req, res) => {
  const activeUser = req.userInfo;

  const followings = await Follows.find({ user: activeUser.id });
  const returnedUser = followings.map((follow) => follow.following);
  return res.status(200).json({ followed: returnedUser, success });
});

export const getFollowCount = asyncWrapper(async (req, res) => {
  const { user } = req.params;
  const following = await Follows.find({ user });
  const followers = await Follows.find({ following: user });
  return res.status(200).json({
    success,
    followers: followers.length,
    following: following.length,
  });
});

export const updateProfile = asyncWrapper(async (req, res) => {
  const { fullname, email, phone } = req.body;

  const emailexist = await User.findOne({ email });
  if (emailexist && emailexist.id !== req.userInfo.user_id)
    return res.status(200).json({ error: true, message: "Email exists" });

  const updateUser = await User.findOneAndUpdate(
    { id: req.userInfo.user_id },
    {
      name: fullname,
      email,
      phone_no: phone,
    }
  );

  if (updateUser) return res.status(200).json({ success: true });
  return res
    .status(200)
    .json({ error: true, message: "Error updating your profile" });
});

export const deleteExistingProfilePic = asyncWrapper(async (req, res, next) => {
  const id = req.userInfo.user_id;

  const existing = await User.findOne({ id });
  if (existing && existing.img_location !== "") {
    const removal = await deleteFile(
      "./public/profile/" + existing.img_location
    );
  }

  return next();
});

export const updateProfilePic = asyncWrapper(async (req, res) => {
  const id = req.userInfo.user_id;
  const fileName = req.file.filename;

  let uploaded = await User.findOneAndUpdate(
    { id },
    { img_location: fileName }
  );

  if (!uploaded) return res.status(200).json({ error: true });
  return res.status(200).json({ success: true });
});
