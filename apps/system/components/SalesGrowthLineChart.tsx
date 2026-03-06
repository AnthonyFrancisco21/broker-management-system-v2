"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface MonthlyData {
  month: string;
  leads: number;
  closed: number;
}

interface LineChartProps {
  data: MonthlyData[];
  title: string;
}

export default function SalesGrowthLineChart({ data, title }: LineChartProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
      <div className="mb-6">
        <h3 className="font-bold text-slate-800">{title}</h3>
        <p className="text-xs text-slate-500">
          Tracking new leads acquired vs. successful deals closed over 6 months
        </p>
      </div>
      <div className="flex-1 min-h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e2e8f0"
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              wrapperStyle={{ fontSize: "12px" }}
            />

            {/* New Leads Line */}
            <Line
              name="New Leads (Prospects)"
              type="monotone"
              dataKey="leads"
              stroke="#94a3b8"
              strokeWidth={3}
              dot={{ fill: "#94a3b8", r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />

            {/* Closed Deals Line */}
            <Line
              name="Closed Deals (Success)"
              type="monotone"
              dataKey="closed"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: "#10b981", r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
