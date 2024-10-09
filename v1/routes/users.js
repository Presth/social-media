import { Router } from "express";
import { getUsers } from "../controllers/users.js";
import { followUser } from "../controllers/follow.js";

const router = Router()
router.get('/', getUsers);
router.post('/:id/follow', followUser);

export default router;