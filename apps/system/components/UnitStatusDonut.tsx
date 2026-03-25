// ─────────────────────────────────────────────────────────────────────────────
// components/UnitStatusDonut.tsx
// Donut + inline legend. Replaces UnitStatusPieChart with correct tooltip typing.
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Building2 } from "lucide-react";
import type { UnitStatusSlice } from "../lib/useStatisticsData";

interface TooltipPayload {
  name?: string;
  value?: number;
}
interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-white border border-slate-200 shadow-lg rounded-xl px-3 py-2">
      <p className="text-xs font-semibold text-slate-700">{name}</p>
      <p className="text-xl font-bold text-slate-900 tabular-nums">
        {value}
        <span className="text-xs font-normal text-slate-400 ml-1">
          unit{Number(value) !== 1 ? "s" : ""}
        </span>
      </p>
    </div>
  );
}

interface UnitStatusDonutProps {
  slices: UnitStatusSlice[];
}

export function UnitStatusDonut({ slices }: UnitStatusDonutProps) {
  const data = slices.filter((s) => s.count > 0);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-slate-300 gap-2">
        <Building2 size={28} />
        <p className="text-sm">No unit data yet</p>
      </div>
    );
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={46}
            outerRadius={68}
            paddingAngle={3}
            strokeWidth={0}
            startAngle={90}
            endAngle={-270}
          >
            {data.map((entry) => (
              <Cell key={entry.status} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2">
        {data.map((entry) => (
          <div key={entry.status} className="flex items-center gap-1.5 min-w-0">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: entry.color }}
            />
            <span className="text-xs text-slate-500 truncate">
              {entry.label}
            </span>
            <span className="text-xs font-semibold text-slate-700 ml-auto tabular-nums">
              {entry.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
