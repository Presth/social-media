import { Router } from "express";
import { createPost } from "../controllers/posts.js";
import { upload } from "../config/fileUpload.js";

const router = Router();

// file uploading config

router.post("/", upload.single("file"), createPost);
// router.post("/", upload.single("file"), uploadFile);
export default router;
