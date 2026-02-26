import express from "express";
import cors from "cors";
import brokerRoutes from "./routes/broker.routes";
import authRoutes from "./routes/auth.routes";
import unitRoutes from "./routes/unit.routes";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ROUTES
// New Version (Matches your frontend!)
app.use("/api/brokers", brokerRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/uploads", express.static("uploads")); // Serve uploaded files statically

app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT || 5000}`);
});
