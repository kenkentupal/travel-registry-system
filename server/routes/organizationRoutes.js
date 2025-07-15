import express from "express";
import {
  getOrganizationById,
  createOrganization,
  deleteOrganization,
  updateOrganization,
  fetchOrganizations,
} from "../controllers/organizationController.js";

const router = express.Router();

router.get("/", fetchOrganizations);
router.post("/", createOrganization);
router.delete("/:id", deleteOrganization);
router.put("/:id", updateOrganization);
router.get("/:id", getOrganizationById);

export default router;
