import { Router } from "express";
import wrapAsync from "../utils/wrapAsync.js";
import { getAllDocs, uploadFile } from "../controllers/documentController.js";
import upload from "../utils/cloudinaryStorage.js"
import jwtAuth from "../middleware/jwtAuth.js";
const router = Router();

router.get("/", jwtAuth, wrapAsync(getAllDocs));
router.post("/upload", jwtAuth, upload.array('documents', 5), wrapAsync(uploadFile));

export default router;
