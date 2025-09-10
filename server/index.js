import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";

// Routes
import vehicleRoutes from "./routes/vehicleRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";
import inviteRoutes from "./routes/inviteRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import qrRoutes from "./routes/qrRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/vehicles", vehicleRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/invites", inviteRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/qrcode", qrRoutes);

app.get("/", (req, res) => res.send("API is running"));

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => console.log(`Server running on port ${port}`));
}

export default app; // ✅ Needed for Supertest
