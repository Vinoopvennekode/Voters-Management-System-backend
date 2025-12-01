import mongoose from "mongoose";

const wardSchema = new mongoose.Schema(
  {
    localBodyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LocalBody",
      required: true,
    },
    name: { type: String, required: true },
    code: { type: String },

    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
    createdBy: { type: String },
    modifiedBy: { type: String },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "modifiedAt" } }
);

export default mongoose.model("Ward", wardSchema);
