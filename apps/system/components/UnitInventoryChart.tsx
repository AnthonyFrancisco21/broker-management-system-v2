// ─────────────────────────────────────────────────────────────────────────────
// UnitInventoryChart.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { UNIT_STATUS_CONFIG } from "../lib/dashboard.config";
import type { Unit, UnitStatus } from "../lib/dashboard.types";
import { Building2 } from "lucide-react";
import { EmptyState } from "./SectionCard";

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
// Typed manually — Recharts' TooltipProps generic does not surface `payload`
// and `label` as top-level props in all versions.

interface TooltipPayloadItem {
  name?: string;
  value?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-white border border-slate-200 shadow-lg rounded-xl px-3 py-2 text-left">
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

// ─── Component ────────────────────────────────────────────────────────────────

interface UnitInventoryChartProps {
  units: Unit[];
}

export function UnitInventoryChart({ units }: UnitInventoryChartProps) {
  const statusCounts = units.reduce<Record<string, number>>((acc, u) => {
    acc[u.unitStatus] = (acc[u.unitStatus] ?? 0) + 1;
    return acc;
  }, {});

  const data = (Object.keys(statusCounts) as UnitStatus[]).map((status) => ({
    name: UNIT_STATUS_CONFIG[status]?.label ?? status,
    value: statusCounts[status],
    color: UNIT_STATUS_CONFIG[status]?.chartColor ?? "#cbd5e1",
  }));

  if (data.length === 0 || units.length === 0) {
    return (
      <EmptyState
        icon={<Building2 size={28} />}
        message="No unit data yet"
        height="h-[190px]"
      />
    );
  }

  return (
    <div>
      {/* Donut */}
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={48}
            outerRadius={70}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
            startAngle={90}
            endAngle={-270}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Custom legend */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-1">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5 min-w-0">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: entry.color }}
            />
            <span className="text-xs text-slate-500 truncate">
              {entry.name}
            </span>
            <span className="text-xs font-semibold text-slate-700 ml-auto tabular-nums">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
