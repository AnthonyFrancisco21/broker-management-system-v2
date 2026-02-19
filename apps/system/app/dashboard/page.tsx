"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "../../lib/auth"; // Adjust path if needed

export default function DashboardRoot() {
  const router = useRouter();

  useEffect(() => {
    const user = getUser();

    if (!user) {
      // 1. Not logged in? Go to login.
      router.push("/login");
      return;
    }

    // 2. Logged in? Check role and redirect to the specific folder.
    switch (user.role) {
      case "ADMIN":
      case "MANAGER":
        router.push("/dashboard/manager");
        break;
      case "BROKER":
        router.push("/dashboard/broker");
        break;
      default:
        // 3. Unknown role? Stay here or go to a "Contact Support" page.
        console.warn("User has no valid role");
    }
  }, [router]);

  // Show a loading spinner while the redirect happens
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}
