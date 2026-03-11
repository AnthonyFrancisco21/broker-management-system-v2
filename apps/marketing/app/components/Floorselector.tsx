"use client";

interface FloorSelectorProps {
  selectedFloor: number | null;
  onSelectFloor: (floor: number) => void;
}

const FLOOR_META: Record<
  1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
  { code: string; name: string }
> = {
  1: { code: "UG", name: "Upper Ground" },
  2: { code: "2F", name: "Floor 2" },
  3: { code: "3F", name: "Floor 3" },
  4: { code: "4F", name: "Floor 4" },
  5: { code: "5F", name: "Floor 5" },
  6: { code: "6F", name: "Floor 6" },
  7: { code: "7F", name: "Floor 7" },
  8: { code: "8F", name: "Floor 8" },
  9: { code: "9F", name: "Floor 9" },
  10: { code: "10F", name: "Floor 10" },
};

export default function FloorSelector({
  selectedFloor,
  onSelectFloor,
}: FloorSelectorProps) {
  return (
    <div className="w-full select-none">
      {/* Header */}
      <div className="mb-4 text-center">
        <p className="font-['Cormorant_Garamond',_serif] text-[9px] tracking-[0.3em] text-[#B8975A] uppercase mb-1">
          Level
        </p>
        <p className="font-['Cormorant_Garamond',_serif] text-lg font-light text-slate-700">
          {selectedFloor
            ? FLOOR_META[
                selectedFloor as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
              ].name
            : "Select Floor"}
        </p>
      </div>

      {/* Roof cap */}
      <div className="flex items-center gap-2 pb-1 border-b border-[#c8bfae]">
        <div className="flex-1 h-px bg-[#c8bfae]" />
        <span className="font-['Cormorant_Garamond',_serif] text-[8px] tracking-[0.25em] text-[#B8975A] uppercase">
          Roof
        </span>
        <div className="flex-1 h-px bg-[#c8bfae]" />
      </div>

      {/* Floor list — rendered top (10F) → bottom (UG) */}
      <div className="flex flex-col">
        {Array.from({ length: 10 }, (_, i) => 10 - i).map((n) => {
          const floor = n as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
          const { code, name } = FLOOR_META[floor];
          const isSelected = selectedFloor === floor;

          return (
            <button
              key={floor}
              onClick={() => onSelectFloor(floor)}
              className={`
                group relative flex items-center gap-2 px-3 py-[10px] w-full text-left
                border-b border-[#ece9e3] transition-colors duration-150
                ${
                  isSelected
                    ? "bg-[#1a1a1a]"
                    : "bg-transparent hover:bg-[#f5f3ef]"
                }
              `}
            >
              {/* Gold left accent bar */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-[3px] transition-opacity duration-150 ${
                  isSelected
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-40"
                }`}
                style={{ background: "#B8975A" }}
              />

              {/* Floor code */}
              <span
                className={`font-['Cormorant_Garamond',_serif] text-[11px] font-bold tracking-[0.1em] w-7 shrink-0 ${
                  isSelected ? "text-[#B8975A]" : "text-slate-400"
                }`}
              >
                {code}
              </span>

              {/* Floor name */}
              <span
                className={`font-['Cormorant_Garamond',_serif] text-[12px] tracking-[0.05em] flex-1 ${
                  isSelected ? "text-white" : "text-slate-500"
                }`}
              >
                {name}
              </span>

              {/* Selected dot */}
              <div
                className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-150 ${
                  isSelected
                    ? "bg-[#B8975A]"
                    : "bg-slate-200 group-hover:bg-slate-300"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Ground cap */}
      <div className="flex items-center gap-2 pt-1 border-t border-[#c8bfae]">
        <div className="flex-1 h-px bg-[#c8bfae]" />
        <span className="font-['Cormorant_Garamond',_serif] text-[8px] tracking-[0.25em] text-[#B8975A] uppercase">
          Ground
        </span>
        <div className="flex-1 h-px bg-[#c8bfae]" />
      </div>

      <p className="mt-4 text-center font-['Cormorant_Garamond',_serif] text-[10px] text-slate-400 tracking-[0.08em] leading-relaxed">
        Click a level to view
        <br />
        available units
      </p>
    </div>
  );
}
