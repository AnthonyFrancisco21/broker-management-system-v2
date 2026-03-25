// ─────────────────────────────────────────────────────────────────────────────
// components/MonthlyTrendChart.tsx
// Replaces SalesGrowthLineChart — correct tooltip typing, cleaner styles.
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import type { MonthlyPoint } from "../lib/useStatisticsData";

interface TooltipPayload {
  name?: string;
  value?: number;
  color?: string;
}
interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 shadow-lg rounded-xl px-4 py-3">
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
        {label}
      </p>
      {payload.map((item) => (
        <div key={item.name} className="flex items-center gap-2 mb-1 last:mb-0">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: item.color }}
          />
          <span className="text-xs text-slate-500">{item.name}:</span>
          <span className="text-sm font-bold text-slate-900 tabular-nums">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

interface MonthlyTrendChartProps {
  data: MonthlyPoint[];
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  const hasData = data.some((d) => d.newClients > 0 || d.closed > 0);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-56 text-slate-300 gap-2">
        <TrendingUp size={28} />
        <p className="text-sm">No trend data yet</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart
        data={data}
        margin={{ top: 8, right: 16, left: -16, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#f1f5f9"
          vertical={false}
        />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          dy={8}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#cbd5e1" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="top"
          height={32}
          iconType="circle"
          iconSize={8}
          formatter={(v) => (
            <span style={{ fontSize: 11, color: "#64748b" }}>{v}</span>
          )}
        />
        <Line
          name="New Clients"
          type="monotone"
          dataKey="newClients"
          stroke="#94a3b8"
          strokeWidth={2.5}
          dot={{ fill: "#94a3b8", r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6, strokeWidth: 0 }}
        />
        <Line
          name="Closed Deals"
          type="monotone"
          dataKey="closed"
          stroke="#10b981"
          strokeWidth={2.5}
          dot={{ fill: "#10b981", r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
