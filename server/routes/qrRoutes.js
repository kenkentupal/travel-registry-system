// routes/qrRoutes.js
import express from "express";
import {
  generateQRCode,
  getVehicleAssignment,
  deleteVehicleAssignment,
} from "../controllers/qrController.js";

const router = express.Router();

router.post("/", generateQRCode);
router.get("/:vehicleId", getVehicleAssignment);
router.delete("/:vehicleId", deleteVehicleAssignment);

export default router;
