import { Router } from "express";
import wrapAsync from "../utils/wrapAsync.js";
import jwtAuth from "../middleware/jwtAuth.js";
import accessControll from "../middleware/accessControll.js";
import { createPoll, getPollByCode, getPollResult } from "../controllers/pollController.js";
const router = Router();

router.post("/create", jwtAuth, accessControll, wrapAsync(createPoll));
router.get("/:code", wrapAsync(getPollByCode))
router.get("/result/:code", jwtAuth, accessControll, wrapAsync(getPollResult))

export default router;
