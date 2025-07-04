import { Router } from "express";
import wrapAsync from "../utils/wrapAsync.js";
import { uploadFile } from "../controllers/uploadController.js";
import upload from "../utils/cloudinaryStorage.js"
import jwtAuth from "../middleware/jwtAuth.js";
const router = Router();

router.post("/", jwtAuth, upload.array('documents', 5), wrapAsync(uploadFile))

export default router;
