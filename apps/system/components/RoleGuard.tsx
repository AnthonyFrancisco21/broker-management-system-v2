"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "../lib/auth";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[]; // Who is allowed here?
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const user = getUser();

    // 1. Check if logged in
    if (!user) {
      router.push("/login");
      return;
    }

    // 2. Check if role is allowed
    if (!allowedRoles.includes(user.role)) {
      // If a BROKER tries to access MANAGER page, kick them out
      alert("Unauthorized Access!"); // Optional: Show a message
      router.back(); // Send them back
      return;
    }

    setAuthorized(true);
  }, [router, allowedRoles]);

  if (!authorized) return null; // Or a Loading Spinner

  return <>{children}</>;
}
