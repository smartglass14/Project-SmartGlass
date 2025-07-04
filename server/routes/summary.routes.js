import express from "express";
import axios from "axios";
import wrapAsync from "../utils/wrapAsync.js";
import jwtAuth from "../middleware/jwtAuth";
import { generateSummary } from "../controllers/summaryController.js";
const router = express.Router();

router.get('/', jwtAuth, wrapAsync(generateSummary));
