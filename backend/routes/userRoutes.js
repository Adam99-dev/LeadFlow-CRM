import express from "express";
import { register, login, logout, me } from "../controllers/user.js";
import { authenticate } from "../middleware/authentication.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, me);
router.post("/logout", authenticate, logout);

export default router;
