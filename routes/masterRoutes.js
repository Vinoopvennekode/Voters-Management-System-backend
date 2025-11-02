import express from "express";
import { addDistrict } from "../controllers/masterController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only SuperAdmin can add districts
router.post("/district", protect, authorizeRoles("SuperAdmin"), addDistrict);

export default router;
