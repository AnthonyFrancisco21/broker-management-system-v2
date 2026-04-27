import dotenv from "dotenv";

// ONLY load local .env file if we are NOT in Vercel's production environment
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

import express from "express";
import cors from "cors";
import brokerRoutes from "./routes/broker.routes";
import authRoutes from "./routes/auth.routes";
import unitRoutes from "./routes/unit.routes";
import clientRoutes from "./routes/client.routes";
import reservations from "./routes/reservation.routes";

const app = express();

// CORS allowed origins
const allowedOrigins = [
  "https://broker-management-system-v2-marketi.vercel.app",
  "https://broker-management-system-v2-system.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
];

// Use a function for origin to avoid Vercel/Express quirks
const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) {
    if (!origin) return callback(null, true); // Allow non-browser requests
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Apply CORS middleware FIRST
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json());

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ✅ ROUTES ENABLED
app.use("/api/brokers", brokerRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/uploads", express.static("uploads"));
app.use("/api/reservations", reservations);

// MUST ONLY LISTEN IN LOCAL DEVELOPMENT.
// Vercel serverless functions handle the listening automatically.
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Running locally on port ${PORT}`));
}

// THIS IS CRITICAL FOR VERCEL
export default app;
