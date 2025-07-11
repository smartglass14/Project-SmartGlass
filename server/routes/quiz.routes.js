import { Router } from "express";
import wrapAsync from "../utils/wrapAsync.js";
import jwtAuth from "../middleware/jwtAuth.js";
import accessControll from "../middleware/accessControll.js";
import { createQuiz, getQuizByCode, getQuizResult } from "../controllers/quizController.js";
const router = Router();

router.post("/create", jwtAuth, accessControll, wrapAsync(createQuiz));
router.get("/:code", wrapAsync(getQuizByCode))
router.get("/result/:code", jwtAuth, accessControll, wrapAsync(getQuizResult))

export default router;
