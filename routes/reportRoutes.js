import express from "express";
import { getVotingSummary, getDashboardSummary } from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


router.get("/votingSummary", protect, getVotingSummary);
router.get("/votingSummarytest",protect, getDashboardSummary);




export default router;
