"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface NavLinkProps {
  href: string;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

export default function NavLink({
  href,
  label,
  isActive = false,
  onClick,
}: NavLinkProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onClick?.();
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`
        px-3 py-2 rounded text-sm transition-colors duration-200
        ${
          isActive
            ? "bg-blue-600 text-white font-medium"
            : "text-slate-300 hover:bg-slate-800 hover:text-white"
        }
        ${isPending ? "opacity-60" : ""}
      `}
    >
      {label}
    </Link>
  );
}
