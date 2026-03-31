// ─────────────────────────────────────────────────────────────────────────────
// apps/api/src/services/reservation.service.ts
// ─────────────────────────────────────────────────────────────────────────────

import { prisma } from "@repo/database";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import {
  sendReservationConfirmationEmail,
  sendReservationApprovedEmail,
  sendReservationRejectedEmail,
} from "./email.service";

// ─── Create Reservation ───────────────────────────────────────────────────────

export const createReservation = async (data: {
  unitId: number;
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  customerContact?: string;
}) => {
  const email = data.customerEmail.toLowerCase().trim();

  const unit = await prisma.unit.findUnique({ where: { id: data.unitId } });
  if (!unit) throw new Error("Unit not found.");
  if (unit.unitStatus !== "available") {
    throw new Error(
      "This unit is no longer available. Please choose another unit.",
    );
  }

  const existingActive = await prisma.reservation.findFirst({
    where: {
      customerEmail: email,
      status: { in: ["pending", "paymentSubmitted"] as any },
    },
    include: { unit: { select: { roomNo: true, unitType: true } } },
  });

  if (existingActive) {
    const unitLabel =
      [
        existingActive.unit?.unitType,
        existingActive.unit?.roomNo
          ? `Room ${existingActive.unit.roomNo}`
          : null,
      ]
        .filter(Boolean)
        .join(" · ") || "a unit";
    throw new Error(
      `You already have an active reservation for ${unitLabel}. ` +
        `Check your email for your reference, or visit the status page.`,
    );
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

  const reservation = await prisma.$transaction(async (tx) => {
    const newClient = await tx.client.create({
      data: {
        firstName: data.customerFirstName.trim(),
        lastName: data.customerLastName.trim(),
        email: email,
        clientStatus: "onHold" as any,
        unitId: data.unitId,
      },
    });

    const res = await tx.reservation.create({
      data: {
        token,
        customerEmail: email,
        customerFirstName: data.customerFirstName.trim(),
        customerLastName: data.customerLastName.trim(),
        customerContact: data.customerContact?.trim() ?? null,
        unitId: data.unitId,
        expiresAt,
        status: "pending" as any,
        clientId: newClient.id,
      },
      include: {
        unit: {
          select: { roomNo: true, unitType: true, floor: true, price: true },
        },
      },
    });

    await tx.unit.update({
      where: { id: data.unitId },
      data: { unitStatus: "onHold" as any },
    });

    return res;
  });

  sendReservationConfirmationEmail(reservation).catch((err) => {
    console.error("[Email] Failed to send confirmation:", err?.message ?? err);
  });

  return {
    token: reservation.token,
    reservedAt: reservation.reservedAt,
    expiresAt: reservation.expiresAt,
    unit: reservation.unit,
  };
};

// ─── Lookup Reservation (public — marketing status page) ─────────────────────

export const lookupReservation = async (email: string, token: string) => {
  const reservation = await prisma.reservation.findFirst({
    where: {
      token: token.trim(),
      customerEmail: email.toLowerCase().trim(),
    },
    include: {
      unit: {
        select: {
          roomNo: true,
          unitType: true,
          floor: true,
          price: true,
          size: true,
        },
      },
    },
  });

  if (!reservation) return null;

  return {
    token: reservation.token,
    status: reservation.status,
    customerFirstName: reservation.customerFirstName,
    customerLastName: reservation.customerLastName,
    customerEmail: reservation.customerEmail,
    reservedAt: reservation.reservedAt,
    expiresAt: reservation.expiresAt,
    paymentSubmittedAt: reservation.paymentSubmittedAt,
    unit: reservation.unit,
  };
};

// ─── Submit Payment Proof (public — marketing status page) ───────────────────

export const submitPaymentProof = async (
  token: string,
  email: string,
  file: Express.Multer.File,
) => {
  const reservation = await prisma.reservation.findFirst({
    where: {
      token: token.trim(),
      customerEmail: email.toLowerCase().trim(),
    },
  });

  if (!reservation) throw new Error("Reservation not found.");
  if (reservation.status === "confirmed")
    throw new Error("This reservation has already been confirmed.");
  if (reservation.status === "cancelled")
    throw new Error("This reservation was cancelled.");
  if (reservation.status === "paymentSubmitted")
    throw new Error(
      "Payment proof was already submitted. We are reviewing it.",
    );
  if (reservation.status !== "pending")
    throw new Error(
      "Payment proof can only be submitted for pending reservations.",
    );
  if (new Date() > reservation.expiresAt)
    throw new Error(
      "The 48-hour payment window has passed. Please contact us directly.",
    );

  const ext = path.extname(file.originalname);
  const safeToken = reservation.token.slice(0, 8);
  const fileName = `proof-${safeToken}-${Date.now()}${ext}`;
  const uploadDir = path.join(__dirname, "../../uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  fs.writeFileSync(path.join(uploadDir, fileName), file.buffer);

  await prisma.$transaction(async (tx) => {
    await tx.reservation.update({
      where: { id: reservation.id },
      data: {
        paymentProofPath: `uploads/${fileName}`,
        paymentSubmittedAt: new Date(),
        status: "paymentSubmitted" as any,
      },
    });

    if (reservation.clientId) {
      await tx.client.update({
        where: { id: reservation.clientId },
        data: { clientStatus: "paymentVerification" as any },
      });
    }
  });
};

// ─── Get All Reservations (dashboard — all managers see all) ─────────────────

export const getAllReservations = async () => {
  return await prisma.reservation.findMany({
    include: {
      unit: {
        select: {
          id: true,
          roomNo: true,
          unitType: true,
          floor: true,
          price: true,
        },
      },
      client: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      verifiedBy: {
        select: { firstName: true, lastName: true },
      },
    },
    orderBy: [
      // Actionable items first
      { status: "asc" },
      { reservedAt: "desc" },
    ],
  });
};

// ─── Confirm Reservation (manager action) ────────────────────────────────────
// Payment verified — unit → reserved, client → reserved, reservation → confirmed

export const confirmReservation = async (
  reservationId: number,
  accountId: number,
  notes?: string,
) => {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: {
      unit: {
        select: { roomNo: true, unitType: true, floor: true, price: true },
      },
    },
  });

  if (!reservation) throw new Error("Reservation not found.");
  if (reservation.status === "confirmed") throw new Error("Already confirmed.");
  if (reservation.status === "cancelled")
    throw new Error("This reservation was cancelled.");

  await prisma.$transaction(async (tx) => {
    await tx.reservation.update({
      where: { id: reservationId },
      data: {
        status: "confirmed" as any,
        verifiedAt: new Date(),
        verifiedById: accountId,
        verificationNotes: notes ?? null,
      },
    });

    await tx.unit.update({
      where: { id: reservation.unitId },
      data: { unitStatus: "reserved" as any },
    });

    if (reservation.clientId) {
      await tx.client.update({
        where: { id: reservation.clientId },
        data: {
          clientStatus: "reserved" as any,
          accountId: accountId,
        },
      });
    }
  });

  // Send approval email (non-blocking)
  sendReservationApprovedEmail({
    customerEmail: reservation.customerEmail,
    customerFirstName: reservation.customerFirstName,
    customerLastName: reservation.customerLastName,
    reservedAt: reservation.reservedAt,
    verifiedAt: new Date(),
    notes: notes || null,
    unit: reservation.unit,
  }).catch((err) => {
    console.error("[Email] Approval email failed:", err?.message ?? err);
  });
};

// ─── Reject Reservation ───────────────────────────────────────────────────────

export const rejectReservation = async (
  reservationId: number,
  accountId: number,
  notes?: string,
) => {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: {
      unit: {
        select: { roomNo: true, unitType: true, floor: true },
      },
    },
  });

  if (!reservation) throw new Error("Reservation not found.");
  if (reservation.status === "confirmed")
    throw new Error(
      "Cannot reject a confirmed reservation. Contact your admin.",
    );
  if (reservation.status === "cancelled") throw new Error("Already cancelled.");

  await prisma.$transaction(async (tx) => {
    await tx.reservation.update({
      where: { id: reservationId },
      data: {
        status: "cancelled" as any,
        verifiedAt: new Date(),
        verifiedById: accountId,
        verificationNotes: notes ?? null,
      },
    });

    await tx.unit.update({
      where: { id: reservation.unitId },
      data: { unitStatus: "available" as any },
    });

    if (reservation.clientId) {
      await tx.client.update({
        where: { id: reservation.clientId },
        data: { clientStatus: "rejected" as any },
      });
    }
  });

  // Send rejection email (non-blocking)
  sendReservationRejectedEmail({
    customerEmail: reservation.customerEmail,
    customerFirstName: reservation.customerFirstName,
    notes: notes || null,
    unit: reservation.unit,
  }).catch((err) => {
    console.error("[Email] Rejection email failed:", err?.message ?? err);
  });
};
// ─── Expire Reservations (cron) ───────────────────────────────────────────────

export const expireReservations = async (): Promise<number> => {
  const toExpire = await prisma.reservation.findMany({
    where: {
      status: "pending" as any,
      expiresAt: { lt: new Date() },
    },
    select: { id: true, clientId: true },
  });

  if (toExpire.length === 0) return 0;

  const ids = toExpire.map((r) => r.id);
  const clientIds = toExpire
    .map((r) => r.clientId)
    .filter((id): id is number => id !== null);

  await prisma.$transaction(async (tx) => {
    await tx.reservation.updateMany({
      where: { id: { in: ids } },
      data: { status: "expired" as any },
    });
    if (clientIds.length > 0) {
      await tx.client.updateMany({
        where: { id: { in: clientIds } },
        data: { clientStatus: "rejected" as any },
      });
    }
  });

  console.log(`[Cron] Expired ${toExpire.length} reservation(s).`);
  return toExpire.length;
};
