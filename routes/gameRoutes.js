import express from "express";
import { auth } from "../middleware/auth.js";
import {
  makeMove,
  getLeaderboard,
  requestRematch,
  acceptRematch,
} from "../controllers/gameController.js";

const router = express.Router();

router.post("/move", auth, makeMove);
router.get("/leaderboard", getLeaderboard);
router.post("/request-rematch", auth, requestRematch);
router.post("/accept-rematch", auth, acceptRematch);

export default router;
