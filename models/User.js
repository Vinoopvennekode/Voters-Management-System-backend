import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["SuperAdmin", "Admin", "Volunteer"],
      default: "Admin",
    },
    districtId: { type: mongoose.Schema.Types.ObjectId, ref: "District" },
    localBodyId: { type: mongoose.Schema.Types.ObjectId, ref: "LocalBody" },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: String },
    modifiedBy: { type: String },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: null },
  },
  { versionKey: false }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method for login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
