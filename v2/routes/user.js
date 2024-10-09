import { Router } from "express";
import {
  getFollowings,
  getUserInfo,
  getOtherUserInfo,
  getFollowCount,
  updateProfilePic,
  deleteExistingProfilePic,
  updateProfile,
} from "../controllers/user.js";
import { upload } from "../config/fileUpload.js";
import { updateUserPassword } from "../controllers/auth.js";

const router = Router();

router.post("/updatePassword", updateUserPassword);
router.get("/profile", getUserInfo);
router.post("/profile/update", updateProfile);
router.get("/followCount/:user", getFollowCount);
router.get("/profile/:userId", getOtherUserInfo);
router.get("/followings", getFollowings);

router.post(
  "/picture",
  upload.single("file"),
  deleteExistingProfilePic,
  updateProfilePic
);

export default router;
