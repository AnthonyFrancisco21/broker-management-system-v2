import { PrismaClient, SystemRole } from "@prisma/client";
import bcrypt from "bcryptjs"; // 👈 Use bcryptjs to match your service

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Resetting Admin Password...");

  const adminEmail = "admin@gmail.com";

  // ⚡ Hash "123456" using bcryptjs specifically
  const passwordHash = await bcrypt.hash("123456", 10);

  const admin = await prisma.systemAccount.upsert({
    where: { email: adminEmail },
    update: {
      password: passwordHash,
    },
    create: {
      email: adminEmail,
      password: passwordHash,
      firstName: "Manager",
      lastName: "Admin",
      role: SystemRole.ADMIN,
      contactNo: "09171234567",
    },
  });

  console.log(`✅ Admin Password updated for: ${admin.email}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
