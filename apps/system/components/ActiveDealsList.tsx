// ─────────────────────────────────────────────────────────────────────────────
// ActiveDealsList.tsx
// Lists clients in "reserved" or "underNego" state with their linked unit
// price info — gives the manager a quick view of deals in flight.
// ─────────────────────────────────────────────────────────────────────────────

import { DollarSign, Building2 } from "lucide-react";
import type { Client } from "../lib/dashboard.types";
import { ACTIVE_DEAL_STATUSES } from "../lib/dashboard.config";
import { ClientStatusBadge } from "./ClientStatusBadge";
import { EmptyState } from "./SectionCard";

const MAX_ITEMS = 6;

function formatPeso(value: number | null): string {
  if (value === null) return "—";
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function fullName(firstName: string, lastName: string): string {
  return [firstName, lastName].filter(Boolean).join(" ") || "Unnamed";
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ActiveDealsListProps {
  clients: Client[];
}

export function ActiveDealsList({ clients }: ActiveDealsListProps) {
  const deals = clients
    .filter((c) => ACTIVE_DEAL_STATUSES.includes(c.clientStatus))
    .sort((a, b) => {
      // Reserved > underNego; within same status sort by newest
      const statusOrder = { reserved: 0, underNego: 1 } as Record<
        string,
        number
      >;
      const diff =
        (statusOrder[a.clientStatus] ?? 9) - (statusOrder[b.clientStatus] ?? 9);
      if (diff !== 0) return diff;
      return b.createdAt.getTime() - a.createdAt.getTime();
    })
    .slice(0, MAX_ITEMS);

  if (deals.length === 0) {
    return (
      <EmptyState
        icon={<DollarSign size={28} />}
        message="No active deals right now"
        height="h-32"
      />
    );
  }

  return (
    <div className="space-y-1.5">
      {deals.map((client) => (
        <div
          key={client.id}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
        >
          {/* Unit icon */}
          <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
            <Building2
              size={15}
              className="text-violet-500"
              strokeWidth={1.8}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700 truncate leading-tight">
              {client.unitLabel ?? (
                <span className="text-slate-400 italic text-xs">
                  No unit linked
                </span>
              )}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {fullName(client.firstName, client.lastName)}
            </p>
          </div>

          {/* Price + status */}
          <div className="text-right shrink-0">
            <p className="text-sm font-semibold text-slate-800 tabular-nums">
              {formatPeso(client.unitPrice)}
            </p>
            <div className="mt-0.5">
              <ClientStatusBadge status={client.clientStatus} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
