import District from "../models/districtModel.js";
import LocalBody from "../models/localBodyModel.js";
import Ward from "../models/wardModel.js";
import PollingStation from "../models/pollingStationModel.js";

// Add new district
export const addDistrict = async (req, res) => {
  try {
    
    const { name, code } = req.body;

    // Check if already exists
    const existing = await District.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: "District already exists" });
    }

    const district = new District({
      name,
      code,
      createdBy:req.user._id, // from logged-in user
    });

    console.log(district);
    
    await district.save();

    res.status(201).json({
      success: true,
      message: "District added successfully",
      data: district,
    });
  } catch (error) {
    console.error("Error adding district:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};



export const addLocalBody = async (req, res) => {
  try {
    
    const { name, code ,districtId} = req.body;

    // Check if already exists
    const existing = await LocalBody.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: "localBody already exists" });
    }

    const localBody = new LocalBody({
      name,
      code,
      districtId,
      createdBy:req.user._id, // from logged-in user
    });

    
    await localBody.save();

    res.status(201).json({
      success: true,
      message: "localBody added successfully",
      data: localBody,
    });
  } catch (error) {
    console.error("Error adding localBody:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};



export const addWard = async (req, res) => {
  try {
    
    const { name, code ,localBodyId} = req.body;

    // Check if already exists
    const existing = await Ward.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: "ward already exists" });
    }

    const ward = new Ward({
      name,
      code,
      localBodyId,
      createdBy:req.user._id, // from logged-in user
    });

    
    await ward.save();

    res.status(201).json({
      success: true,
      message: "ward added successfully",
      data: ward,
    });
  } catch (error) {
    console.error("Error adding ward:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


export const addPollingSation = async (req, res) => {
  try {
    
    const { name, code ,wardId} = req.body;

    // Check if already exists
    const existing = await PollingStation.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: "pollingStation already exists" });
    }

    const pollingStation = new PollingStation({
      name,
      code,
      wardId,
      createdBy:req.user._id, // from logged-in user
    });

    
    await pollingStation.save();

    res.status(201).json({
      success: true,
      message: "pollingStation added successfully",
      data: pollingStation,
    });
  } catch (error) {
    console.error("Error adding pollingStation:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};