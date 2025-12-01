import District from "../models/districtModel.js";
import LocalBody from "../models/localBodyModel.js";
import Ward from "../models/wardModel.js";
import PollingStation from "../models/pollingStationModel.js";
import Party from "../models/partyModel.js";

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
      createdBy: req.user._id, // from logged-in user
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

export const addParty = async (req, res) => {
  try {

    const { name, code, color } = req.body;

    console.log(name, code);
    // Check if already exists
    const existing = await Party.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: "Party already exists" });
    }

    const party = new Party({
      name,
      code,
      color,
      createdBy: req.user._id, // from logged-in user
    });

    console.log(party);

    await party.save();

    res.status(201).json({
      success: true,
      message: "party added successfully",
      data: party,
    });
  } catch (error) {
    console.error("Error adding party:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};



export const addLocalBody = async (req, res) => {
  try {

    const { name, code, districtId } = req.body;

    // Check if already exists
    const existing = await LocalBody.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: "localBody already exists" });
    }

    const localBody = new LocalBody({
      name,
      code,
      districtId: districtId,
      createdBy: req.user._id, // from logged-in user
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

    const { name, code,localBodyId } = req.body;

    // Check if already exists
    const existing = await Ward.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: "ward already exists" });
    }

    const ward = new Ward({
      name,
      code,
      localBodyId: localBodyId,
      createdBy: req.user._id, // from logged-in user
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
    console.log(req.user);

    const { name, code, wardId } = req.body;

    // Check if already exists
    const existing = await PollingStation.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: "pollingStation already exists" });
    }

    const pollingStation = new PollingStation({
      name,
      code,
      wardId: wardId,
      createdBy: req.user._id, // from logged-in user
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


// ==========================
// Update District
// ==========================
export const updateDistrict = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;

    const existing = await District.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "District not found" });
    }

    // Optional: Check for name duplication
    const duplicate = await District.findOne({ name, _id: { $ne: id } });
    if (duplicate) {
      return res.status(400).json({ success: false, message: "District name already exists" });
    }

    existing.name = name || existing.name;
    existing.code = code || existing.code;
    existing.modifiedBy = req.user._id;
    existing.modifiedAt = Date.now()

    await existing.save();

    res.status(200).json({
      success: true,
      message: "District updated successfully",
      data: existing,
    });
  } catch (error) {
    console.error("Error updating district:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ==========================
// Update Local Body
// ==========================
export const updateLocalBody = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, districtId } = req.body;

    const existing = await LocalBody.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Local Body not found" });
    }

    const duplicate = await LocalBody.findOne({ name, _id: { $ne: id } });
    if (duplicate) {
      return res.status(400).json({ success: false, message: "Local Body name already exists" });
    }

    existing.name = name || existing.name;
    existing.code = code || existing.code;
    existing.districtId = districtId || existing.districtId;
    existing.modifiedBy = req.user._id;
    existing.modifiedAt = Date.now()

    await existing.save();

    res.status(200).json({
      success: true,
      message: "Local Body updated successfully",
      data: existing,
    });
  } catch (error) {
    console.error("Error updating LocalBody:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ==========================
// Update Ward
// ==========================
export const updateWard = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, localBodyId } = req.body;

    const existing = await Ward.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Ward not found" });
    }

    const duplicate = await Ward.findOne({ name, _id: { $ne: id } });
    if (duplicate) {
      return res.status(400).json({ success: false, message: "Ward name already exists" });
    }

    existing.name = name || existing.name;
    existing.code = code || existing.code;
    existing.localBodyId = localBodyId || existing.localBodyId;
    existing.modifiedBy = req.user._id;
    existing.modifiedAt = Date.now()

    await existing.save();

    res.status(200).json({
      success: true,
      message: "Ward updated successfully",
      data: existing,
    });
  } catch (error) {
    console.error("Error updating ward:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ==========================
// Update Polling Station
// ==========================
export const updatePollingStation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, wardId } = req.body;

    const existing = await PollingStation.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Polling Station not found" });
    }

    const duplicate = await PollingStation.findOne({ name, _id: { $ne: id } });
    if (duplicate) {
      return res.status(400).json({ success: false, message: "Polling Station name already exists" });
    }

    existing.name = name || existing.name;
    existing.code = code || existing.code;
    existing.wardId = wardId || existing.wardId;
    existing.modifiedBy = req.user._id;
    existing.modifiedAt = Date.now()

    await existing.save();

    res.status(200).json({
      success: true,
      message: "Polling Station updated successfully",
      data: existing,
    });
  } catch (error) {
    console.error("Error updating polling station:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ==========================
// Update Party
// ==========================
export const updateParty = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, color } = req.body;

    const existing = await Party.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Party not found" });
    }

    const duplicate = await Party.findOne({ name, _id: { $ne: id } });
    if (duplicate) {
      return res.status(400).json({ success: false, message: "Party name already exists" });
    }

    existing.name = name || existing.name;
    existing.code = code || existing.code;
    existing.color = color || existing.color;
    existing.modifiedBy = req.user._id;
    existing.modifiedAt = Date.now()

    await existing.save();

    res.status(200).json({
      success: true,
      message: "Party updated successfully",
      data: existing,
    });
  } catch (error) {
    console.error("Error updating party:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};




// ==========================
// Delete District (Soft Delete)
// ==========================
export const deleteDistrict = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await District.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "District not found" });
    }

    existing.isActive = false;
    existing.isDelete = true;
    existing.modifiedBy = req.user._id;
    existing.modifiedAt = Date.now()

    await existing.save();

    res.status(200).json({
      success: true,
      message: "District deleted successfully",
      data: existing,
    });
  } catch (error) {
    console.error("Error deleting district:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ==========================
// Delete Local Body (Soft Delete)
// ==========================
export const deleteLocalBody = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await LocalBody.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Local Body not found" });
    }

    existing.isActive = false;
    existing.isDelete = true;
    existing.modifiedBy = req.user._id;
    existing.modifiedAt = Date.now()

    await existing.save();

    res.status(200).json({
      success: true,
      message: "Local Body deleted successfully",
      data: existing,
    });
  } catch (error) {
    console.error("Error deleting local body:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ==========================
// Delete Ward (Soft Delete)
// ==========================
export const deleteWard = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await Ward.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Ward not found" });
    }

    existing.isActive = false;
    existing.isDelete = true;
    existing.modifiedBy = req.user._id;
    existing.modifiedAt = Date.now()

    await existing.save();

    res.status(200).json({
      success: true,
      message: "Ward deleted successfully",
      data: existing,
    });
  } catch (error) {
    console.error("Error deleting ward:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ==========================
// Delete Polling Station (Soft Delete)
// ==========================
export const deletePollingStation = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await PollingStation.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Polling Station not found" });
    }

    existing.isActive = false;
    existing.isDelete = true;
    existing.modifiedBy = req.user._id;
    existing.modifiedAt = Date.now()

    await existing.save();

    res.status(200).json({
      success: true,
      message: "Polling Station deleted successfully",
      data: existing,
    });
  } catch (error) {
    console.error("Error deleting polling station:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ==========================
// Delete Party (Soft Delete)
// ==========================
export const deleteParty = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await Party.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Party not found" });
    }

    existing.isActive = false;
    existing.isDelete = true;
    existing.modifiedBy = req.user._id;
    existing.modifiedAt = Date.now()

    await existing.save();

    res.status(200).json({
      success: true,
      message: "Party deleted successfully",
      data: existing,
    });
  } catch (error) {
    console.error("Error deleting party:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};












// 🔹 Get Current Logged-In User
export const getWards = async (req, res) => {
  console.log('req.userreq.userreq.user', req.user);

  try {
    // 1. Authorization check remains the same
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    // 2. Fetch wards and populate 'localBodyId'
    // We populate 'localBodyId' and select its 'name' and 'districtId'.
    // Then, we populate 'districtId' inside 'localBodyId' and select its 'name'.
    const wards = await Ward.find({
      // localBodyId: req.user.localBodyId,
      isActive: true,
      isDelete: false
    })
      .populate({
        path: 'localBodyId', // Populates the LocalBody document
        select: 'name districtId', // Select LocalBody's name and its districtId
        populate: {
          path: 'districtId', // Populates the District document inside LocalBody
          select: 'name' // Select District's name
        }
      });

    console.log('earasifjiasfdm', wards);


    // 3. Optional: Transform the data for a cleaner response
    const transformedWards = wards.map(ward => ({
      _id: ward._id,
      name: ward.name,
      code: ward.code,
      isActive: ward.isActive,
      isDeleted: ward.isDeleted,
      // Accessing populated fields:
      localBodyName: ward.localBodyId.name,
      districtName: ward.localBodyId.districtId.name,
      localBodyId: ward.localBodyId._id, // Keep the IDs if needed
      districtId: ward.localBodyId.districtId._id,
    }));

    // 4. Send the successful response
    res.status(200).json({
      success: true,
      data: transformedWards,
    });
  } catch (error) {
    console.error("Error fetching wards:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// 🔹 Get Current Logged-In User
export const getParties = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const party = await Party.find({
      isActive: true,
      isDelete: false
    });


    res.status(200).json({
      success: true,
      data: party,
    });


  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getDistricts = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const district = await District.find({
      isActive: true,
      isDelete: false
    });


    res.status(200).json({
      success: true,
      data: district,
    });


  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getLocalbodies = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    // Use .find() to get all documents, and then use .populate()
    const localbodiesWithDistrict = await LocalBody.find({
      isActive: true,
      isDelete: false
    })
      .populate({
        path: 'districtId', // The field in the LocalBody schema that references District
        select: 'name' // Only fetch the 'name' field from the District document
      });

    // --- Data Transformation (Optional but Recommended) ---
    // Flatten the data structure to bring the district name to the top level.
    const transformedLocalbodies = localbodiesWithDistrict.map(lb => ({
      _id: lb._id,
      name: lb.name,
      code: lb.code,
      isActive: lb.isActive,
      isDeleted: lb.isDeleted,
      // Access the populated district name
      district: lb.districtId ? lb.districtId.name : null,
      districtId: lb.districtId ? lb.districtId._id : null,
      // Include other fields if needed
    }));

    res.status(200).json({
      success: true,
      data: transformedLocalbodies,
    });


  } catch (error) {
    console.error("Error fetching local bodies:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// 🔹 Get Current Logged-In User
export const getPollingStation = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const { wardId, mode } = req.query;
    // Set up the query filter
    const filter = {};

    if (mode == "byward" && wardId) {
      filter.wardId = wardId;
    }
    filter.isActive = true;
    filter.isDelete = false
    // If you need to filter by the logged-in user's scope (e.g., if req.user has a localBodyId),
    // you would need to adjust the filter and potentially the population logic. 
    // For now, we rely on the wardId query or fetch all within the user's scope if no wardId is provided.

    // --- Population Logic ---
    const pollingStations = await PollingStation.find(filter)
      .populate({
        path: 'wardId', // 1. Populates the Ward document
        select: 'name localBodyId', // Select Ward's name and its localBodyId
        populate: {
          path: 'localBodyId', // 2. Populates the LocalBody document inside Ward
          select: 'name districtId', // Select LocalBody's name and its districtId
          populate: {
            path: 'districtId', // 3. Populates the District document inside LocalBody
            select: 'name' // Select District's name
          }
        }
      });

    // --- Data Transformation (Optional but Recommended for clean response) ---
    const transformedPollingStations = pollingStations.map(station => ({
      _id: station._id,
      name: station.name,
      code: station.code,
      isActive: station.isActive,
      // Extracted names from nested populated fields
      ward: station.wardId ? station.wardId.name : null,
      localBody: station.wardId && station.wardId.localBodyId ? station.wardId.localBodyId.name : null,
      district: station.wardId && station.wardId.localBodyId && station.wardId.localBodyId.districtId ? station.wardId.localBodyId.districtId.name : null,

      // Keeping IDs for reference (optional)
      wardId: station.wardId ? station.wardId._id : null,
      localBodyId: station.wardId && station.wardId.localBodyId ? station.wardId.localBodyId._id : null,
      districtId: station.wardId && station.wardId.localBodyId && station.wardId.localBodyId.districtId ? station.wardId.localBodyId.districtId._id : null,
    }));


    res.status(200).json({
      success: true,
      data: transformedPollingStations,
    });


  } catch (error) {
    console.error("Error fetching polling stations:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ==========================
// Get District by ID
// ==========================
export const getDistrictById = async (req, res) => {
  try {
    const { id } = req.params;

    const district = await District.findOne({ _id: id, isActive: true, isDelete: false });
    if (!district) {
      return res.status(404).json({ success: false, message: "District not found" });
    }

    res.status(200).json({
      success: true,
      message: "District fetched successfully",
      data: district,
    });
  } catch (error) {
    console.error("Error fetching district by ID:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};



// ==========================
// Get Local Body by ID
// ==========================
export const getLocalBodyById = async (req, res) => {
  try {
    const { id } = req.params;

    const localBody = await LocalBody.findOne({ _id: id, isActive: true, isDelete: false })

    if (!localBody) {
      return res.status(404).json({ success: false, message: "Local Body not found" });
    }

    res.status(200).json({
      success: true,
      message: "Local Body fetched successfully",
      data: localBody,
    });
  } catch (error) {
    console.error("Error fetching local body by ID:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


// ==========================
// Get Ward by ID
// ==========================
export const getWardById = async (req, res) => {
  try {
    const { id } = req.params;

    const ward = await Ward.findOne({ _id: id, isActive: true, isDelete: false })
      .populate({
        path: "localBodyId",
        select: "_id districtId",
        populate: { path: "districtId", select: "_id" },
      })
      .lean(); // 🧠 Make it plain JS object (not Mongoose doc)

    if (!ward) {
      return res.status(404).json({ success: false, message: "Ward not found" });
    }

    // 🧩 Flatten and extract only IDs
    const formattedWard = {
      _id: ward._id,
      localBodyId: ward.localBodyId?._id || null,
      districtId: ward.localBodyId?.districtId?._id || null,
      name: ward.name,
      code: ward.code,
      isActive: ward.isActive,
      isDelete: ward.isDelete,
      createdBy: ward.createdBy,
      createdAt: ward.createdAt,
      modifiedAt: ward.modifiedAt,
      __v: ward.__v || 0,
    };

    res.status(200).json({
      success: true,
      message: "Ward fetched successfully",
      data: formattedWard,
    });
  } catch (error) {
    console.error("Error fetching ward by ID:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};




// ==========================
// Get Polling Station by ID
// ==========================
export const getPollingStationById = async (req, res) => {
  try {
    const { id } = req.params;

    // 🧠 Populate Ward → LocalBody → District
    const pollingStation = await PollingStation.findOne({
      _id: id,
      isActive: true,
      isDelete: false,
    })
      .populate({
        path: "wardId",
        select: "name localBodyId",
        populate: {
          path: "localBodyId",
          select: "name districtId",
          populate: { path: "districtId", select: "name" },
        },
      })
      .lean();

    if (!pollingStation) {
      return res.status(404).json({ success: false, message: "Polling Station not found" });
    }

    // 🧩 Flatten the response
    const formattedStation = {
      _id: pollingStation._id,
      name: pollingStation.name,
      code: pollingStation.code,
      isActive: pollingStation.isActive,
      isDelete: pollingStation.isDelete,
      createdBy: pollingStation.createdBy,
      createdAt: pollingStation.createdAt,
      modifiedAt: pollingStation.modifiedAt,
      __v: pollingStation.__v || 0,
      // 👇 Extract related IDs
      wardId: pollingStation.wardId?._id || null,
      localBodyId: pollingStation.wardId?.localBodyId?._id || null,
      districtId: pollingStation.wardId?.localBodyId?.districtId?._id || null,
    };

    res.status(200).json({
      success: true,
      message: "Polling Station fetched successfully",
      data: formattedStation,
    });
  } catch (error) {
    console.error("Error fetching polling station by ID:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};



// ==========================
// Get Party by ID
// ==========================
export const getPartyById = async (req, res) => {
  try {
    const { id } = req.params;

    const party = await Party.findOne({ _id: id, isActive: true, isDelete: false });
    if (!party) {
      return res.status(404).json({ success: false, message: "Party not found" });
    }

    res.status(200).json({
      success: true,
      message: "Party fetched successfully",
      data: party,
    });
  } catch (error) {
    console.error("Error fetching party by ID:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};