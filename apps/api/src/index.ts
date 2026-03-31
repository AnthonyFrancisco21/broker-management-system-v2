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

app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/brokers", brokerRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/uploads", express.static("uploads")); // Serve uploaded files statically
app.use("/api/reservations", reservations);

app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT || 5000}`);
});
