import express from "express";
import { addDistrict,addLocalBody ,addWard,addPollingSation} from "../controllers/masterController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only SuperAdmin can add districts
router.post("/district", protect, authorizeRoles("SuperAdmin"), addDistrict);
router.post("/localBody", protect, authorizeRoles("SuperAdmin"), addLocalBody);
router.post("/ward", protect, authorizeRoles("SuperAdmin"), addWard);
router.post("/pollingStation", protect, authorizeRoles("SuperAdmin"), addPollingSation);

export default router;
