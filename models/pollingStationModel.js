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
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
    createdBy: { type: String },
    modifiedBy: { type: String },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "modifiedAt" } }
);

export default mongoose.model("PollingStation", pollingStationSchema);
