import { prisma } from "@repo/database";
import { ClientStatus, UnitStatus } from "@prisma/client";

// FIX: Using TypeScript casting ("string" as EnumType) bypasses the caching error
const determineUnitStatus = (clientStatus: string): UnitStatus => {
  switch (clientStatus) {
    case "success":
      return "occupied" as UnitStatus;
    case "viewing":
      return "viewing" as UnitStatus;
    case "reserved":
      return "reserved" as UnitStatus;
    case "underNego":
      return "underNego" as UnitStatus;
    case "prospect":
    case "rejected":
    default:
      return "available" as UnitStatus;
  }
};

export const getAllClients = async (brokerId: number, role: string) => {
  const whereClause = role === "AGENT" ? { brokerId } : {};

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

export const createClient = async (
  firstName: string,
  lastName: string,
  email: string,
  clientStatus: ClientStatus,
  unitId: number | null,
  brokerId: number,
) => {
  return await prisma.$transaction(async (tx) => {
    // BACKEND SAFEGUARD: Verify the unit is actually available before assigning it
    if (unitId) {
      const targetUnit = await tx.unit.findUnique({ where: { id: unitId } });
      if (!targetUnit) throw new Error("Selected unit does not exist.");
      if (targetUnit.unitStatus !== ("available" as UnitStatus)) {
        throw new Error(
          `Cannot assign this unit. It is currently ${targetUnit.unitStatus}.`,
        );
      }
    }

    // 1. Create the Client
    const newClient = await tx.client.create({
      data: { firstName, lastName, email, clientStatus, unitId, brokerId },
    });

    // 2. Automatically sync the Unit status
    if (unitId) {
      const newUnitStatus = determineUnitStatus(clientStatus as string);
      await tx.unit.update({
        where: { id: unitId },
        data: { unitStatus: newUnitStatus },
      });
    }

    return newClient;
  });
};

export const updateClient = async (
  id: number,
  firstName: string,
  lastName: string,
  email: string,
  clientStatus: ClientStatus,
  unitId: number | null,
) => {
  return await prisma.$transaction(async (tx) => {
    const existingClient = await tx.client.findUnique({
      where: { id },
    });

    if (!existingClient) throw new Error("Client not found");

    const oldUnitId = existingClient.unitId;
    const newUnitStatus = determineUnitStatus(clientStatus as string);

    // BACKEND SAFEGUARD: If they selected a NEW unit, check if it's available
    if (unitId && unitId !== oldUnitId) {
      const targetUnit = await tx.unit.findUnique({ where: { id: unitId } });
      if (!targetUnit) throw new Error("Selected unit does not exist.");
      if (targetUnit.unitStatus !== ("available" as UnitStatus)) {
        throw new Error(
          `Cannot assign this new unit. It is currently ${targetUnit.unitStatus}.`,
        );
      }
    }

    // 1. Update the client
    const updatedClient = await tx.client.update({
      where: { id },
      data: { firstName, lastName, email, clientStatus, unitId },
    });

    // 2. If the broker changed the unit entirely or removed it, free up the old unit
    if (oldUnitId && oldUnitId !== unitId) {
      await tx.unit.update({
        where: { id: oldUnitId },
        data: { unitStatus: "available" as UnitStatus },
      });
    }

    // 3. Update the current unit's status based on the client's current status
    if (unitId) {
      await tx.unit.update({
        where: { id: unitId },
        data: { unitStatus: newUnitStatus },
      });
    }

    return updatedClient;
  });
};

export const deleteClient = async (id: number) => {
  return await prisma.$transaction(async (tx) => {
    const existingClient = await tx.client.findUnique({
      where: { id },
    });

    if (!existingClient) throw new Error("Client not found");

    // If the client is deleted, free up the unit automatically
    if (existingClient.unitId) {
      await tx.unit.update({
        where: { id: existingClient.unitId },
        data: { unitStatus: "available" as UnitStatus },
      });
    }

    return await tx.client.delete({
      where: { id },
    });
  });
};
