import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

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

// ✅ Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ✅ Mock units endpoint (no database)
app.get("/api/units/public", (req, res) => {
  res.json([
    {
      id: "1",
      name: "Unit A",
      floor: 1,
      price: 5000000,
      status: "available"
    },
    {
      id: "2",
      name: "Unit B",
      floor: 2,
      price: 6000000,
      status: "available"
    }
  ]);
});

// Catch 404
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

if (process.env.NODE_ENV !== "production") {
  app.listen(5000, () => console.log("Running on 5000"));
}

export default app;