// ─────────────────────────────────────────────────────────────────────────────
// apps/api/src/routes/reservation.routes.ts
// All routes are public — no auth middleware — the marketing site uses these.
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from "express";
import multer from "multer";
import * as reservationController from "../controllers/reservation.controller";

const router = Router();

// Store files in memory — the service writes them to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB hard limit
});

// POST /api/reservations         — create a new reservation
router.post("/", reservationController.createReservation);

// POST /api/reservations/lookup  — look up status by email + token
router.post("/lookup", reservationController.lookupReservation);

// POST /api/reservations/payment — upload payment proof
router.post(
  "/payment",
  upload.single("proof"),
  reservationController.submitPaymentProof,
);

export default router;
