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
    const { name, mobile, password, localBodyId } = req.body;
    // 1️⃣ Check if SuperAdmin already exists for this ward
    const existingSuper = await User.findOne({ localBodyId, role: "SuperAdmin" });
    if (existingSuper) {
      return res.status(400).json({ success: false, message: "Super Admin already exists for this ward" });
    }

    // // 2️⃣ Fetch ward to get localBodyId
    // const ward = await Ward.findById(wardId);
    // if (!ward) {
    //   return res.status(404).json({ success: false, message: "Ward not found" });
    // }


    // 3️⃣ Fetch local body to get districtId
    const localBody = await LocalBody.findById(localBodyId);
    if (!localBody) {
      return res.status(404).json({ success: false, message: "Local Body not found" });
    }


    const superAdmin = new User({
      name, mobile, password, role: "SuperAdmin",
      localBodyId: localBody._id,
      districtId: localBody.districtId,
    });
    await superAdmin.save();

    res.status(201).json({
      success: true,
      message: "Super Admin created successfully",
      data: { id: superAdmin._id, name: superAdmin.name, mobile: superAdmin.mobile },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating Super Admin", error: error.message });
  }
};






export const registerUser = async (req, res) => {
  try {
    const { name, mobile, password, role, wardId: inputWardId } = req.body;

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

    // 🔸 Check duplicate mobile
    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // ============================================================
    // 🧭 DETERMINE wardId, localBodyId, and districtId
    // ============================================================
    let wardId = null;
    let localBodyId = null;
    let districtId = null;

    if (req.user.role === "SuperAdmin") {
      // SuperAdmin must select ward manually
      if (!inputWardId) {
        return res.status(400).json({ success: false, message: "Ward ID is required for SuperAdmin." });
      }

      const ward = await Ward.findById(inputWardId).populate("localBodyId");
      if (!ward) {
        return res.status(404).json({ success: false, message: "Ward not found." });
      }

      wardId = ward._id;
      localBodyId = ward.localBodyId?._id || null;
      districtId = ward.localBodyId?.districtId || null;
    } else if (req.user.role === "Admin") {
      // Admin automatically assigns same ward
      const admin = await User.findById(req.user._id).populate({
        path: "wardId",
        populate: { path: "localBodyId" },
      });

      if (!admin || !admin.wardId) {
        return res.status(400).json({ success: false, message: "Admin ward not found. Cannot assign Volunteer." });
      }

      wardId = admin.wardId._id;
      localBodyId = admin.wardId.localBodyId?._id || null;
      districtId = admin.wardId.localBodyId?.districtId || null;
    }

    // ============================================================
    // 🚫 RULE 1: Only one Admin per Ward (SuperAdmin restriction)
    // ============================================================
    if (req.user.role === "SuperAdmin" && role === "Admin") {
      const existingAdmin = await User.findOne({ wardId, role: "Admin", isDeleted: false });
      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: "An Admin already exists in this ward. Only one Admin per ward allowed.",
        });
      }
    }

    // ============================================================
    // 🚫 RULE 2: Admin can only create max 10 Volunteers in their ward
    // ============================================================
    if (req.user.role === "Admin" && role === "Volunteer") {
      const volunteerCount = await User.countDocuments({
        createdBy: req.user._id,
        role: "Volunteer",
        isDeleted: false,
      });

      if (volunteerCount >= 10) {
        return res.status(400).json({
          success: false,
          message: "You can only create up to 10 Volunteers in your ward.",
        });
      }
    }

    // ============================================================
    // ✅ Create new user
    // ============================================================
    const user = new User({
      name,
      mobile,
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
      message: `${role} created successfully.`,
      data: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        role: user.role,
        wardId: user.wardId,
        localBodyId: user.localBodyId,
        districtId: user.districtId,
        createdBy: req.user._id,
      },
    });
  } catch (error) {
    console.error("❌ Error registering user:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


// 🔹 Login User
export const loginUser = async (req, res) => {
  try {
    const { mobile, password } = req.body;
    console.log('mobile,password', mobile, password);

    const user = await User.findOne({ mobile });
    console.log('user', user);
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid username or password" });
    }


    const isMatch = await bcrypt.compare(password, user.password);
    console.log('isMatch', isMatch);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid username or password" });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
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
        mobile: req.user.mobile,
        role: req.user.role,
        districtId: req.user.districtId,
        localBodyId: req.user.localBodyId,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


export const getAdmins = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    let filter = {};

    // 🧠 Role-based filtering logic
    if (req.user.role === "SuperAdmin") {
      // Fetch all Admins + Volunteers in the same localBody
      filter = {
        localBodyId: req.user.localBodyId,
        role: { $in: ["Admin", "Volunteer"] },
        isActive: true, isDelete: false
      };
    } else if (req.user.role === "Admin") {
      // Fetch all Admins + Volunteers in that Admin’s ward
      filter = {
        wardId: req.user.wardId,
        role: { $in: ["Admin", "Volunteer"] },
      };
    } else {
      // Other roles are not authorized
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Fetch users based on filter
    const users = await User.find(filter)
      .select("_id name mobile role districtId localBodyId wardId")
      .lean();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Error in getAdmins:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    // Only SuperAdmin and Admin can fetch users
    if (!["SuperAdmin", "Admin"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const user = await User.findById(id)
      .select("-password") // Exclude password for security
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("Error in getUserById:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};



export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    console.log('req.body', req.body);

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }


    if (!["SuperAdmin", "Admin"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // 🔸 Check duplicate mobile only if mobile is provided
if (updates.mobile) {
  const existingUser = await User.findOne({
    mobile: updates.mobile,
    _id: { $ne: id },
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "Mobile number already exists",
    });
  }
}

    // Prevent updating restricted fields
    const restrictedFields = ["password", "_id", "createdAt"];
    restrictedFields.forEach((f) => delete updates[f]);

    updates.modifiedBy = req.user._id;
    updates.modifiedAt = new Date();

    console.log('updateUser', updates);

    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");
    console.log('updatedUserres', updatedUser);

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error in updateUser:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};



export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    if (!["SuperAdmin", "Admin"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      {
        isDelete: true,
        isActive: false,
        modifiedBy: req.user._id,
        modifiedAt: new Date(),
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully (soft delete)",
    });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
