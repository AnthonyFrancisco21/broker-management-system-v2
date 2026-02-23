"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface FloorData {
  floor: number;
  occupied: number;
}

interface BarChartProps {
  data: FloorData[];
  title: string;
}

export default function OccupiedUnitsBarChart({ data, title }: BarChartProps) {
  // Transform data for recharts
  const chartData = data.map((item) => ({
    name: `Floor ${item.floor}`,
    occupied: item.occupied,
  }));

  return (
    <div className="bg-white p-4 rounded border border-slate-200">
      <h3 className="font-semibold text-slate-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="occupied" fill="#3b82f6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
