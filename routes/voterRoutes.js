import express from "express";
import {
  getVoters,
  createVoter,
  updateVoter,
  deleteVoter
} from "../controllers/voterController.js";

const router = express.Router();

router.route("/")
  .get(getVoters)
  .post(createVoter);

router.route("/:id")
  .put(updateVoter)
  .delete(deleteVoter);

export default router;
