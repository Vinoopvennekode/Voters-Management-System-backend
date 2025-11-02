import Voter from "../models/voterModel.js";

// Get all voters
export const getVoters = async (req, res) => {
  const voters = await Voter.find();
  res.json(voters);
};

// Add new voter
export const createVoter = async (req, res) => {
  const voter = await Voter.create(req.body);
  res.status(201).json(voter);
};

// Update voter (e.g., mark voted or canvassed)
export const updateVoter = async (req, res) => {
  const voter = await Voter.findById(req.params.id);
  if (!voter) return res.status(404).json({ message: "Voter not found" });

  Object.assign(voter, req.body);
  await voter.save();
  res.json(voter);
};

// Delete voter
export const deleteVoter = async (req, res) => {
  const voter = await Voter.findById(req.params.id);
  if (!voter) return res.status(404).json({ message: "Voter not found" });

  await voter.deleteOne();
  res.json({ message: "Voter removed" });
};
