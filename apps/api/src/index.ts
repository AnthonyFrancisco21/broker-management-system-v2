import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import brokerRoutes from "./routes/broker.routes";
import authRoutes from "./routes/auth.routes";
import unitRoutes from "./routes/unit.routes";
import clientRoutes from "./routes/client.routes";
import reservations from "./routes/reservation.routes";

const app = express();

// ✅ ENABLE CORS
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

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ROUTES
app.use("/api/brokers", brokerRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/uploads", express.static("uploads"));
app.use("/api/reservations", reservations);

// ✅ For local development
if (process.env.NODE_ENV !== "production") {
  app.listen(process.env.PORT || 5000, () => {
    console.log(
      `Server running at http://localhost:${process.env.PORT || 5000}`,
    );
  });
}

// ✅ For Vercel serverless
export default app;
