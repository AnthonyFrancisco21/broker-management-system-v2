import { PrismaClient, SystemRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding managers...");

  // In a production environment, passwords must always be hashed.
  // We are setting a secure default password: "ManagerPassword2024!"
  const saltRounds = 10;
  const defaultPassword = "ManagerPassword2026!";
  const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

  // 1. Create Manager: Janelle Jem Gargarita
  const janelle = await prisma.systemAccount.upsert({
    where: { email: "janelle.gargarita@gmail.com" },
    update: {}, // If the user already exists, do nothing
    create: {
      email: "janelle.gargarita@gmail.com",
      password: hashedPassword,
      firstName: "Janelle Jem",
      lastName: "Gargarita",
      role: SystemRole.MANAGER,
      contactNo: "+639000000001", // Placeholder contact
    },
  });

  // 2. Create Manager: Kenneth Tigulo
  const kenneth = await prisma.systemAccount.upsert({
    where: { email: "kenneth.tigulo@gmail.com" },
    update: {}, // If the user already exists, do nothing
    create: {
      email: "kenneth.tigulo@gmail.com",
      password: hashedPassword,
      firstName: "Kenneth",
      lastName: "Tigulo",
      role: SystemRole.MANAGER,
      contactNo: "+639000000002", // Placeholder contact
    },
  });

  console.log("Seeding finished successfully.");
  console.log(
    `Created Manager: ${janelle.firstName} ${janelle.lastName} (${janelle.email})`,
  );
  console.log(
    `Created Manager: ${kenneth.firstName} ${kenneth.lastName} (${kenneth.email})`,
  );
  console.log(`Default Password for both: ${defaultPassword}`);
}

main()
  .catch((e) => {
    console.error("Error during seeding:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
