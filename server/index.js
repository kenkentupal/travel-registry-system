const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
const vehicleRoutes = require("./routes/vehicleRoutes");
app.use("/vehicles", vehicleRoutes);

app.get("/", (req, res) => res.send("API is running"));
app.listen(port, () => console.log(`Server running on port ${port}`));
