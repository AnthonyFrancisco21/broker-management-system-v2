"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface UnitStatusPieChartProps {
  data: { name: string; value: number }[];
  title: string;
}

// Colors aligned with Tailwind UI colors
const COLORS: Record<string, string> = {
  Available: "#10b981", // Emerald
  Viewing: "#a855f7", // Purple
  Reserved: "#f59e0b", // Amber
  "Under Nego": "#f97316", // Orange
  Occupied: "#3b82f6", // Blue
};

export default function UnitStatusPieChart({
  data,
  title,
}: UnitStatusPieChartProps) {
  // Filter out empty data to keep chart clean
  const chartData = data.filter((d) => d.value > 0);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
      <div className="mb-4">
        <h3 className="font-bold text-slate-800">{title}</h3>
        <p className="text-xs text-slate-500">Current breakdown of all units</p>
      </div>
      <div className="flex-1 min-h-[300px]">
        {chartData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.name] || "#cbd5e1"}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
