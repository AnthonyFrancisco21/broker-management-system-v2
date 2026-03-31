// ─────────────────────────────────────────────────────────────────────────────
// apps/api/src/controllers/reservation.controller.ts
// ─────────────────────────────────────────────────────────────────────────────

import { Request, Response } from "express";
import * as reservationService from "../services/reservation.service";

// ─── POST /api/reservations (public) ─────────────────────────────────────────

export const createReservation = async (req: Request, res: Response) => {
  try {
    const {
      unitId,
      customerEmail,
      customerFirstName,
      customerLastName,
      customerContact,
    } = req.body;

    if (!unitId || !customerEmail || !customerFirstName || !customerLastName) {
      return res.status(400).json({
        message: "Unit, email, first name, and last name are required.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res
        .status(400)
        .json({ message: "Please provide a valid email address." });
    }

    const result = await reservationService.createReservation({
      unitId: Number(unitId),
      customerEmail,
      customerFirstName,
      customerLastName,
      customerContact,
    });

    return res.status(201).json({
      message:
        "Reservation created. Check your email for your reference and instructions.",
      token: result.token,
      reservedAt: result.reservedAt,
      expiresAt: result.expiresAt,
      unit: result.unit,
    });
  } catch (err: any) {
    return res
      .status(400)
      .json({ message: err.message ?? "Failed to create reservation." });
  }
};

// ─── POST /api/reservations/lookup (public) ───────────────────────────────────

export const lookupReservation = async (req: Request, res: Response) => {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({
        message: "Email and reservation reference are required.",
      });
    }

    const reservation = await reservationService.lookupReservation(
      email,
      token,
    );

    if (!reservation) {
      return res.status(404).json({
        message:
          "No reservation found with that email and reference. Please check your details and try again.",
      });
    }

    return res.json(reservation);
  } catch (err: any) {
    return res
      .status(500)
      .json({ message: err.message ?? "Lookup failed. Please try again." });
  }
};

// ─── POST /api/reservations/payment (public) ─────────────────────────────────

export const submitPaymentProof = async (req: Request, res: Response) => {
  try {
    const { email, token } = req.body;
    const file = req.file;

    if (!email || !token) {
      return res.status(400).json({
        message: "Email and reservation reference are required.",
      });
    }
    if (!file) {
      return res
        .status(400)
        .json({ message: "Please attach your payment proof file." });
    }

    const allowedMimes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    if (!allowedMimes.includes(file.mimetype)) {
      return res.status(400).json({
        message: "Only JPG, PNG, WEBP, or PDF files are accepted.",
      });
    }
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ message: "File must be under 5 MB." });
    }

    await reservationService.submitPaymentProof(token, email, file);

    return res.json({
      message:
        "Payment proof submitted. We will review and confirm your reservation within 24 hours.",
    });
  } catch (err: any) {
    return res
      .status(400)
      .json({ message: err.message ?? "Failed to submit payment proof." });
  }
};

// ─── GET /api/reservations (auth — dashboard) ────────────────────────────────

export const getAllReservations = async (req: Request, res: Response) => {
  try {
    const reservations = await reservationService.getAllReservations();
    return res.json(reservations);
  } catch (err: any) {
    return res
      .status(500)
      .json({ message: err.message ?? "Failed to fetch reservations." });
  }
};

// ─── POST /api/reservations/:id/confirm (auth — dashboard) ───────────────────

export const confirmReservation = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const accountId = (req as any).user?.id;
    const { notes } = req.body;

    if (!accountId)
      return res.status(401).json({ message: "Not authenticated." });
    if (isNaN(id))
      return res.status(400).json({ message: "Invalid reservation ID." });

    await reservationService.confirmReservation(id, accountId, notes);
    return res.json({ message: "Reservation confirmed." });
  } catch (err: any) {
    return res
      .status(400)
      .json({ message: err.message ?? "Failed to confirm." });
  }
};

// ─── POST /api/reservations/:id/reject (auth — dashboard) ────────────────────

export const rejectReservation = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const accountId = (req as any).user?.id;
    const { notes } = req.body;

    if (!accountId)
      return res.status(401).json({ message: "Not authenticated." });
    if (isNaN(id))
      return res.status(400).json({ message: "Invalid reservation ID." });

    await reservationService.rejectReservation(id, accountId, notes);
    return res.json({ message: "Reservation rejected." });
  } catch (err: any) {
    return res
      .status(400)
      .json({ message: err.message ?? "Failed to reject." });
  }
};
