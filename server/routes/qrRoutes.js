// routes/qrRoutes.js
import express from "express";
import {
  generateQRCode,
  getVehicleAssignment,
} from "../controllers/qrController.js";

const router = express.Router();

router.post("/", generateQRCode);
router.get("/:vehicleId", getVehicleAssignment); // 👈 new GET route

export default router;
