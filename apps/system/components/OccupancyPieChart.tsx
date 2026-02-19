"use client";

import { useEffect, useRef } from "react";

interface PieChartProps {
  occupied: number;
  available: number;
  title: string;
}

export default function OccupancyPieChart({
  occupied,
  available,
  title,
}: PieChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 60;
    const total = occupied + available;

    if (total === 0) {
      ctx.fillStyle = "#e2e8f0";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const occupiedRatio = occupied / total;
    const occupiedAngle = occupiedRatio * 2 * Math.PI;

    // Occupied slice (blue)
    ctx.fillStyle = "#3b82f6";
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, 0, occupiedAngle);
    ctx.lineTo(centerX, centerY);
    ctx.fill();

    // Available slice (green)
    ctx.fillStyle = "#10b981";
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, occupiedAngle, 2 * Math.PI);
    ctx.lineTo(centerX, centerY);
    ctx.fill();

    // Border
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();

    // Legend
    const legendY = canvas.height - 25;
    ctx.fillStyle = "#1f2937";
    ctx.font = "12px sans-serif";

    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(20, legendY, 12, 12);
    ctx.fillStyle = "#374151";
    ctx.fillText(`Occupied: ${occupied}`, 36, legendY + 10);

    ctx.fillStyle = "#10b981";
    ctx.fillRect(150, legendY, 12, 12);
    ctx.fillStyle = "#374151";
    ctx.fillText(`Available: ${available}`, 166, legendY + 10);
  }, [occupied, available]);

  return (
    <div className="bg-white p-4 rounded border border-slate-200">
      <h3 className="font-semibold text-slate-900 mb-4">{title}</h3>
      <canvas ref={canvasRef} width={280} height={220} className="w-full" />
    </div>
  );
}
