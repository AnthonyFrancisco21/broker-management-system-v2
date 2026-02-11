import { prisma } from "@repo/database";

export const getAllUnits = async () => {
  return await prisma.unit.findMany({
    include: { clients: true },
  });
};
