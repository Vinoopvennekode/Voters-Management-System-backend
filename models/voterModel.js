import mongoose from "mongoose";

const voterSchema = new mongoose.Schema(
  {
    voterId: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    age: Number,
    gender: String,
    phone: String,
    address: String,
    ward: String,
    booth: String,
    partySupport: {
      type: String,
      enum: ["Our Party", "Opposition", "Neutral"],
      default: "Neutral"
    },
    canvassed: { type: Boolean, default: false },
    voted: { type: Boolean, default: false },
    remarks: String,
  },
  { timestamps: true }
);

const Voter = mongoose.model("Voter", voterSchema);
export default Voter;
