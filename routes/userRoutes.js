import express from "express";
import { createSuperAdmin,registerUser, loginUser, getCurrentUser,getAdmins,getUserById,updateUser,deleteUser } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", protect, registerUser);
router.post("/superadmin", createSuperAdmin);
router.get("/me", protect, getCurrentUser);
router.get("/admins", protect, getAdmins);
router.get("/:id", protect, getUserById);
router.put("/:id", protect, updateUser);
router.delete("/:id", protect, deleteUser);

export default router;


