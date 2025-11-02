import express from "express";
import { createSuperAdmin,registerUser, loginUser, getCurrentUser } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", protect, registerUser);
router.post("/superadmin", createSuperAdmin);
router.get("/me", protect, getCurrentUser);

export default router;
