// ─────────────────────────────────────────────────────────────────────────────
// PipelineChart.tsx
// ─────────────────────────────────────────────────────────────────────────────

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  CLIENT_STATUS_CONFIG,
  PIPELINE_STATUSES,
} from "../lib/dashboard.config";
import type { Client } from "../lib/dashboard.types";
import { Building2 } from "lucide-react";
import { EmptyState } from "./SectionCard";

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
// Typed manually — Recharts' TooltipProps generic does not surface `payload`
// and `label` as top-level props in all versions.

interface TooltipPayloadItem {
  value?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value ?? 0;
  return (
    <div className="bg-white border border-slate-200 shadow-lg rounded-xl px-4 py-3 text-left">
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-slate-900 tabular-nums leading-none">
        {val}
        <span className="text-sm font-normal text-slate-400 ml-1">
          client{val !== 1 ? "s" : ""}
        </span>
      </p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface PipelineChartProps {
  clients: Client[];
}

export function PipelineChart({ clients }: PipelineChartProps) {
  const data = PIPELINE_STATUSES.map((status) => ({
    name: CLIENT_STATUS_CONFIG[status].label,
    count: clients.filter((c) => c.clientStatus === status).length,
    color: CLIENT_STATUS_CONFIG[status].chartColor,
  }));

  const hasData = data.some((d) => d.count > 0);

  if (!hasData) {
    return (
      <EmptyState
        icon={<Building2 size={32} />}
        message="No clients in the pipeline yet"
      />
    );
  }

  return (
    <ResponsiveContainer width="100%" height={210}>
      <BarChart
        data={data}
        barCategoryGap="35%"
        margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#f1f5f9"
          vertical={false}
        />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#cbd5e1" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "#f8fafc", radius: 8 }}
        />
        <Bar dataKey="count" radius={[6, 6, 2, 2]} maxBarSize={56}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
