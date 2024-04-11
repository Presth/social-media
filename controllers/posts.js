import asyncWrapper from "../middleware/async.js";
import Posts from "../models/Posts.js";
import { success } from "../config/respTypes.js";
import Follows from "../models/Follows.js";
import Comments from "../models/Comments.js";
import { activeUsers, broadcastMessageToSingleUser, processWsMessage } from "../config/websocket-setup.js";
import { createError } from "../middleware/error-handler.js";

// get my post
export const getMyPost = asyncWrapper(async (req, res) => {
     const userId = req.userInfo.id
     let { page } = req.query
     const noToFetch = 10; //set no of doc to fetch

     if (!page) {
          page = 0;
     } else {
          page = page * noToFetch
     }

     const posts = await Posts.find({ posted_by: userId }).skip(page).limit(noToFetch)

     return res.status(200).json({ posts })
})

// get other people posts
export const getFollowerPosts = asyncWrapper(async (req, res) => {
     const userId = req.userInfo.id
     let { page } = req.query //set a page number as currentindex to get the next paginated post

     const follows = await Follows.find({ user: userId })
     if (!follows) return res.status(200).json({ message: "No post for you, start following someone" })
     const peopleFollowed = follows.map(follow => follow.following);

     const noToFetch = 10; //set no of doc to fetch

     if (!page) {
          page = 0;
     } else {
          page = page * noToFetch
     }


     const posts = await Posts.find({ posted_by: { $in: peopleFollowed } }).skip(page).limit(noToFetch)

     if (!posts) return res.status(200).json({ message: "No recent post " })

     return res.status(200).json({ posts })
})

// get full content and comments on a post
export const singlePost = asyncWrapper(async (req, res) => {
     const { post_id } = req.params;

     const post = await Posts.findOne({ _id: post_id })
     if (!post) return next(createError("Post not found", 404))
     const comments = await Comments.find({ post_id })
     return res.status(200).json({ success, post, comments });
})

// save a post after it attachment have been uploaded
export const createPost = asyncWrapper(async (req, res, next) => {
     const { content, attachment } = req.body
     const user = req.userInfo.id

     if (content == "" && attachment == "")
          return next(createError("Post content and attachment cant be empty", 204))

     const post = await Posts.create({ content, posted_by: user, attachment });

     const followers = await Follows.find({ following: user })
     const followersId = followers.map(follower => follower.user)

     followersId.forEach(async (follower) => {
          await processWsMessage(follower, { type: "newpost", message: `${req.userInfo.name} uploaded a new post` })
     });

     return res.status(200).json({ success, message: "Post created" });
})


// like a post and unlike if already liked
export const likePost = asyncWrapper(async (req, res) => {
     const userId = req.userInfo.id
     const { post_id } = req.params;

     const postInfo = await Posts.findOne({ _id: post_id });
     if (!postInfo) {
          const like_post = await Posts.findOneAndUpdate({ _id: post_id }, { likes: [userId] })
          return res.status(200).json({ success })
     }

     let alreadyLike = postInfo.likes.find(user => user == userId)
     if (alreadyLike) {
          // un-like the post
          const unlikePost = await Posts.findOneAndUpdate({ _id: post_id }, { likes: postInfo.likes.filter(user => user != userId) })
     } else {
          const like_post = await Posts.findOneAndUpdate({ _id: post_id }, { likes: [...postInfo.likes, userId] })
          await processWsMessage(postInfo.posted_by, { type: 'like', message: `${req.userInfo.name} just liked your post` })
     }

     return res.status(200).json({ success })
})

// comment on a post
export const commentPost = asyncWrapper(async (req, res) => {
     const user = req.userInfo.id
     const { post_id } = req.params;
     const { comment } = req.body;

     const saveComment = await Comments.create({ post_id, user, comment })
     return res.status(200).json({ success })
})
