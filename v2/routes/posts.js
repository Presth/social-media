import { Router } from "express";
import {
  createPost,
  getMyPost,
  getFollowerPosts,
  likePost,
  commentPost,
  singlePost,
  getCommentsOfPost,
} from "../controllers/posts.js";

const router = Router();

router.get("/", getMyPost);
router.get("/others", getFollowerPosts);
router.post("/", createPost);
router.get("/:post_id", singlePost);
router.post("/:post_id/like", likePost);
router.post("/:post_id/comment", commentPost);
router.get("/:post_id/comments", getCommentsOfPost);

export default router;
