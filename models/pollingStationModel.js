import mongoose from "mongoose";

const pollingStationSchema = new mongoose.Schema(
  {
    wardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ward",
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

export default mongoose.model("PollingStation", pollingStationSchema);
