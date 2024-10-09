import asyncWrapper from "../middleware/async.js"
import Follows from "../models/Follows.js"
import { success } from "../config/respTypes.js"
import { processWsMessage } from "../config/websocket-setup.js"

export const followUser = asyncWrapper(async (req, res) => {
     const { id } = req.params //get user id to follow
     const user = req.userInfo.id

     const following = await Follows.findOne({ user, following: id });
     if (!following) {
          const follow = await Follows.create({ user, following: id })
     } else {
          const unfollow = await Follows.findOneAndDelete({ user, following: id })
     }

     await processWsMessage(id, { type: "follow", message: `${req.userInfo.name} started following you` });
     return res.status(200).json({ success })

})

export const getFollowers = asyncWrapper(async (req, res) => {
     const followers = await Follows.find({ following: req.userInfo.id });

     return res.json({ followers, success })
})