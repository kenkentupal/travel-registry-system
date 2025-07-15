import express from "express";
import {
  fetchProfiles,
  updateUserMetadata,
  getCurrentUserProfile,
  fetchDriversByOrganization, // <-- import this
} from "../controllers/profileController.js";

const router = express.Router();

router.get("/", fetchProfiles);
router.get("/me", getCurrentUserProfile);
router.put("/update-metadata", updateUserMetadata);

router.get("/drivers/:orgId", fetchDriversByOrganization);

export default router;
