import express from "express";
import wrapAsync from "../utils/wrapAsync.js";
import jwtAuth from "../middleware/jwtAuth.js";
import { uploadAndSummarize } from "../controllers/summaryController.js";
const router = express.Router();

router.post('/', jwtAuth, wrapAsync(uploadAndSummarize));

export default router;