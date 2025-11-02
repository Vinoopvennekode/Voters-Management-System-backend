import mongoose from "mongoose";

const districtSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String },

    // Common fields
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: String },
    modifiedBy: { type: String },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "modifiedAt" } }
);

export default mongoose.model("District", districtSchema);
