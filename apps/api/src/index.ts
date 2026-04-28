import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
// Temporarily disable all routes that use @repo/database
// import brokerRoutes from "./routes/broker.routes";
// import authRoutes from "./routes/auth.routes";
// import unitRoutes from "./routes/unit.routes";
// import clientRoutes from "./routes/client.routes";
// import reservations from "./routes/reservation.routes";

const app = express();

const allowedOrigins = [
  "https://broker-management-system-v2-marketi.vercel.app",
  "https://broker-management-system-v2-system.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

// Health check - doesn't need database
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Catch 404
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

if (process.env.NODE_ENV !== "production") {
  app.listen(5000, () => console.log("Running on 5000"));
}

export default app;