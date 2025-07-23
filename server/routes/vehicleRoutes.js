import express from "express";
import {
  fetchVehicles,
  fetchVehicleById,
  addVehicle,
  upload,
  updateVehicleStatus,
  trackVehicleScan,
  getVehicleScansByMonth,
} from "../controllers/vehicleController.js";

import {
  scanLimiter,
  preventDuplicateScan,
} from "../middleware/scanLimiter.js";

const router = express.Router();

// ✅ Static and specific routes first
router.get("/vehicle-scans", getVehicleScansByMonth);

// 🧾 Main routes
router.get("/", fetchVehicles);
router.post("/", upload.single("insuranceFile"), addVehicle);
router.patch("/:vehicleId/status", updateVehicleStatus);
router.post("/:id/scan", scanLimiter, preventDuplicateScan, trackVehicleScan);

// ✅ Dynamic route LAST — catches /:id safely
router.get("/:id", fetchVehicleById);

export default router;
