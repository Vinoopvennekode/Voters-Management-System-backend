import Voter from "../models/voterModel.js";
import Ward from "../models/wardModel.js";
import Party from "../models/partyModel.js";
import PollingStation from "../models/pollingStationModel.js";
import multer from "multer";
import xlsx from "xlsx";
import mongoose from "mongoose";

const storage = multer.memoryStorage();
export const upload = multer({ storage });




export const getAllVoter = async (req, res) => {
  try {
    // Optional: receive filters from query
    const { wardId, pollingStationId } = req.query;

    let filter = {};

    if (wardId) filter.wardId = wardId;
    if (pollingStationId) filter.pollingStationId = pollingStationId;

    const voters = await Voter.find(filter).populate({
      path: "partySupport",
      select: "name color code", // 👈 Only return these fields from Party
    }).lean();

    return res.json({
      success: true,
      total: voters.length,
      data: voters
    });
  } catch (error) {
    console.error("Error fetching voters:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};














export const uploadVoters = async (req, res) => {
  try {
    const { wardId, pollingStationId } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No Excel file uploaded" });
    }

    if (!wardId || !pollingStationId) {
      return res.status(400).json({ success: false, message: "Ward and booth are required" });
    }

    const neutralParty = await Party.findOne({ name: "Neutral" });
    if (!neutralParty) {
      return res.status(404).json({ success: false, message: "Neutral party not found" });
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet);


    // 🧩 Find Ward and PollingStation Names
    const ward = await Ward.findById(wardId).select("name");
    const pollingStation = await PollingStation.findById(pollingStationId).select("name");

    const voters = rows.map((row) => ({
      serialNo: row["Serial No."],
      name: row["Name"] || "",
      guardianName: row["Guardian's Name"] || "",
      oldWardOrHouseNo: row["OldWard No/ House No."] || "",
      houseName: row["House Name"] || "",
      genderAge: row["Gender / Age"] || "",
      newSecIdNo: row["New SEC ID No."] || "",
      wardId,
      pollingStationId,
      uploadedBy: req.user?._id || null,
      partySupport: neutralParty._id, // 🟢 Assign Neutral Party by default 
    }));
    if (!voters.length) {
      return res.status(400).json({ success: false, message: "No valid voter data found in Excel file" });
    }

    await Voter.insertMany(voters);

    res.status(200).json({
      success: true,
      message: `${voters.length} voters uploaded successfully to Ward ${ward.name}, PollingStation ${pollingStation.name}`,
    });
  } catch (error) {
    console.error("❌ Error uploading voters:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}

// controllers/voterController.js
export const getVotersByLocation = async (req, res) => {
  try {
    const { wardId, pollingStationId, page = 1, limit = 10, search = "", genderAge = "", mode = "" } = req.query;

    if (!wardId || !pollingStationId) {
      return res.status(400).json({
        success: false,
        message: "wardId and pollingStationId are required",
      });
    }

    const query = {
      wardId, pollingStationId, isActive: true,
      isDelete: false
    };

    // 🔍 Search across multiple fields
    if (search && search.trim() !== "") {
      if (mode === "votingDay") {
        // 👉 Only serial number + name (Voting Day)
        query.$or = [
          {
            $expr: {
              $regexMatch: {
                input: { $toString: "$serialNo" },
                regex: search,
                options: "i"
              }
            }
          },
          { name: { $regex: search, $options: "i" } }
        ];
      } else {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { guardianName: { $regex: search, $options: "i" } },
          { genderAge: { $regex: search, $options: "i" } },
          { houseName: { $regex: search, $options: "i" } },
          { newSecIdNo: { $regex: search, $options: "i" } },
        ];
      }
    }

    // 🧭 Optional filter
    if (genderAge) query.genderAge = genderAge;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [voters, total, votedCount] = await Promise.all([
      Voter.find(query)
        .select("serialNo name guardianName oldWardOrHouseNo genderAge houseName newSecIdNo canvassed partySupport voted")
        .populate({
          path: "partySupport",
          select: "name color code", // 👈 Only return these fields from Party
        })
        .sort({ serialNo: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Voter.countDocuments(query),
      // ✅ Count of those who have voted
      Voter.countDocuments({ ...query, voted: true }),
    ]);

    res.status(200).json({
      success: true,
      data: voters,
      pagination: {
        total,
        votedCount,
        notVotedCount: total - votedCount,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching voters:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};




export const updateVotersBatch = async (req, res) => {
  try {
    const updates = req.body.updates; // Expect [{ id, party, canvassed }, ...]

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ success: false, message: "No updates provided" });
    }

    // 🔹 Prepare bulk write operations
    const bulkOps = updates.map(u => {
      const updateData = {};

      if (u.party) {
        // Since front end sends ObjectId directly, just assign it
        if (!mongoose.isValidObjectId(u.party)) {
          console.warn(`Invalid Party ID: ${u.party}`);
        } else {
          updateData.partySupport = new mongoose.Types.ObjectId(u.party);
        }
      }

      if (typeof u.canvassed === "boolean") {
        updateData.canvassed = u.canvassed;
      }

      return {
        updateOne: {
          filter: { _id: u.id },
          update: updateData,
        },
      };
    }).filter(op => Object.keys(op.updateOne.update).length > 0);

    if (bulkOps.length === 0) {
      return res.status(400).json({ success: false, message: "No valid updates found" });
    }

    // 🔸 Execute bulk updates
    await Voter.bulkWrite(bulkOps);

    res.status(200).json({
      success: true,
      message: "Voters updated successfully",
      updatedCount: bulkOps.length,
    });

  } catch (error) {
    console.error("Batch update error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating voters",
    });
  }
};



// PUT mark voted

export const markVoted = async (req, res) => {
  try {
    // Find voter by ID
    const voter = await Voter.findById(req.params.id);
    if (!voter) {
      return res.status(404).json({ success: false, message: "Voter not found" });
    }

    // Toggle voted status
    const updatedVoter = await Voter.findByIdAndUpdate(
      req.params.id,
      { voted: !voter.voted, modifiedAt: new Date() },
      { new: true }
    );

    // 3️⃣ Count how many voters have voted in the same polling station
    const votedCount = await Voter.countDocuments({
      pollingStationId: voter.pollingStationId,
      voted: true
    });

    return res.json({ success: true, data: updatedVoter, votedCount });
  } catch (err) {
    console.error("Error updating voter status:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};





// ==========================
// Get All Voters (active + non-deleted)
// ==========================
export const getAllVoters = async (req, res) => {
  try {
    const voters = await Voter.find({ isActive: true, isDelete: false })
      .populate("partySupport", "name color")
      .populate("wardId", "name")
      .populate("localBodyId", "name")
      .populate("districtId", "name")
      .populate("pollingStationId", "name")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      message: "Active voters fetched successfully",
      data: voters,
    });
  } catch (error) {
    console.error("Error fetching voters:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ==========================
// Get Voter by ID (active + non-deleted)
// ==========================
export const getVoterById = async (req, res) => {
  try {
    const { id } = req.params;

    const voter = await Voter.findOne({ _id: id, isActive: true, isDelete: false })
      .populate("partySupport", "name color")
      .populate("wardId", "name")
      .populate("localBodyId", "name")
      .populate("districtId", "name")
      .populate("pollingStationId", "name");

    if (!voter) {
      return res.status(404).json({ success: false, message: "Voter not found" });
    }

    res.status(200).json({
      success: true,
      message: "Voter fetched successfully",
      data: voter,
    });
  } catch (error) {
    console.error("Error fetching voter by ID:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ==========================
// Update Voter
// ==========================
export const updateVoter = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const voter = await Voter.findOne({ _id: id, isActive: true, isDelete: false });
    if (!voter) {
      return res.status(404).json({ success: false, message: "Voter not found" });
    }

    Object.assign(voter, updates, {
      modifiedBy: req.user?._id || "system",
      modifiedAt: new Date(),
    });

    await voter.save();

    res.status(200).json({
      success: true,
      message: "Voter updated successfully",
      data: voter,
    });
  } catch (error) {
    console.error("Error updating voter:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ==========================
// Delete Voter (Soft Delete)
// ==========================
export const deleteVoter = async (req, res) => {
  try {
    const { id } = req.params;

    const voter = await Voter.findById(id);
    if (!voter) {
      return res.status(404).json({ success: false, message: "Voter not found" });
    }

    voter.isActive = false;
    voter.isDelete = true;
    voter.modifiedBy = req.user?._id || "system";
    voter.modifiedAt = new Date();

    await voter.save();

    res.status(200).json({
      success: true,
      message: "Voter deleted successfully (soft delete)",
      data: voter,
    });
  } catch (error) {
    console.error("Error deleting voter:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
