import express from "express";
import {
  fetchOrganizations,
  createOrganization,
  deleteOrganization,
  updateOrganization,
} from "../controllers/organizationController.js";

const router = express.Router();

router.get("/", fetchOrganizations);
router.post("/", createOrganization);
router.delete("/:id", deleteOrganization);
router.put("/:id", updateOrganization); // <-- PUT route must be here!

export default router;
