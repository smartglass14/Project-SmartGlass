import { Router } from "express";
import wrapAsync from "../utils/wrapAsync.js";
import jwtAuth from "../middleware/jwtAuth.js";
import accessControll from "../middleware/accessControll.js";
import { createQuiz, getQuizByCode } from "../controllers/quizController.js";
const router = Router();

router.post("/create", jwtAuth, accessControll, wrapAsync(createQuiz));
router.get("/:code", wrapAsync(getQuizByCode))

export default router;
