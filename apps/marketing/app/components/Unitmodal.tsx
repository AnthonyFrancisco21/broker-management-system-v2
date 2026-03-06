"use client";

import { Unit, UNIT_SPECS } from "../lib/floorData";
import { X } from "lucide-react";

interface UnitModalProps {
  unit: Unit | null;
  onClose: () => void;
  onReserve: (unit: Unit) => void;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  available: { label: "Available", color: "bg-emerald-500" },
  reserved: { label: "Reserved", color: "bg-amber-500" },
  sold: { label: "Sold", color: "bg-red-500" },
};

export default function UnitModal({
  unit,
  onClose,
  onReserve,
}: UnitModalProps) {
  if (!unit) return null;

  const spec = UNIT_SPECS[unit.type];

  // TypeScript Fix: Provide a fallback in case unit.status doesn't strictly match the keys
  const statusInfo = STATUS_LABELS[unit.status] || {
    label: "Unknown",
    color: "bg-slate-500",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white max-w-sm w-full border-t-4 border-[#B8975A] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 pt-7 pb-5 border-b border-[#f0ece6]">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-['Cormorant_Garamond',_serif] text-[11px] tracking-[0.25em] text-[#B8975A] uppercase mb-1.5">
                Unit {unit.roomNumber}
              </p>
              <h2 className="font-['Cormorant_Garamond',_serif] text-3xl font-semibold text-slate-900 leading-tight">
                {unit.type}{" "}
                <span className="font-light text-slate-500">Suite</span>
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="px-8 py-6">
          <div className="grid grid-cols-3 mb-6 bg-[#faf9f7] rounded-lg border border-[#ece9e3] overflow-hidden">
            {[
              {
                label: "Floor",
                value: unit.floor === 1 ? "UG" : unit.floor.toString(),
              },
              { label: "Area", value: `${spec.sqm} sqm` },
              { label: "Type", value: "Studio" },
            ].map(({ label, value }, idx) => (
              <div
                key={label}
                className={`p-4 text-center ${idx !== 2 ? "border-r border-[#ece9e3]" : ""}`}
              >
                <p className="font-['Cormorant_Garamond',_serif] text-[10px] tracking-[0.2em] text-slate-400 uppercase mb-1.5">
                  {label}
                </p>
                <p className="font-['Cormorant_Garamond',_serif] text-lg font-semibold text-slate-900">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2.5 mb-6">
            <div className={`w-2 h-2 rounded-full ${statusInfo.color}`} />
            <span className="font-['Cormorant_Garamond',_serif] text-[13px] tracking-[0.15em] text-slate-600 uppercase">
              {statusInfo.label}
            </span>
          </div>

          <p className="font-sans text-[13px] leading-relaxed text-slate-500 mb-8 font-light">
            This {spec.label} features premium finishes and thoughtful design,
            ideal for modern urban living. Located on{" "}
            {unit.floor === 1
              ? "the upper ground level"
              : `the ${unit.floor === 2 ? "2nd" : unit.floor === 3 ? "3rd" : `${unit.floor}th`} floor`}
            .
          </p>

          {unit.status === "available" ? (
            <button
              onClick={() => onReserve(unit)}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-['Cormorant_Garamond',_serif] text-xs tracking-[0.3em] uppercase transition-colors"
            >
              Reserve This Unit
            </button>
          ) : (
            <div className="w-full py-3.5 bg-slate-100 text-center font-['Cormorant_Garamond',_serif] text-xs tracking-[0.3em] text-slate-400 uppercase">
              Not Available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
