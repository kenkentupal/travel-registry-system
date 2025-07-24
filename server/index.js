import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Routes
import vehicleRoutes from "./routes/vehicleRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";
import inviteRoutes from "./routes/inviteRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import qrRoutes from "./routes/qrRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// ✅ CORS Options: allow local frontend & deployed frontend
const corsOptions = {
  origin: [
    "http://localhost:5173", // local frontend
    "https://travel-registry-system-production.up.railway.app", // deployed frontend
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// API Routes
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/invites", inviteRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/qrcode", qrRoutes);

// Default route
app.get("/", (req, res) => res.send("API is running"));

// Server start
app.listen(port, () => console.log(`Server running on port ${port}`));
