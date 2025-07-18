import { Router } from "express";
import wrapAsync from "../utils/wrapAsync.js";
import jwtAuth from "../middleware/jwtAuth.js";
import accessControll from "../middleware/accessControll.js";
import { 
  submitQuizResult, 
  getLeaderboard, 
  getSessionAnalytics
} from "../controllers/leaderboardController.js";

const router = Router();

router.post("/submit", jwtAuth, wrapAsync(submitQuizResult));

router.get("/:sessionCode", jwtAuth, wrapAsync(getLeaderboard));

router.get("/analytics/:sessionCode", jwtAuth, accessControll, wrapAsync(getSessionAnalytics));



export default router; 