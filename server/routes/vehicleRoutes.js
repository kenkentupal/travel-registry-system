import express from "express";
import {
  fetchVehicles,
  fetchVehicleById,
  addVehicle,
  upload,
  updateVehicleStatus,
} from "../controllers/vehicleController.js";

const router = express.Router();

router.get("/", fetchVehicles);

router.get("/:id", fetchVehicleById);

router.post("/", upload.single("insuranceFile"), addVehicle);

router.patch("/:vehicleId/status", updateVehicleStatus);

export default router;
