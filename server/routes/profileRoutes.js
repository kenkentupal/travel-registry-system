import express from "express";
import {
  fetchProfiles,
  updateUserMetadata,
} from "../controllers/profileController.js";

const router = express.Router();

router.get("/", fetchProfiles);
router.put("/update-metadata", updateUserMetadata);

export default router;
