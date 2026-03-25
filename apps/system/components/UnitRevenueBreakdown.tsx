// ─────────────────────────────────────────────────────────────────────────────
// components/UnitRevenueBreakdown.tsx
// Financial summary: sum of unit prices grouped by status.
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { DollarSign } from "lucide-react";
import type { RevenueRow } from "../lib/useStatisticsData";

function formatPeso(value: number): string {
  if (value === 0) return "—";
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatPesoFull(value: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);
}

interface UnitRevenueBreakdownProps {
  rows: RevenueRow[];
}

export function UnitRevenueBreakdown({ rows }: UnitRevenueBreakdownProps) {
  const total = rows.reduce((s, r) => s + r.value, 0);
  const hasData = rows.some((r) => r.value > 0);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-slate-300 gap-2">
        <DollarSign size={28} />
        <p className="text-sm">No priced units yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {rows.map((row) => (
        <div
          key={row.status}
          className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: row.color }}
            />
            <span className="text-sm font-medium text-slate-700 truncate">
              {row.label}
            </span>
          </div>
          <span
            className="text-sm font-bold tabular-nums shrink-0 ml-3"
            style={{ color: row.color }}
          >
            {formatPeso(row.value)}
          </span>
        </div>
      ))}

      {/* Total */}
      <div className="pt-3 mt-1 border-t border-slate-200 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Total Portfolio
        </span>
        <span className="text-base font-bold text-slate-900 tabular-nums">
          {formatPeso(total)}
        </span>
      </div>

      {/* Full number below */}
      <p className="text-[10px] text-slate-400 text-right mt-0.5">
        {formatPesoFull(total)}
      </p>
    </div>
  );
}
