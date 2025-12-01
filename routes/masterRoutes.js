import express from "express";
import {
    addDistrict, addLocalBody, addWard, addPollingSation, getWards, getPollingStation, getLocalbodies, getParties, addParty, getDistricts
    , updateDistrict, updateLocalBody, updateWard, updatePollingStation, updateParty,
    deleteDistrict, deleteLocalBody, deleteWard, deletePollingStation, deleteParty,
    getDistrictById, getWardById, getLocalBodyById, getPartyById, getPollingStationById


} from "../controllers/masterController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only SuperAdmin can add districts
router.post("/district", protect, authorizeRoles("SuperAdmin"), addDistrict);
router.post("/localBody", protect, authorizeRoles("SuperAdmin"), addLocalBody);
router.post("/ward", protect, authorizeRoles("SuperAdmin"), addWard);
router.post("/pollingStation", protect, authorizeRoles("SuperAdmin","Admin"), addPollingSation);
router.post("/party", protect, addParty);

router.put("/district/:id", protect, authorizeRoles("SuperAdmin"), updateDistrict);
router.put("/localBody/:id", protect, authorizeRoles("SuperAdmin","Adminn"), updateLocalBody);
router.put("/ward/:id", protect, authorizeRoles("SuperAdmin","Admin"), updateWard);
router.put("/pollingStation/:id", protect, authorizeRoles("SuperAdmin","Admin"), updatePollingStation);
router.put("/party/:id", protect, authorizeRoles("SuperAdmin", "Admin"), updateParty);


router.delete("/district/:id", protect, authorizeRoles("SuperAdmin","Admin"), deleteDistrict);
router.delete("/localBody/:id", protect, authorizeRoles("SuperAdmin","Admin"), deleteLocalBody);
router.delete("/ward/:id", protect, authorizeRoles("SuperAdmin","Admin"), deleteWard);
router.delete("/pollingStation/:id", protect, authorizeRoles("SuperAdmin","Admin"), deletePollingStation);
router.delete("/party/:id", protect, authorizeRoles("SuperAdmin", "Admin"), deleteParty);


router.get("/wards", protect, getWards);
router.get("/districts", protect, getDistricts);
router.get("/localBodies", protect, getLocalbodies);
router.get("/parties", protect, getParties);
router.get("/pollingStations", protect, getPollingStation);

// Get By ID
router.get("/district/:id", protect, authorizeRoles("SuperAdmin", "Admin"), getDistrictById);
router.get("/localBody/:id", protect, authorizeRoles("SuperAdmin", "Admin"), getLocalBodyById);
router.get("/ward/:id", protect, authorizeRoles("SuperAdmin", "Admin"), getWardById);
router.get("/pollingStation/:id", protect, authorizeRoles("SuperAdmin", "Admin"), getPollingStationById);
router.get("/party/:id", protect, authorizeRoles("SuperAdmin", "Admin"), getPartyById);


export default router;
