// middleware/scanLimiter.js
import rateLimit from "express-rate-limit";

// In-memory store: Map<key, expiryTimestamp>
const recentScans = new Map();

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
  const key = `${ip}:${vehicleId}`;
  const now = Date.now();

  const expiresAt = recentScans.get(key);

  if (expiresAt && now < expiresAt) {
    return res.status(429).json({
      error: "You already scanned this vehicle recently. Please wait a moment.",
    });
  }

  // Set expiration 60 seconds from now
  recentScans.set(key, now + 60 * 1000);

  // Optional: Clean up old entries (to avoid memory bloat)
  for (const [k, v] of recentScans) {
    if (v < now) recentScans.delete(k);
  }

  next();
};
