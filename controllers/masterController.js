import District from "../models/districtModel.js";

// Add new district
export const addDistrict = async (req, res) => {
  try {
    const { name, code, createdBy } = req.body;

    // Check if already exists
    const existing = await District.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: "District already exists" });
    }

    const district = new District({
      name,
      code,
      createdBy,
    });

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
