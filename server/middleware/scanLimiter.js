// middleware/scanLimiter.js
import rateLimit from "express-rate-limit";
import redisClient from "../lib/redisClient.js";

// Rate limit: max 10 scans per IP per 15 minutes
export const scanLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many QR scans from this IP. Please try again in 15 minutes.",
  },
});

// Prevent scanning same vehicle repeatedly within 60 seconds
export const preventDuplicateScan = async (req, res, next) => {
  const ip = req.ip;
  const vehicleId = req.params.id;
  const key = `scan:${ip}:${vehicleId}`;

  const exists = await redisClient.get(key);
  if (exists) {
    return res.status(429).json({
      error: "You already scanned this vehicle recently. Please wait a moment.",
    });
  }

  await redisClient.set(key, "1", { EX: 60 }); // Auto-expire in 60 seconds
  next();
};
