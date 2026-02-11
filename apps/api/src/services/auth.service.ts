// apps/api/src/services/auth.service.ts
import { prisma } from "@repo/database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "qwhrqyq123qwse1gcq4rbcq34r2#@!";

export const loginSystemUser = async (email: string, password: string) => {
  // 1. Find the user in SystemAccount (Admin/Manager)
  const user = await prisma.systemAccount.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // 2. Check Password
  // Note: We use bcrypt to compare the plain text vs the hash in DB
  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw new Error("Invalid email or password");
  }

  // 3. Generate Token (The "Digital ID Card")
  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
      type: "SYSTEM_ACCOUNT", // To distinguish from Brokers later
    },
    JWT_SECRET,
    { expiresIn: "1d" }, // Token expires in 1 day
  );

  // Return the user info (excluding password) and the token
  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};
