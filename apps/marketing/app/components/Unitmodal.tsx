"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { Unit, UNIT_SPECS, FLOOR_LABELS } from "../lib/floorData";

interface Props {
  unit: Unit;
  onClose: () => void;
  onReserve: (unit: Unit) => void;
}

const TYPE_THEME = {
  "S-24": {
    bg: "#A8CBE8",
    border: "#4A7EA0",
    text: "#1A3554",
    badge: "#4A7EA0",
  },
  "S-28": {
    bg: "#F8CE8F",
    border: "#B8821E",
    text: "#5A2E00",
    badge: "#B8821E",
  },
  "S-36": {
    bg: "#BEDD9A",
    border: "#5E9432",
    text: "#233E09",
    badge: "#5E9432",
  },
  "S-40": {
    bg: "#F5A84A",
    border: "#B05E0A",
    text: "#4A2000",
    badge: "#B05E0A",
  },
  "S-75": {
    bg: "#EAE5FA", // Subtle lavender background
    border: "#7C3AED",
    text: "#4C1D95",
    badge: "#7C3AED",
  },
} as const;

const STATUS_THEME = {
  available: { dot: "#22C55E", label: "Available", labelClr: "#166534" },
  reserved: {
    dot: "#F59E0B",
    label: "Currently Reserved",
    labelClr: "#92400E",
  },
  sold: { dot: "#EF4444", label: "Unit Sold", labelClr: "#991B1B" },
} as const;

export default function UnitModal({ unit, onClose, onReserve }: Props) {
  const th = TYPE_THEME[unit.type as keyof typeof TYPE_THEME];
  const st = STATUS_THEME[unit.status];
  const sp = UNIT_SPECS[unit.type];
  const isMultiPurpose = unit.type === "S-75";

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,8,4,0.65)", backdropFilter: "blur(5px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm overflow-hidden shadow-2xl"
        style={{ background: "#FDFBF8", borderRadius: "16px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Coloured header */}
        <div
          className="px-6 pt-6 pb-5"
          style={{ background: th.bg, borderBottom: `3px solid ${th.border}` }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/10 transition-colors"
          >
            <X size={18} color={th.text} />
          </button>
          <div className="flex items-center gap-3">
            <div
              className="px-3 py-1.5 rounded-lg text-white font-bold tracking-widest text-lg"
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                background: th.badge,
              }}
            >
              {unit.type}
            </div>
            <div>
              <h2
                className="text-2xl font-bold leading-none"
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  color: th.text,
                }}
              >
                Room {unit.roomNumber}
              </h2>
              <p
                className="text-sm mt-0.5 opacity-70"
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  color: th.text,
                }}
              >
                {FLOOR_LABELS[unit.floor] ?? `Floor ${unit.floor}`}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Stat tiles */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { lbl: "Floor", val: unit.floor === 1 ? "UG" : `${unit.floor}F` },
              { lbl: "Area", val: `${sp.sqm} m²` },
              { lbl: "Type", val: isMultiPurpose ? "Event" : unit.type },
            ].map(({ lbl, val }) => (
              <div
                key={lbl}
                className="rounded-xl bg-[#F5F2EC] py-3 text-center"
              >
                <p className="text-[9px] tracking-[0.2em] uppercase text-slate-400 mb-1">
                  {lbl}
                </p>
                <p
                  className="text-lg font-bold text-slate-800 leading-none"
                  style={{ fontFamily: "'Cormorant Garamond',serif" }}
                >
                  {val}
                </p>
              </div>
            ))}
          </div>

          {/* Status (Hidden for Multi-Purpose S-75) */}
          {!isMultiPurpose && (
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#F5F2EC]">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse"
                style={{ background: st.dot }}
              />
              <span
                className="text-sm font-semibold tracking-wide"
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  color: st.labelClr,
                }}
              >
                {st.label}
              </span>
            </div>
          )}

          {/* Description */}
          <p
            className="text-sm text-slate-500 leading-relaxed"
            style={{ fontFamily: "'Cormorant Garamond',serif" }}
          >
            {sp.description}
          </p>

          {/* CTA / Multi-Purpose Info */}
          {isMultiPurpose ? (
            <div
              className="w-full py-4 px-5 rounded-xl text-center"
              style={{
                background: "#F5F3FF",
                border: "1px dashed #A78BFA",
              }}
            >
              <p
                className="text-[13px] text-slate-600 leading-relaxed font-medium"
                style={{ fontFamily: "Lato,sans-serif" }}
              >
                This specialized multi-purpose area is available for private
                events, corporate conferences, and exclusive community
                gatherings. Please contact administration for booking inquiries
                and availability.
              </p>
            </div>
          ) : unit.status === "available" ? (
            <button
              onClick={() => onReserve(unit)}
              className="w-full py-3.5 rounded-xl font-bold text-base tracking-[0.12em] uppercase transition-all duration-150 hover:opacity-90 active:scale-[0.98] text-white"
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                background: "#B8975A",
              }}
            >
              Reserve This Unit
            </button>
          ) : (
            <div
              className="w-full py-3.5 rounded-xl font-bold text-base tracking-[0.12em] uppercase text-center"
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                background: "#E8E4DC",
                color: "#9A8E7E",
              }}
            >
              {unit.status === "reserved" ? "Currently Reserved" : "Unit Sold"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
