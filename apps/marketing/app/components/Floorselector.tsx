"use client";

import { FloorData } from "../lib/floorData";

interface Props {
  floors: FloorData[];
  selectedFloor: number | null;
  onSelect: (floor: number) => void;
}

export default function FloorSelector({
  floors,
  selectedFloor,
  onSelect,
}: Props) {
  const sorted = [...floors].sort((a, b) => b.floor - a.floor);

  return (
    <div className="flex flex-col w-full select-none">
      {/* Roof cap */}
      <div
        className="mx-3 h-3 rounded-t-lg"
        style={{ background: "#1A140A" }}
      />

      {/* Floor list */}
      <div className="mx-3 border-x" style={{ borderColor: "#3A2E1E" }}>
        {sorted.map((fd) => {
          const sel = selectedFloor === fd.floor;
          const avl = fd.units.filter((u) => u.status === "available").length;
          const tot = fd.units.length;
          const pct = Math.round((avl / tot) * 100);
          const barColor =
            pct > 66 ? "#5E9432" : pct > 33 ? "#B8821E" : "#DC2626";

          return (
            <button
              key={fd.floor}
              onClick={() => onSelect(fd.floor)}
              className="relative w-full flex items-center justify-between px-3 py-2.5 text-left group transition-colors duration-100"
              style={{
                background: sel ? "#1A140A" : undefined,
                borderLeft: sel ? "3px solid #B8975A" : "3px solid transparent",
                borderBottom: "1px solid #2E2416",
              }}
            >
              {/* Hover bg */}
              {!sel && (
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ background: "#F5F2EC" }}
                />
              )}

              <div className="relative z-10 flex flex-col">
                <span
                  className="font-bold text-[13px] leading-none tracking-wide"
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    color: sel ? "#B8975A" : "#7A6E5A",
                  }}
                >
                  {fd.floor === 1 ? "UG" : `${fd.floor}F`}
                </span>
                <span
                  className="text-[9px] tracking-widest uppercase mt-0.5"
                  style={{ color: sel ? "#C8A870" : "#9A8E7A" }}
                >
                  {fd.label}
                </span>
              </div>

              <div className="relative z-10 flex flex-col items-end gap-1">
                <span
                  className="text-[11px] font-semibold"
                  style={{ color: sel ? "#B8975A" : "#8A7E6A" }}
                >
                  {avl}/{tot}
                </span>
                <div
                  className="w-10 h-1.5 rounded-full overflow-hidden"
                  style={{ background: "#2E2416" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: barColor }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Ground cap */}
      <div
        className="mx-3 h-4 rounded-b-lg"
        style={{ background: "#1A140A" }}
      />

      <p
        className="mt-2 text-center text-[9px] tracking-[0.22em] uppercase text-slate-400"
        style={{ fontFamily: "'Cormorant Garamond',serif" }}
      >
        Ground Level
      </p>
    </div>
  );
}
