// ─────────────────────────────────────────────────────────────────────────────
// RecentClientsTable.tsx
// Shows the last N clients sorted by createdAt descending.
// ─────────────────────────────────────────────────────────────────────────────

import { UserCheck } from "lucide-react";
import type { Client } from "../lib/dashboard.types";
import { ClientStatusBadge } from "./ClientStatusBadge";
import { EmptyState } from "./SectionCard";

const ROWS = 7;

function initials(firstName: string, lastName: string): string {
  return (
    [firstName[0], lastName[0]].filter(Boolean).join("").toUpperCase() || "?"
  );
}

function fullName(firstName: string, lastName: string): string {
  return [firstName, lastName].filter(Boolean).join(" ") || "Unnamed Client";
}

function shortDate(date: Date): string {
  return date.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

const AVATAR_PALETTE = [
  "from-blue-200 to-blue-300 text-blue-800",
  "from-violet-200 to-violet-300 text-violet-800",
  "from-emerald-200 to-emerald-300 text-emerald-800",
  "from-amber-200 to-amber-300 text-amber-800",
  "from-rose-200 to-rose-300 text-rose-800",
  "from-sky-200 to-sky-300 text-sky-800",
];

function avatarClasses(id: number) {
  return AVATAR_PALETTE[id % AVATAR_PALETTE.length];
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
      <EmptyState
        icon={<UserCheck size={30} />}
        message="No clients added yet"
      />
    );
  }

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full min-w-[520px]">
        <thead>
          <tr className="border-b border-slate-100">
            {["Client", "Status", "Unit", "Agent", "Added"].map((col) => (
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
          {recent.map((client) => {
            const name = fullName(client.firstName, client.lastName);
            const ini = initials(client.firstName, client.lastName);

            return (
              <tr
                key={client.id}
                className="hover:bg-slate-50/60 transition-colors"
              >
                {/* Client */}
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-[11px] font-bold shrink-0 ${avatarClasses(client.id)}`}
                    >
                      {ini}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 leading-tight truncate max-w-[140px]">
                        {name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
                        {client.email || "—"}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="py-3 pr-4">
                  <ClientStatusBadge status={client.clientStatus} />
                </td>

                {/* Unit */}
                <td className="py-3 pr-4">
                  <span className="text-xs text-slate-500 truncate max-w-[120px] block">
                    {client.unitLabel ?? (
                      <span className="text-slate-300">No unit</span>
                    )}
                  </span>
                </td>

                {/* Agent */}
                <td className="py-3 pr-4">
                  <span className="text-xs text-slate-500">
                    {client.brokerName ?? (
                      <span className="text-slate-400 italic">Direct</span>
                    )}
                  </span>
                </td>

                {/* Date */}
                <td className="py-3">
                  <span className="text-xs text-slate-400 tabular-nums">
                    {shortDate(client.createdAt)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
