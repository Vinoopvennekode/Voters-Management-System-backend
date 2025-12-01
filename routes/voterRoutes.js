import express from "express";
import { upload, uploadVoters } from "../controllers/voterController.js";
import {
  updateVoter,
  deleteVoter,
  getVotersByLocation, updateVotersBatch, markVoted,getAllVoters,getVoterById,getAllVoter

} from "../controllers/voterController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";


const router = express.Router();

router.post("/upload", protect, authorizeRoles("SuperAdmin"), upload.single("file"), uploadVoters);
router.get("/by-location", protect, getVotersByLocation);
router.patch("/batch-update", protect, updateVotersBatch)
router.patch("/:id/mark-voted", protect, markVoted)

router.get("/voters", getAllVoter);






  // GET all active + non-deleted voters
router.get("/", protect, authorizeRoles("Admin", "SuperAdmin"), getAllVoters);

// GET voter by ID
router.get("/:id", protect, authorizeRoles("Admin", "SuperAdmin"), getVoterById);

// UPDATE voter
router.put("/:id", protect, authorizeRoles("Admin", "SuperAdmin"), updateVoter);

// DELETE voter (soft delete)
router.delete("/:id", protect, authorizeRoles("Admin", "SuperAdmin"), deleteVoter);

export default router;
