import { prisma } from "@repo/database";

export const getAllBrokers = async () => {
  return await prisma.broker.findMany({
    include: { clients: true },
  });
};

// UPDATE THIS FUNCTION:
export const createBroker = async (
  firstName: string,
  lastName: string,
  email: string,
) => {
  return await prisma.broker.create({
    data: {
      firstName,
      lastName,
      email,
      // "name" does not exist anymore!
    },
  });
};
