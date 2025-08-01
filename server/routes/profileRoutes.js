import express from "express";
import {
  fetchProfiles,
  updateUserMetadata,
  getCurrentUserProfile,
  fetchDriversByOrganization,
  updateAvatar,
} from "../controllers/profileController.js";

const router = express.Router();

router.get("/", fetchProfiles);
router.get("/me", getCurrentUserProfile);
router.post("/update-metadata", updateUserMetadata); // <-- add this
router.put("/avatar", updateAvatar);

router.get("/drivers/:orgId", fetchDriversByOrganization);

export default router;
