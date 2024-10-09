import asyncWrapper from "../middleware/async.js";
import Users from "../models/User.js";

export const getUsers = asyncWrapper(async (req, res) => {
  let { page } = req.query;
  const noToFetch = 10; //set no of doc to fetch

  if (!page) {
    page = 0;
  } else {
    page = page * noToFetch;
  }

  const users = await Users.find({}).skip(page).limit(noToFetch);

  const userList = users.filter((user) => user.id !== req.userInfo.user_id);

  const returnedList = userList.map((user) => {
    let { _id, name, email, img_location } = user;
    return { id: _id, name, email, image: img_location };
  });

  return res.status(200).json({ users: returnedList });
});

export const updateUserProfile = (req, res) => {
  return res.send("Manage my profile");
};
