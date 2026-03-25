// ─────────────────────────────────────────────────────────────────────────────
// components/RecentClientsTable.tsx
// Shows the last 7 clients by createdAt.
// No broker column — brokerId is a legacy field, ignored.
// No unit column — unit data belongs in Statistics.
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { UserCheck } from "lucide-react";
import type { Client } from "../lib/dashboard.types";
import { ClientStatusBadge } from "./ClientStatusBadge";

const ROWS = 7;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fullName(c: Client): string {
  return (
    [c.firstName, c.lastName].filter(Boolean).join(" ") || "Unnamed Client"
  );
}

function initials(c: Client): string {
  return (
    [c.firstName[0], c.lastName[0]].filter(Boolean).join("").toUpperCase() ||
    "?"
  );
}

function shortDate(date: Date): string {
  return date.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
}

// ─── Avatar palette ───────────────────────────────────────────────────────────

const PALETTE = [
  "from-blue-100 to-blue-200 text-blue-700",
  "from-violet-100 to-violet-200 text-violet-700",
  "from-emerald-100 to-emerald-200 text-emerald-700",
  "from-amber-100 to-amber-200 text-amber-700",
  "from-rose-100 to-rose-200 text-rose-700",
  "from-sky-100 to-sky-200 text-sky-700",
  "from-teal-100 to-teal-200 text-teal-700",
];

function avatarClass(id: number): string {
  return PALETTE[id % PALETTE.length];
}

// ─── Component ────────────────────────────────────────────────────────────────

interface RecentClientsTableProps {
  clients: Client[];
}

export function RecentClientsTable({ clients }: RecentClientsTableProps) {
  const recent = [...clients]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, ROWS);

  if (recent.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 h-36 text-slate-300">
        <UserCheck size={28} />
        <p className="text-sm">No clients yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full min-w-[400px]">
        <thead>
          <tr className="border-b border-slate-100">
            {["Client", "Status", "Added"].map((col) => (
              <th
                key={col}
                className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider pb-3 pr-4 last:pr-0"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {recent.map((client) => (
            <tr
              key={client.id}
              className="hover:bg-slate-50/60 transition-colors"
            >
              {/* Client */}
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-[11px] font-bold shrink-0 ${avatarClass(client.id)}`}
                  >
                    {initials(client)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 leading-tight truncate max-w-[160px]">
                      {fullName(client)}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate max-w-[160px]">
                      {client.email || "—"}
                    </p>
                  </div>
                </div>
              </td>

              {/* Status */}
              <td className="py-3 pr-4">
                <ClientStatusBadge status={client.clientStatus} />
              </td>

              {/* Date */}
              <td className="py-3">
                <span className="text-xs text-slate-400 tabular-nums">
                  {shortDate(client.createdAt)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
