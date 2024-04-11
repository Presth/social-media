import { Router } from "express";
import { login, logout, createAccount } from "../controllers/auth.js";

const router = Router()
router.post("/login", login);
router.post("/logout", logout);
router.post("/create-account", createAccount);

export default router;