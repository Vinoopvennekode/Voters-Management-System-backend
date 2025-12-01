import express from "express";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✔ Token validation endpoint
router.get("/verify-token", protect, (req, res) => {
    console.log('verify-token"',req);
    
  res.json({ success: true, valid: true, user: req.user });
});

export default router;
