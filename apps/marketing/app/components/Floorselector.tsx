"use client";

import { FLOORS } from "../lib/floorData";

interface FloorSelectorProps {
  selectedFloor: number | null;
  onSelectFloor: (floor: number) => void;
}

export default function FloorSelector({
  selectedFloor,
  onSelectFloor,
}: FloorSelectorProps) {
  const floorsDesc = [...FLOORS].reverse();

  return (
    <div className="flex flex-col w-full gap-2">
      <h3 className="font-['Cormorant_Garamond',_serif] text-[10px] tracking-[0.2em] text-[#B8975A] uppercase mb-4">
        Select Level
      </h3>
      {floorsDesc.map((f) => {
        const isSelected = selectedFloor === f.floor;
        return (
          <button
            key={f.floor}
            onClick={() => onSelectFloor(f.floor)}
            className={`w-full text-left px-4 py-3 border transition-all duration-300 ${
              isSelected
                ? "border-[#B8975A] bg-[#faf9f7] shadow-sm"
                : "border-transparent text-slate-500 hover:bg-[#faf9f7] hover:border-[#ece9e3]"
            }`}
          >
            <span
              className={`block font-['Cormorant_Garamond',_serif] text-lg ${isSelected ? "font-semibold text-slate-900" : ""}`}
            >
              {f.label}
            </span>
            <span
              className={`block text-xs font-sans mt-1 ${isSelected ? "text-[#B8975A]" : "text-slate-400"}`}
            >
              {f.totalSqm} sqm
            </span>
          </button>
        );
      })}
    </div>
  );
}
