import { prisma } from "@repo/database";

export const getAllClients = async () => {
  return await prisma.client.findMany();
};

// UPDATE THIS FUNCTION:
export const createClient = async (
  firstName: string,
  lastName: string,
  email: string,
) => {
  return await prisma.client.create({
    data: {
      firstName,
      lastName,
      email,
      // "name" does not exist anymore!
    },
  });
};
