"use client";

import { useEffect, useRef } from "react";

interface FloorData {
  floor: number;
  occupied: number;
}

interface BarChartProps {
  data: FloorData[];
  title: string;
}

export default function OccupiedUnitsBarChart({ data, title }: BarChartProps) {
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

    // Find max value for scaling
    const maxValue = Math.max(...data.map((d) => d.occupied), 5);
    const barWidth = chartWidth / data.length - 10;

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
    ctx.font = "12px sans-serif";
    ctx.textAlign = "right";
    for (let i = 0; i <= 4; i++) {
      const value = Math.round((maxValue / 4) * i);
      const y = canvas.height - padding - (i / 4) * chartHeight;
      ctx.fillText(String(value), padding - 10, y + 4);
    }

    // Draw bars
    data.forEach((item, idx) => {
      const barHeight = (item.occupied / maxValue) * chartHeight;
      const x = padding + idx * (barWidth + 10) + 5;
      const y = canvas.height - padding - barHeight;

      // Bar
      ctx.fillStyle = "#3b82f6";
      ctx.fillRect(x, y, barWidth, barHeight);

      // Label
      ctx.fillStyle = "#374151";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        `Floor ${item.floor}`,
        x + barWidth / 2,
        canvas.height - padding + 15,
      );

      // Value on top of bar
      ctx.fillStyle = "#1f2937";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText(String(item.occupied), x + barWidth / 2, y - 5);
    });
  }, [data]);

  return (
    <div className="bg-white p-4 rounded border border-slate-200">
      <h3 className="font-semibold text-slate-900 mb-4">{title}</h3>
      <canvas ref={canvasRef} width={280} height={220} className="w-full" />
    </div>
  );
}
