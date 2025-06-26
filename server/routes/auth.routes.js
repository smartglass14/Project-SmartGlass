import { Router } from "express";
import wrapAsync from "../utils/wrapAsync.js";
import { authenticate } from "../controllers/authController.js";
const router = Router();

router.post("/", wrapAsync(authenticate));

export default router;
