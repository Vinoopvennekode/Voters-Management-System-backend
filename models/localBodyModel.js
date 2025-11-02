import mongoose from "mongoose";

const localBodySchema = new mongoose.Schema(
  {
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "District",
      required: true,
    },
    name: { type: String, required: true },
    code: { type: String },

    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: String },
    modifiedBy: { type: String },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "modifiedAt" } }
);

export default mongoose.model("LocalBody", localBodySchema);
