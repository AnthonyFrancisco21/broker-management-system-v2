// ─────────────────────────────────────────────────────────────────────────────
// apps/api/src/controllers/reservation.controller.ts
// ─────────────────────────────────────────────────────────────────────────────

import { Request, Response } from "express";
import * as reservationService from "../services/reservation.service";

// ─── POST /reservations ───────────────────────────────────────────────────────
// Public. Called from the marketing site reservation form.

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

    // Basic email format check
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

// ─── POST /reservations/lookup ────────────────────────────────────────────────
// Public. Called from the status page lookup form.

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

// ─── POST /reservations/payment ───────────────────────────────────────────────
// Public. Called from the status page upload form.
// Expects multipart/form-data with fields: email, token, and file: proof.

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

    // File type guard — only images and PDF
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

    // 5 MB size limit
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
