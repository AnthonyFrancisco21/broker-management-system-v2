// ─────────────────────────────────────────────────────────────────────────────
// components/ConversionFunnelChart.tsx
// Horizontal funnel showing client count + % at each stage with drop-off rates.
// Unique to Statistics — dashboard only shows raw counts per stage.
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { Users } from "lucide-react";
import type { FunnelStage } from "../lib/useStatisticsData";

interface ConversionFunnelChartProps {
  stages: FunnelStage[];
  totalRejected: number;
}

export function ConversionFunnelChart({
  stages,
  totalRejected,
}: ConversionFunnelChartProps) {
  const maxCount = Math.max(...stages.map((s) => s.count), 1);
  const hasData = stages.some((s) => s.count > 0);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-slate-300 gap-2">
        <Users size={28} />
        <p className="text-sm">No client data yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {stages.map((stage, i) => {
        const barWidth =
          stage.count > 0 ? Math.max((stage.count / maxCount) * 100, 5) : 0;

        return (
          <div key={stage.key}>
            {/* Drop-off connector between stages */}
            {i > 0 && stage.dropOffPct > 0 && (
              <div className="flex items-center gap-2 py-1 ml-[7.5rem]">
                <div className="w-px h-3 bg-slate-200" />
                <span className="text-[10px] font-semibold text-slate-400">
                  {stage.dropOffPct}% converted from previous
                </span>
              </div>
            )}

            <div className="flex items-center gap-3">
              {/* Label */}
              <div className="w-28 shrink-0 text-right">
                <span className="text-xs font-medium text-slate-500">
                  {stage.label}
                </span>
              </div>

              {/* Bar */}
              <div className="flex-1 h-8 bg-slate-50 rounded-lg overflow-hidden">
                <div
                  className="h-full rounded-lg flex items-center pl-3 transition-all duration-700"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: stage.color,
                    minWidth: stage.count > 0 ? "2.5rem" : "0",
                  }}
                >
                  {stage.count > 0 && (
                    <span className="text-white text-xs font-bold tabular-nums drop-shadow-sm">
                      {stage.count}
                    </span>
                  )}
                </div>
              </div>

              {/* Percentage */}
              <div className="w-10 shrink-0 text-right">
                <span className="text-xs font-semibold text-slate-700 tabular-nums">
                  {stage.pct}%
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Rejected — outside the funnel flow, shown as loss */}
      {totalRejected > 0 && (
        <div className="mt-4 pt-4 border-t border-dashed border-slate-100 flex items-center gap-3">
          <div className="w-28 shrink-0 text-right">
            <span className="text-xs font-medium text-rose-400">Rejected</span>
          </div>
          <div className="flex-1 h-6 bg-rose-50 rounded-lg overflow-hidden">
            <div
              className="h-full bg-rose-300 rounded-lg flex items-center pl-3 transition-all duration-700"
              style={{
                width: `${Math.max((totalRejected / maxCount) * 100, 5)}%`,
              }}
            >
              <span className="text-white text-xs font-bold tabular-nums">
                {totalRejected}
              </span>
            </div>
          </div>
          <div className="w-10 shrink-0 text-right">
            <span className="text-xs font-medium text-rose-400">lost</span>
          </div>
        </div>
      )}
    </div>
  );
}
