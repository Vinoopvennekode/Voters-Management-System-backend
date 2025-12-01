import mongoose from "mongoose";

const voterSchema = new mongoose.Schema(
  {
    serialNo: { type: Number, trim: true },
    name: { type: String, required: true, trim: true },
    guardianName: { type: String, trim: true },
    oldWardOrHouseNo: { type: String, trim: true },
    houseName: { type: String, trim: true },
    genderAge: { type: String, trim: true }, // Combined "Gender / Age"
    newSecIdNo: { type: String, trim: true },
    partySupport:{ type: mongoose.Schema.Types.ObjectId, ref: "Party", required: true },
    // 🔗 Relations (important for your ward-based access control)
    wardId: { type: mongoose.Schema.Types.ObjectId, ref: "Ward", required: true },
    localBodyId: { type: mongoose.Schema.Types.ObjectId, ref: "LocalBody" },
    districtId: { type: mongoose.Schema.Types.ObjectId, ref: "District" },
    pollingStationId: { type: mongoose.Schema.Types.ObjectId, ref: "PollingStation" },
    canvassed: { type: Boolean, default: false },
    voted: { type: Boolean, default: false },
    remarks: String,
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: null },
    createdBy: { type: String },
    modifiedBy: { type: String }
  },
  { timestamps: true }
);

const Voter = mongoose.model("Voter", voterSchema);
export default Voter;
