import { prisma } from "@repo/database";

// ─── Local type aliases ───────────────────────────────────────────────────────
// Defined here to guarantee type safety without relying on generated enums

export type ClientStatusValue =
  | "prospect"
  | "onHold"
  | "paymentVerification"
  | "reserved"
  | "underNego"
  | "rejected"
  | "success";

export type UnitStatusValue =
  | "available"
  | "onHold"
  | "reserved"
  | "underNego"
  | "occupied";

// ─── Unit status sync ─────────────────────────────────────────────────────────

const determineUnitStatus = (
  clientStatus: ClientStatusValue,
): UnitStatusValue => {
  switch (clientStatus) {
    case "success":
      return "occupied";
    case "onHold":
    case "paymentVerification":
      return "onHold";
    case "reserved":
      return "reserved";
    case "underNego":
      return "underNego";
    case "prospect":
    case "rejected":
    default:
      return "available";
  }
};

const BLOCKED_UNIT_STATUSES: UnitStatusValue[] = [
  "reserved",
  "underNego",
  "occupied",
];

// ─── Get All Clients ──────────────────────────────────────────────────────────

export const getAllClients = async (accountId: number, role: string) => {
  // Let standard TypeScript infer the where clause object
  const whereClause = role === "ADMIN" ? {} : { accountId };

  return await prisma.client.findMany({
    where: whereClause,
    include: {
      unit: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// ─── Create Client ────────────────────────────────────────────────────────────

export const createClient = async (
  firstName: string,
  lastName: string,
  email: string,
  clientStatus: ClientStatusValue,
  unitId: number | null,
  accountId: number,
) => {
  return await prisma.$transaction(async (tx) => {
    if (unitId) {
      const targetUnit = await tx.unit.findUnique({ where: { id: unitId } });
      if (!targetUnit) throw new Error("Selected unit does not exist.");

      if (
        BLOCKED_UNIT_STATUSES.includes(targetUnit.unitStatus as UnitStatusValue)
      ) {
        throw new Error(
          `Cannot assign this unit. It is currently ${targetUnit.unitStatus}.`,
        );
      }
    }

    const newClient = await tx.client.create({
      data: {
        firstName,
        lastName,
        email,
        clientStatus: clientStatus as any, // Safely bypass Prisma enum lock
        unitId,
        accountId,
      },
    });

    if (unitId) {
      await tx.unit.update({
        where: { id: unitId },
        data: {
          unitStatus: determineUnitStatus(clientStatus) as any,
        },
      });
    }

    return newClient;
  });
};

// ─── Update Client ────────────────────────────────────────────────────────────

export const updateClient = async (
  id: number,
  firstName: string,
  lastName: string,
  email: string,
  clientStatus: ClientStatusValue,
  unitId: number | null,
) => {
  return await prisma.$transaction(async (tx) => {
    const existingClient = await tx.client.findUnique({ where: { id } });
    if (!existingClient) throw new Error("Client not found");

    const oldUnitId = existingClient.unitId;

    if (unitId && unitId !== oldUnitId) {
      const targetUnit = await tx.unit.findUnique({ where: { id: unitId } });
      if (!targetUnit) throw new Error("Selected unit does not exist.");

      if (
        BLOCKED_UNIT_STATUSES.includes(targetUnit.unitStatus as UnitStatusValue)
      ) {
        throw new Error(
          `Cannot assign this unit. It is currently ${targetUnit.unitStatus}.`,
        );
      }
    }

    const updatedClient = await tx.client.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        clientStatus: clientStatus as any,
        unitId,
      },
    });

    if (oldUnitId && oldUnitId !== unitId) {
      await tx.unit.update({
        where: { id: oldUnitId },
        data: {
          unitStatus: "available" as any,
        },
      });
    }

    if (unitId) {
      await tx.unit.update({
        where: { id: unitId },
        data: {
          unitStatus: determineUnitStatus(clientStatus) as any,
        },
      });
    }

    return updatedClient;
  });
};

// ─── Delete Client ────────────────────────────────────────────────────────────

export const deleteClient = async (id: number) => {
  return await prisma.$transaction(async (tx) => {
    const existingClient = await tx.client.findUnique({ where: { id } });
    if (!existingClient) throw new Error("Client not found");

    if (existingClient.unitId) {
      await tx.unit.update({
        where: { id: existingClient.unitId },
        data: {
          unitStatus: "available" as any,
        },
      });
    }

    return await tx.client.delete({ where: { id } });
  });
};
