import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// Routes
import vehicleRoutes from "./routes/vehicleRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";
import inviteRoutes from "./routes/inviteRoutes.js";
import { fetchProfiles } from "./controllers/profileController.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/vehicles", vehicleRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/invites", inviteRoutes);
app.use("/api/profiles", fetchProfiles);

app.get("/", (req, res) => res.send("API is running"));

app.listen(port, () => console.log(`Server running on port ${port}`));
