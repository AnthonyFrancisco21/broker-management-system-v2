"use client";

import { Unit, UNIT_SPECS } from "../lib/floorData";

interface UnitModalProps {
  unit: Unit | null;
  onClose: () => void;
  onReserve: (unit: Unit) => void;
}

const STATUS_CONFIG = {
  available: { label: "Available", dot: "#10B981" },
  reserved: { label: "Reserved", dot: "#F59E0B" },
  sold: { label: "Sold", dot: "#EF4444" },
};

const FLOOR_NAMES: Record<number, string> = {
  1: "Upper Ground",
  2: "Second",
  3: "Third",
  4: "Fourth",
  5: "Fifth",
  6: "Sixth",
  7: "Seventh",
  8: "Eighth",
  9: "Ninth",
  10: "Tenth",
};

export default function UnitModal({
  unit,
  onClose,
  onReserve,
}: UnitModalProps) {
  if (!unit) return null;

  const spec = UNIT_SPECS[unit.type];
  const status = STATUS_CONFIG[unit.status];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full max-w-sm shadow-2xl"
        style={{ borderTop: "3px solid #B8975A" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 pt-7 pb-5 border-b border-[#f0ece6]">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-['Cormorant_Garamond',_serif] text-[10px] tracking-[0.28em] text-[#B8975A] uppercase mb-1">
                Unit {unit.roomNumber}
              </p>
              <h2 className="font-['Cormorant_Garamond',_serif] text-[28px] font-semibold text-slate-900 leading-none">
                {unit.type}{" "}
                <span className="font-light text-slate-400">Suite</span>
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-slate-300 hover:text-slate-600 transition-colors text-xl leading-none pt-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6">
          {/* Stats grid */}
          <div className="grid grid-cols-3 mb-6 border border-[#ece9e3]">
            {[
              {
                label: "Floor",
                value: unit.floor === 1 ? "UG" : String(unit.floor),
              },
              { label: "Area", value: `${spec.sqm} sqm` },
              { label: "Type", value: "Studio" },
            ].map(({ label, value }, i) => (
              <div
                key={label}
                className={`py-4 text-center ${i !== 2 ? "border-r border-[#ece9e3]" : ""} bg-[#faf9f7]`}
              >
                <p className="font-['Cormorant_Garamond',_serif] text-[9px] tracking-[0.22em] text-slate-400 uppercase mb-1.5">
                  {label}
                </p>
                <p className="font-['Cormorant_Garamond',_serif] text-lg font-semibold text-slate-900 leading-none">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Status */}
          <div className="flex items-center gap-2.5 mb-6">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: status.dot }}
            />
            <span className="font-['Cormorant_Garamond',_serif] text-[12px] tracking-[0.15em] text-slate-500 uppercase">
              {status.label}
            </span>
          </div>

          {/* Description */}
          <p className="font-sans text-[13px] text-slate-400 leading-relaxed font-light mb-7">
            {spec.label} on the {FLOOR_NAMES[unit.floor]}{" "}
            {unit.floor === 1 ? "Level" : "Floor"}. Premium finishes, thoughtful
            layout, ideal for modern urban living.
          </p>

          {/* CTA */}
          {unit.status === "available" ? (
            <button
              onClick={() => onReserve(unit)}
              className="w-full py-3.5 bg-slate-900 hover:bg-[#B8975A] text-white font-['Cormorant_Garamond',_serif] text-[11px] tracking-[0.3em] uppercase transition-colors duration-200"
            >
              Reserve This Unit
            </button>
          ) : (
            <div className="w-full py-3.5 bg-slate-100 text-slate-400 font-['Cormorant_Garamond',_serif] text-[11px] tracking-[0.3em] uppercase text-center">
              Not Available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
