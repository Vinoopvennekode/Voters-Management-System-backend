import User from "../models/User.js";
import LocalBody from "../models/localBodyModel.js";
import Ward from "../models/wardModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// 🔹 Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "1d",
  });
};


// ✅ Create Super Admin (only once)
export const createSuperAdmin = async (req, res) => {
  try {
    const { name, email, password, wardId } = req.body;
    // 1️⃣ Check if SuperAdmin already exists for this ward
    const existingSuper = await User.findOne({ wardId, role: "SuperAdmin" });
    if (existingSuper) {
      return res.status(400).json({ success: false, message: "Super Admin already exists for this ward" });
    }

    // 2️⃣ Fetch ward to get localBodyId
    const ward = await Ward.findById(wardId);
    if (!ward) {
      return res.status(404).json({ success: false, message: "Ward not found" });
    }


    // 3️⃣ Fetch local body to get districtId
    const localBody = await LocalBody.findById(ward.localBodyId);
    if (!localBody) {
      return res.status(404).json({ success: false, message: "Local Body not found" });
    }


    const superAdmin = new User({
      name, email, password, role: "SuperAdmin",
      wardId: ward._id,
      localBodyId: localBody._id,
      districtId: localBody.districtId,
    });
    await superAdmin.save();

    res.status(201).json({
      success: true,
      message: "Super Admin created successfully",
      data: { id: superAdmin._id, name: superAdmin.name, email: superAdmin.email },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating Super Admin", error: error.message });
  }
};














// 🔹 Register User
export const registerUser = async (req, res) => {
  try {
     const { name, email, password, role, wardId } = req.body;

    // 🔸 Check authentication
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized. Token missing or invalid." });
    }

    // 🔸 Role-based restriction
    if (req.user.role === "Admin" && role !== "Volunteer") {
      return res.status(403).json({ success: false, message: "Admins can only create Volunteers." });
    }

    if (!["SuperAdmin", "Admin"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access denied. Only SuperAdmin/Admin can create users." });
    }

    // 🔸 Check duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // 🔸 If SuperAdmin → derive districtId & localBodyId from wardId
    let districtId = null;
    let localBodyId = null;

    if (wardId) {
      const ward = await Ward.findById(wardId).populate("localBodyId");
      if (!ward) {
        return res.status(404).json({ success: false, message: "Ward not found" });
      }

      localBodyId = ward.localBodyId?._id || null;
      districtId = ward.localBodyId?.districtId || null;
    }

    // 🔸 Create new user
    const user = new User({
      name,
      email,
      password,
      role,
      wardId,
      localBodyId,
      districtId,
      createdBy: req.user._id,
    });

    await user.save();

     res.status(201).json({
      success: true,
      message: `${role} created successfully`,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        wardId: user.wardId,
        localBodyId: user.localBodyId,
        districtId: user.districtId,
        createdBy: req.user._id,
      },
    });
  } catch (error) {
    console.error("❌ Error registering user:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// 🔹 Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, isDeleted: false });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Error logging in:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// 🔹 Get Current Logged-In User
export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    res.status(200).json({
      success: true,
      data: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        districtId: req.user.districtId,
        localBodyId: req.user.localBodyId,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
