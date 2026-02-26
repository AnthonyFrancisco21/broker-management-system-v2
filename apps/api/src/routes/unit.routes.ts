// src/routes/unit.routes.ts
import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import * as UnitController from "../controllers/unit.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

// ==============================
// MULTER CONFIGURATION
// ==============================

// Ensure it specifically saves to apps/api/uploads to prevent missing folders
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generates a unique name like: unit-1708873434321.jpg
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "unit-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ==============================
// ROUTES
// ==============================

// GET all units
router.get(
  "/",
  authenticate,
  authorize(["ADMIN", "MANAGER", "AGENT", "CLIENT"]),
  UnitController.getUnits,
);

// POST create a unit (allows up to 10 images at once)
router.post(
  "/",
  authenticate,
  authorize(["ADMIN", "AGENT"]),
  upload.array("unitImages", 10), // The string "unitImages" MUST match the frontend FormData append
  UnitController.createUnit,
);

// PUT update a unit (allows up to 10 additional images at once)
router.put(
  "/:id",
  authenticate,
  authorize(["ADMIN", "MANAGER"]),
  upload.array("unitImages", 10),
  UnitController.updateUnit,
);

// DELETE a unit
router.delete(
  "/:id",
  authenticate,
  authorize(["ADMIN", "MANAGER"]),
  UnitController.deleteUnit,
);

export default router;
