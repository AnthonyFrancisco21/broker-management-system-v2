"use client";

import { useState } from "react";
import {
  Unit,
  FloorData,
  UNIT_SPECS,
  UnitType,
  UnitStatus,
} from "../lib/floorData";

interface FloorPlanProps {
  floorData: FloorData;
  onUnitClick: (unit: Unit) => void;
}

// STRICT TYPING: Ensures every status has a color
const STATUS_COLORS: Record<
  UnitStatus,
  { fill: string; stroke: string; text: string }
> = {
  available: { fill: "", stroke: "", text: "" },
  reserved: { fill: "#FEF3C7", stroke: "#D97706", text: "#92400E" },
  sold: { fill: "#FEE2E2", stroke: "#DC2626", text: "#991B1B" },
};

// STRICT TYPING: Ensures every unit type has a color
const TYPE_COLORS: Record<
  UnitType,
  { fill: string; stroke: string; text: string }
> = {
  "S-24": { fill: "#BFDBFE", stroke: "#3B82F6", text: "#1E40AF" },
  "S-28": { fill: "#FDE68A", stroke: "#D97706", text: "#92400E" },
  "S-36": { fill: "#BBF7D0", stroke: "#16A34A", text: "#14532D" },
  "S-40": { fill: "#FED7AA", stroke: "#EA580C", text: "#7C2D12" },
  "S-75": { fill: "#DDD6FE", stroke: "#7C3AED", text: "#4C1D95" },
};

export default function FloorPlan({ floorData, onUnitClick }: FloorPlanProps) {
  const [hoveredUnit, setHoveredUnit] = useState<string | null>(null);

  const getUnitColors = (unit: Unit) => {
    if (unit.status !== "available") {
      return STATUS_COLORS[unit.status];
    }
    return TYPE_COLORS[unit.type];
  };

  // Define the types we want to show in the legend
  const legendTypes: UnitType[] = ["S-24", "S-28", "S-36", "S-40"];

  return (
    <div className="w-full relative">
      {/* Legend */}
      <div className="flex flex-wrap gap-5 justify-center mb-6">
        {legendTypes.map((type) => {
          const colors = TYPE_COLORS[type];
          return (
            <div key={type} className="flex items-center gap-2">
              <div
                className="w-3.5 h-3.5"
                style={{
                  background: colors.fill,
                  border: `2px solid ${colors.stroke}`,
                }}
              />
              <span className="font-['Cormorant_Garamond',_serif] text-xs tracking-[0.12em] text-slate-600 uppercase">
                {type} · {UNIT_SPECS[type].sqm}sqm
              </span>
            </div>
          );
        })}

        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 bg-amber-100 border-2 border-amber-600" />
          <span className="font-['Cormorant_Garamond',_serif] text-xs tracking-[0.12em] text-slate-600 uppercase">
            Reserved
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 bg-red-100 border-2 border-red-600" />
          <span className="font-['Cormorant_Garamond',_serif] text-xs tracking-[0.12em] text-slate-600 uppercase">
            Sold
          </span>
        </div>
      </div>

      {/* SVG Floor Plan */}
      <div className="max-w-[640px] mx-auto relative">
        <svg
          viewBox="0 -10 580 850"
          className="w-full border border-[#e8e2d8] bg-[#fdfcfa]"
        >
          <rect
            x="36"
            y="50"
            width="492"
            height="770"
            fill="#f5f3ef"
            stroke="#c8bfae"
            strokeWidth="2"
            rx="1"
          />
          <rect
            x="305"
            y="140"
            width="108"
            height="560"
            fill="#ede8e0"
            stroke="#c8bfae"
            strokeWidth="1"
          />
          <text
            x="359"
            y="430"
            textAnchor="middle"
            className="font-sans text-[10px] fill-slate-400 tracking-[3px]"
            transform="rotate(-90, 359, 430)"
          >
            PULLWAY
          </text>
          <rect
            x="305"
            y="50"
            width="108"
            height="90"
            fill="#e8e2d6"
            stroke="#c8bfae"
            strokeWidth="1"
          />
          <line
            x1="313"
            y1="58"
            x2="405"
            y2="132"
            stroke="#c8bfae"
            strokeWidth="1.5"
          />
          <line
            x1="405"
            y1="58"
            x2="313"
            y2="132"
            stroke="#c8bfae"
            strokeWidth="1.5"
          />
          <rect
            x="420"
            y="720"
            width="108"
            height="100"
            fill="#e8e2d6"
            stroke="#c8bfae"
            strokeWidth="1"
          />
          <line
            x1="428"
            y1="728"
            x2="520"
            y2="812"
            stroke="#c8bfae"
            strokeWidth="1.5"
          />
          <line
            x1="520"
            y1="728"
            x2="428"
            y2="812"
            stroke="#c8bfae"
            strokeWidth="1.5"
          />

          {floorData.floor === 1 && (
            <>
              <rect
                x="36"
                y="200"
                width="148"
                height="480"
                fill="#BAE6FD"
                stroke="#0EA5E9"
                strokeWidth="1.5"
                rx="1"
              />
              <text
                x="110"
                y="450"
                textAnchor="middle"
                className="font-['Cormorant_Garamond',_serif] text-[13px] fill-sky-700 tracking-widest"
              >
                POOL
              </text>
            </>
          )}

          <text
            x="290"
            y="830"
            textAnchor="middle"
            className="font-['Cormorant_Garamond',_serif] text-[11px] fill-slate-400 tracking-[4px] uppercase"
          >
            {floorData.floor === 1
              ? "UPPER GROUND LEVEL"
              : `TYPICAL PLAN · FLOOR ${floorData.floor}`}
          </text>

          {floorData.units.map((unit: Unit) => {
            const colors = getUnitColors(unit);
            const isHovered = hoveredUnit === unit.id;
            const isAvailable = unit.status === "available";
            const { x, y, width, height } = unit.position;

            return (
              <g
                key={unit.id}
                onClick={() => onUnitClick(unit)}
                onMouseEnter={() => setHoveredUnit(unit.id)}
                onMouseLeave={() => setHoveredUnit(null)}
                className={isAvailable ? "cursor-pointer" : "cursor-default"}
              >
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  fill={isHovered ? colors.stroke : colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  className="transition-all duration-150 ease-in-out"
                  rx="1"
                />
                <text
                  x={x + width / 2}
                  y={y + height / 2 - 8}
                  textAnchor="middle"
                  className={`font-['Cormorant_Garamond',_serif] ${width < 90 ? "text-[10px]" : "text-[11px]"} font-bold tracking-wide transition-colors duration-150`}
                  fill={isHovered ? "#fff" : colors.text}
                >
                  {unit.type}
                </text>
                <text
                  x={x + width / 2}
                  y={y + height / 2 + 10}
                  textAnchor="middle"
                  className={`font-['Cormorant_Garamond',_serif] ${width < 90 ? "text-[9px]" : "text-[10px]"} tracking-wide transition-colors duration-150`}
                  fill={isHovered ? "rgba(255,255,255,0.85)" : "#64748b"}
                >
                  RM {unit.roomNumber}
                </text>

                {unit.status === "sold" && (
                  <line
                    x1={x + 4}
                    y1={y + 4}
                    x2={x + width - 4}
                    y2={y + height - 4}
                    stroke="#DC2626"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                )}
              </g>
            );
          })}
        </svg>

        <div className="mt-4 pt-4 flex justify-center border-t border-[#ece9e3]">
          {[
            { label: "Total Units", value: floorData.units.length },
            {
              label: "Available",
              value: floorData.units.filter(
                (u: Unit) => u.status === "available",
              ).length,
            },
            {
              label: "Reserved",
              value: floorData.units.filter(
                (u: Unit) => u.status === "reserved",
              ).length,
            },
            {
              label: "Sold",
              value: floorData.units.filter((u: Unit) => u.status === "sold")
                .length,
            },
          ].map(({ label, value }, idx, arr) => (
            <div
              key={label}
              className={`text-center px-6 ${idx !== arr.length - 1 ? "border-r border-[#ece9e3]" : ""}`}
            >
              <p className="font-['Cormorant_Garamond',_serif] text-2xl font-semibold text-slate-900 leading-none">
                {value}
              </p>
              <p className="font-['Cormorant_Garamond',_serif] text-[10px] tracking-[0.18em] text-slate-400 uppercase mt-1">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
