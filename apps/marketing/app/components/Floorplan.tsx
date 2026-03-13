"use client";

import React, { useState } from "react";
import {
  Unit,
  FloorData,
  UnitType,
  UnitStatus,
  UNIT_SPECS,
} from "../lib/floorData";

interface FloorPlanProps {
  floorData: FloorData;
  onUnitClick: (unit: Unit) => void;
}

// ─── Unit Color Theme ─────────────────────────────────────────────────────────
const THEME: Record<UnitType, { fill: string; stroke: string; text: string }> =
  {
    "S-24": {
      fill: "rgba(168, 203, 232, 0.5)",
      stroke: "#4A7EA0",
      text: "#1A3554",
    },
    "S-28": {
      fill: "rgba(248, 206, 143, 0.5)",
      stroke: "#B8821E",
      text: "#5A2E00",
    },
    "S-36": {
      fill: "rgba(190, 221, 154, 0.5)",
      stroke: "#5E9432",
      text: "#233E09",
    },
    "S-40": {
      fill: "rgba(245, 168, 74, 0.5)",
      stroke: "#B05E0A",
      text: "#4A2000",
    },
  };

const STATUS_THEME: Record<UnitStatus, { fill: string; stroke: string }> = {
  available: { fill: "transparent", stroke: "transparent" },
  reserved: { fill: "rgba(254, 243, 199, 0.7)", stroke: "#D97706" },
  sold: { fill: "rgba(254, 226, 226, 0.8)", stroke: "#DC2626" },
};

// ─── Perfect 1:1 Pixel Coordinate System (Based on 1216x2000 grid) ────────────
const ROOMS = [
  // WING — green S-36 rooms
  {
    key: "w36c",
    rmNum: 10,
    type: "S-36" as UnitType,
    x: 260,
    y: 205,
    w: 100,
    h: 317,
  },
  {
    key: "w36a",
    rmNum: 18,
    type: "S-36" as UnitType,
    x: 365,
    y: 205,
    w: 100,
    h: 317,
  },
  {
    key: "w36b",
    rmNum: 17,
    type: "S-36" as UnitType,
    x: 465,
    y: 205,
    w: 105,
    h: 317,
  },

  // WING — orange S-40
  {
    key: "w40",
    rmNum: 16,
    type: "S-40" as UnitType,
    x: 769,
    y: 295,
    w: 210,
    h: 120,
  },

  // RIGHT COL — RM15 S-24 (below S-40, above row-0)
  {
    key: "rm15",
    rmNum: 15,
    type: "S-24" as UnitType,
    x: 810,
    y: 420,
    w: 170,
    h: 102,
  },

  // LEFT COL — S-28 rows 0-6
  {
    key: "rm13",
    rmNum: 13,
    type: "S-28" as UnitType,
    x: 563,
    y: 522,
    w: 198,
    h: 102,
  },
  {
    key: "rm11",
    rmNum: 11,
    type: "S-28" as UnitType,
    x: 563,
    y: 624,
    w: 198,
    h: 105,
  },
  {
    key: "rm09",
    rmNum: 9,
    type: "S-28" as UnitType,
    x: 563,
    y: 729,
    w: 198,
    h: 102,
  },
  {
    key: "rm07",
    rmNum: 7,
    type: "S-28" as UnitType,
    x: 563,
    y: 831,
    w: 198,
    h: 104,
  },
  {
    key: "rm05",
    rmNum: 5,
    type: "S-28" as UnitType,
    x: 563,
    y: 935,
    w: 198,
    h: 103,
  },
  {
    key: "rm03",
    rmNum: 3,
    type: "S-28" as UnitType,
    x: 563,
    y: 1038,
    w: 198,
    h: 118,
  },
  {
    key: "rm02",
    rmNum: 2,
    type: "S-28" as UnitType,
    x: 563,
    y: 1156,
    w: 198,
    h: 88,
  },

  // RIGHT COL — S-24 rows 0-4
  {
    key: "rm14",
    rmNum: 14,
    type: "S-24" as UnitType,
    x: 810,
    y: 522,
    w: 170,
    h: 102,
  },
  {
    key: "rm12",
    rmNum: 12,
    type: "S-24" as UnitType,
    x: 810,
    y: 624,
    w: 170,
    h: 105,
  },
  {
    key: "rm10",
    rmNum: 10,
    type: "S-24" as UnitType,
    x: 810,
    y: 729,
    w: 170,
    h: 102,
  },
  {
    key: "rm08",
    rmNum: 8,
    type: "S-24" as UnitType,
    x: 810,
    y: 831,
    w: 170,
    h: 104,
  },
  {
    key: "rm06",
    rmNum: 6,
    type: "S-24" as UnitType,
    x: 810,
    y: 935,
    w: 170,
    h: 103,
  },

  // RIGHT COL — RM04 S-28 (row 5, amber)
  {
    key: "rm04",
    rmNum: 4,
    type: "S-28" as UnitType,
    x: 810,
    y: 1048,
    w: 170,
    h: 120,
  },

  // BOTTOM — S-36c RM01 (spans left col + pullway)
  {
    key: "rm01",
    rmNum: 1,
    type: "S-36" as UnitType,
    x: 573,
    y: 1270,
    w: 186,
    h: 106,
  },
];

export default function FloorPlan({ floorData, onUnitClick }: FloorPlanProps) {
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);

  // Map roomNumber string -> Unit object for fast lookup
  const byRmNum = new Map<string, Unit>();
  for (const u of floorData.units) byRmNum.set(u.roomNumber.slice(-2), u);

  function getUnit(rm: (typeof ROOMS)[0]): Unit | undefined {
    const pad = String(rm.rmNum).padStart(2, "0");
    if (rm.key === "w36c" || rm.key === "rm10") {
      return floorData.units.find(
        (u) => u.roomNumber.endsWith(pad) && u.type === rm.type,
      );
    }
    return byRmNum.get(pad);
  }

  const stats = {
    total: floorData.units.length,
    available: floorData.units.filter((u) => u.status === "available").length,
    reserved: floorData.units.filter((u) => u.status === "reserved").length,
    sold: floorData.units.filter((u) => u.status === "sold").length,
  };

  return (
    <div className="w-full flex flex-col gap-5 fade-up">
      {/* ── Legend ── */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
        {(["S-24", "S-28", "S-36", "S-40"] as UnitType[]).map((t) => (
          <div key={t} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-sm border-2 shrink-0"
              style={{
                background: THEME[t].fill.replace("0.5", "1"),
                borderColor: THEME[t].stroke,
              }}
            />
            <span
              className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase"
              style={{ fontFamily: "'Cormorant Garamond',serif" }}
            >
              {t} · {UNIT_SPECS[t].sqm}m²
            </span>
          </div>
        ))}
        {[
          { lbl: "Reserved", bg: "#FEF3C7", br: "#D97706" },
          { lbl: "Sold", bg: "#FEE2E2", br: "#DC2626" },
        ].map((l) => (
          <div key={l.lbl} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-sm border-2 shrink-0"
              style={{ background: l.bg, borderColor: l.br }}
            />
            <span
              className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase"
              style={{ fontFamily: "'Cormorant Garamond',serif" }}
            >
              {l.lbl}
            </span>
          </div>
        ))}
      </div>

      {/* ── Interactive Image Overlay ── */}
      <div
        className="w-full max-w-[800px] mx-auto shadow-lg rounded-sm overflow-hidden relative"
        style={{ border: "2px solid #C8C0B0", background: "#FFFFFF" }}
      >
        {/* Standard HTML Img Tag for crisp rendering */}
        <img
          src="../../floor-plan-tempt-no-legend.png"
          alt="Floor Plan"
          className="w-full h-auto block relative z-0"
        />

        {/* Absolute SVG perfectly layered on top */}
        <svg
          viewBox="0 0 1216 2000" // Matches the exact native pixel dimensions of the image
          className="absolute inset-0 w-full h-full z-10"
          style={{ pointerEvents: "none" }} // Lets you click through to nothing if you miss a room
        >
          {/* Interactive Unit Polygons */}
          {ROOMS.map((rm) => {
            const unit = getUnit(rm);
            const status: UnitStatus = unit?.status ?? "available";
            const isHovered = hoveredRoom === rm.key;
            const isAvailable = status === "available";

            // Determine rendering colors
            let fillColor = STATUS_THEME[status].fill;
            let strokeColor = STATUS_THEME[status].stroke;

            // Apply brand tint if hovered and available
            if (isAvailable && isHovered) {
              fillColor = THEME[rm.type].fill;
              strokeColor = THEME[rm.type].stroke;
            }

            return (
              <g
                key={rm.key}
                onClick={() => unit && onUnitClick(unit)}
                onMouseEnter={() => setHoveredRoom(rm.key)}
                onMouseLeave={() => setHoveredRoom(null)}
                style={{
                  cursor: isAvailable ? "pointer" : "not-allowed",
                  transition: "all 0.2s ease",
                  pointerEvents: "auto", // Re-enable pointer events just for the rooms
                }}
              >
                {/* Highlight Outline when hovered */}
                {isHovered && isAvailable && (
                  <rect
                    x={rm.x - 3}
                    y={rm.y - 3}
                    width={rm.w + 6}
                    height={rm.h + 6}
                    fill="none"
                    stroke={THEME[rm.type].stroke}
                    strokeWidth={8}
                    opacity={0.5}
                    rx={4}
                  />
                )}

                {/* Main Interactive Rectangle overlaying the room */}
                <rect
                  x={rm.x}
                  y={rm.y}
                  width={rm.w}
                  height={rm.h}
                  fill={fillColor}
                  stroke={strokeColor || "transparent"}
                  strokeWidth={isHovered ? 4 : 0}
                  style={{ transition: "fill 0.2s, stroke 0.2s" }}
                />

                {/* Diagonal lines for Sold units */}
                {status === "sold" && (
                  <>
                    <line
                      x1={rm.x}
                      y1={rm.y}
                      x2={rm.x + rm.w}
                      y2={rm.y + rm.h}
                      stroke="#DC2626"
                      strokeWidth={4}
                      opacity={0.6}
                    />
                    <line
                      x1={rm.x + rm.w}
                      y1={rm.y}
                      x2={rm.x}
                      y2={rm.y + rm.h}
                      stroke="#DC2626"
                      strokeWidth={4}
                      opacity={0.6}
                    />
                  </>
                )}

                {/* Floating Room Label (Visible on hover or if unavailable) */}
                <g
                  style={{
                    opacity: isHovered || status !== "available" ? 1 : 0,
                    transition: "opacity 0.2s",
                  }}
                >
                  <rect
                    x={rm.x + rm.w / 2 - 55}
                    y={rm.y + rm.h / 2 - 25}
                    width={110}
                    height={50}
                    fill="rgba(255, 255, 255, 0.95)"
                    rx={6}
                    stroke={strokeColor || "#E8E4DA"}
                    strokeWidth={2}
                    style={{ pointerEvents: "none" }}
                  />
                  <text
                    x={rm.x + rm.w / 2}
                    y={rm.y + rm.h / 2 - 3}
                    textAnchor="middle"
                    style={{
                      fontFamily: "'Cormorant Garamond',serif",
                      fontSize: "18px",
                      fontWeight: 700,
                      fill: THEME[rm.type].text,
                      pointerEvents: "none",
                    }}
                  >
                    {rm.type}
                  </text>
                  <text
                    x={rm.x + rm.w / 2}
                    y={rm.y + rm.h / 2 + 15}
                    textAnchor="middle"
                    style={{
                      fontFamily: "sans-serif",
                      fontSize: "12px",
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                      fill: "#64748B",
                      pointerEvents: "none",
                    }}
                  >
                    RM {String(rm.rmNum).padStart(2, "0")}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* ── Dynamic Stats Bar ── */}
      <div className="flex justify-center border-t border-[#EAE5DA] pt-4 mt-2">
        {[
          { label: "Total", value: stats.total, cls: "text-slate-800" },
          {
            label: "Available",
            value: stats.available,
            cls: "text-emerald-700",
          },
          { label: "Reserved", value: stats.reserved, cls: "text-amber-600" },
          { label: "Sold", value: stats.sold, cls: "text-red-600" },
        ].map(({ label, value, cls }, i, arr) => (
          <div
            key={label}
            className={`text-center px-6 ${i !== arr.length - 1 ? "border-r border-[#EAE5DA]" : ""}`}
          >
            <p
              className={`font-['Cormorant_Garamond',_serif] text-2xl font-bold leading-none ${cls}`}
            >
              {value}
            </p>
            <p className="text-[10px] tracking-[0.16em] text-slate-400 uppercase mt-1">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
