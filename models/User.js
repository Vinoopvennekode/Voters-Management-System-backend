import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["SuperAdmin", "Admin", "Volunteer"],
      default: "Admin",
    },
    districtId: { type: mongoose.Schema.Types.ObjectId, ref: "District" },
    localBodyId: { type: mongoose.Schema.Types.ObjectId, ref: "LocalBody" },
    wardId: { type: mongoose.Schema.Types.ObjectId, ref: "Ward" },
    pollingStationId: { type: mongoose.Schema.Types.ObjectId, ref: "PollingStation" },
    isBlocked:{ type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // who created this account
      default: null,
    },
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // who last modified it
      default: null,
    },

    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: null },
  },
  { versionKey: false }
);

// ✅ Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
