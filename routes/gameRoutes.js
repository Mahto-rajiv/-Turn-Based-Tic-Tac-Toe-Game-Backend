import express from "express";
import { auth } from "../middleware/auth.js";
import { makeMove, getLeaderboard } from "../controllers/gameController.js";

const router = express.Router();

router.post("/move", auth, makeMove);
router.get("/leaderboard", getLeaderboard);

export default router;
