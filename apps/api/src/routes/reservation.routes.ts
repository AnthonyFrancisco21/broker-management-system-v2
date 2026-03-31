// ─────────────────────────────────────────────────────────────────────────────
// apps/api/src/routes/reservation.routes.ts
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from "express";
import multer from "multer";
import { authenticate, authorize } from "../middleware/auth.middleware";
import * as reservationController from "../controllers/reservation.controller";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ── Public routes (no auth — used by marketing site) ─────────────────────────
router.post("/", reservationController.createReservation);
router.post("/lookup", reservationController.lookupReservation);
router.post(
  "/payment",
  upload.single("proof"),
  reservationController.submitPaymentProof,
);

// ── Authenticated routes (dashboard — manager/admin only) ────────────────────
router.get(
  "/",
  authenticate,
  authorize(["ADMIN", "MANAGER"]),
  reservationController.getAllReservations,
);
router.post(
  "/:id/confirm",
  authenticate,
  authorize(["ADMIN", "MANAGER"]),
  reservationController.confirmReservation,
);
router.post(
  "/:id/reject",
  authenticate,
  authorize(["ADMIN", "MANAGER"]),
  reservationController.rejectReservation,
);

export default router;
