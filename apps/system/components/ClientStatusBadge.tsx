// ─────────────────────────────────────────────────────────────────────────────
// ClientStatusBadge.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { CLIENT_STATUS_CONFIG } from "../lib/dashboard.config";
import type { ClientStatus } from "../lib/dashboard.types";

interface ClientStatusBadgeProps {
  status: ClientStatus;
  /** Show the icon alongside the label */
  showIcon?: boolean;
  size?: "sm" | "md";
}

export function ClientStatusBadge({
  status,
  showIcon = true,
  size = "sm",
}: ClientStatusBadgeProps) {
  const cfg = CLIENT_STATUS_CONFIG[status];
  if (!cfg) return <span className="text-xs text-slate-400">{status}</span>;

  const Icon = cfg.icon;

  const sizeClasses =
    size === "sm" ? "px-2 py-0.5 text-xs gap-1" : "px-2.5 py-1 text-xs gap-1.5";

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses} ${cfg.textClass} ${cfg.bgClass}`}
    >
      {showIcon && <Icon size={10} strokeWidth={2.2} />}
      {cfg.label}
    </span>
  );
}
