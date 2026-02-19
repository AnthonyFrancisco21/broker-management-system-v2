"use client";

import { useEffect, useRef } from "react";

interface LinePoint {
  month: string;
  sales: number;
}

interface LineChartProps {
  data: LinePoint[];
  title: string;
}

export default function SalesGrowthLineChart({ data, title }: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;

    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (data.length === 0) return;

    // Find max value for scaling
    const maxValue = Math.max(...data.map((d) => d.sales), 10);

    // Draw axes
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Draw Y-axis labels
    ctx.fillStyle = "#64748b";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "right";
    for (let i = 0; i <= 4; i++) {
      const value = Math.round((maxValue / 4) * i);
      const y = canvas.height - padding - (i / 4) * chartHeight;
      ctx.fillText(String(value), padding - 10, y + 4);
    }

    // Draw grid lines
    ctx.strokeStyle = "#f1f5f9";
    ctx.lineWidth = 0.5;
    for (let i = 1; i < 4; i++) {
      const y = canvas.height - padding - (i / 4) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
    }

    // Calculate point positions
    const points: { x: number; y: number }[] = [];
    const pointSpacing = chartWidth / (data.length - 1 || 1);

    data.forEach((item, idx) => {
      const x = padding + idx * pointSpacing;
      const y = canvas.height - padding - (item.sales / maxValue) * chartHeight;
      points.push({ x, y });
    });

    // Draw line
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.beginPath();
    points.forEach((point, idx) => {
      if (idx === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();

    // Draw points and labels
    ctx.fillStyle = "#3b82f6";
    data.forEach((item, idx) => {
      const point = points[idx];

      // Draw dot
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
      ctx.fill();

      // Draw X-axis label
      ctx.fillStyle = "#374151";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(item.month, point.x, canvas.height - padding + 15);

      // Draw value above point
      ctx.fillStyle = "#1f2937";
      ctx.font = "bold 10px sans-serif";
      ctx.fillText(String(item.sales), point.x, point.y - 10);

      ctx.fillStyle = "#3b82f6";
    });
  }, [data]);

  return (
    <div className="bg-white p-4 rounded border border-slate-200">
      <h3 className="font-semibold text-slate-900 mb-4">{title}</h3>
      <canvas ref={canvasRef} width={280} height={220} className="w-full" />
    </div>
  );
}
