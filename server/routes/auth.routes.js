import { Router } from "express";
import wrapAsync from "../utils/wrapAsync.js";
import { authenticate, addRole } from "../controllers/authController.js";
import jwtAuth from "../middleware/jwtAuth.js";
const router = Router();

router.post("/", wrapAsync(authenticate));
router.put("/role", jwtAuth, wrapAsync(addRole));

export default router;
