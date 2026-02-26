import { prisma } from "@repo/database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "qwhrqyq123qwse1gcq4rbcq34r2#@!";

export const loginSystemUser = async (email: string, password: string) => {
  // FIXED: Initialize with empty strings to satisfy TypeScript
  let role: string = "";
  let type: string = "";

  // 1. FIRST CHECK: Find the user in SystemAccount (Admin/Manager)
  let user: any = await prisma.systemAccount.findUnique({
    where: { email },
  });

  if (user) {
    role = user.role; // "ADMIN" or "MANAGER"
    type = "SYSTEM_ACCOUNT";
  } else {
    // 2. SECOND CHECK: If not found, check the Broker table
    user = await prisma.broker.findUnique({
      where: { email },
    });

    if (user) {
      role = "AGENT"; // Manually assign role for frontend routing
      type = "BROKER_ACCOUNT"; // Distinguish from system accounts
    }
  }

  // 3. FINAL CHECK: If still no user found in either table, throw error
  if (!user) {
    throw new Error("Invalid email or password");
  }

  // 4. Check Password
  // Note: We use bcrypt to compare the plain text vs the hash in DB
  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw new Error("Invalid email or password");
  }

  // 5. Generate Token (The "Digital ID Card")
  const token = jwt.sign(
    {
      id: user.id,
      role: role,
      type: type,
    },
    JWT_SECRET,
    { expiresIn: "1d" }, // Token expires in 1 day
  );

  // Return the user info (excluding password) and the token
  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};
