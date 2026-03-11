"use client";

import { useState } from "react";
import { FLOORS, FloorData, Unit } from "../lib/floorData";
import FloorSelector from "../components/Floorselector";
import FloorPlan from "../components/Floorplan";
import UnitModal from "../components/Unitmodal";
import { Check, Building2 } from "lucide-react";

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

export default function ReservationPage() {
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [reservedUnit, setReservedUnit] = useState<Unit | null>(null);

  const floorData: FloorData | undefined = selectedFloor
    ? FLOORS.find((f) => f.floor === selectedFloor)
    : undefined;

  const handleSelectFloor = (floor: number) => {
    setSelectedFloor(floor);
    setSelectedUnit(null);
  };

  const handleReserve = (unit: Unit) => {
    setReservedUnit(unit);
    setSelectedUnit(null);
    setShowConfirm(true);
  };

  return (
    <main className="min-h-screen bg-[#faf9f7]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Lato:wght@300;400;700&display=swap');

        .fade-up {
          animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(15px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#ece9e3] h-16 flex items-center justify-between px-6 md:px-10">
        <div className="flex items-center gap-3">
          <div className="w-px h-7 bg-[#B8975A]" />
          <div>
            <p className="font-['Cormorant_Garamond',_serif] text-[9px] tracking-[0.3em] text-[#B8975A] uppercase leading-none mb-0.5">
              Property
            </p>
            <p className="font-['Cormorant_Garamond',_serif] text-[15px] font-semibold text-slate-900 leading-tight">
              Residences at the Tower
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Overview", "Amenities", "Reservation"].map((item, i) => (
            <a
              key={item}
              href="#"
              className={`font-['Cormorant_Garamond',_serif] text-[12px] tracking-[0.18em] uppercase pb-0.5 border-b transition-colors ${
                i === 2
                  ? "text-[#B8975A] border-[#B8975A]"
                  : "text-slate-400 border-transparent hover:text-slate-700"
              }`}
            >
              {item}
            </a>
          ))}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="bg-white border-b border-[#ece9e3] px-6 py-14 text-center">
        <p className="font-['Cormorant_Garamond',_serif] text-[10px] tracking-[0.45em] text-[#B8975A] uppercase mb-4">
          — Reservation Portal —
        </p>
        <h1 className="font-['Cormorant_Garamond',_serif] text-4xl md:text-5xl font-light text-slate-900 leading-tight mb-3">
          Choose Your{" "}
          <em className="italic font-normal text-[#B8975A]">Residence</em>
        </h1>
        <p className="font-sans text-[13px] text-slate-400 max-w-sm mx-auto leading-relaxed font-light mb-10">
          Select a floor level to explore available studio suites and begin your
          reservation.
        </p>

        {/* Stats strip */}
        <div className="flex flex-wrap justify-center gap-0 border-y border-[#ece9e3] py-5 max-w-3xl mx-auto">
          {[
            { label: "Total Floors", value: "10" },
            { label: "Total Units", value: "188" },
            { label: "Unit Types", value: "4" },
            { label: "Min. Area", value: "24 sqm" },
          ].map(({ label, value }, i, arr) => (
            <div
              key={label}
              className={`px-8 text-center ${i !== arr.length - 1 ? "border-r border-[#ece9e3]" : ""}`}
            >
              <p className="font-['Cormorant_Garamond',_serif] text-2xl md:text-3xl font-medium text-slate-900 leading-none">
                {value}
              </p>
              <p className="font-['Cormorant_Garamond',_serif] text-[9px] tracking-[0.22em] text-slate-400 uppercase mt-2">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Main layout ── */}
      <div className="flex flex-col md:flex-row max-w-[1400px] mx-auto px-4 md:px-8 py-10 gap-0">
        {/* Left: floor selector */}
        <aside className="w-full md:w-64 shrink-0 md:border-r border-[#ece9e3] md:pr-8 md:sticky md:top-24 h-fit mb-8 md:mb-0">
          <FloorSelector
            selectedFloor={selectedFloor}
            onSelectFloor={handleSelectFloor}
          />
        </aside>

        {/* Right: floor plan or empty state */}
        <div className="flex-1 md:pl-10 overflow-hidden">
          {!selectedFloor ? (
            /* ── Empty / prompt state ── */
            <div className="flex flex-col items-center justify-center min-h-[600px] text-center border border-dashed border-[#dcd8d1] rounded-xl bg-white p-10 shadow-sm">
              <Building2
                className="w-16 h-16 text-[#B8975A] opacity-30 mb-6"
                strokeWidth={1}
              />
              <p className="font-['Cormorant_Garamond',_serif] text-[11px] tracking-[0.35em] text-[#B8975A] uppercase mb-3">
                Interactive Directory
              </p>
              <h2 className="font-['Cormorant_Garamond',_serif] text-3xl font-light text-slate-800 mb-3">
                Select a level to begin
              </h2>
              <p className="font-sans text-[14px] text-slate-400 max-w-sm font-light leading-relaxed">
                Use the directory on the left to browse available architectural
                layouts and reserve your ideal unit.
              </p>
            </div>
          ) : floorData ? (
            /* ── Floor plan view ── */
            <div key={selectedFloor} className="fade-up w-full">
              <div className="mb-8 text-center md:text-left">
                <p className="font-['Cormorant_Garamond',_serif] text-[11px] tracking-[0.3em] text-[#B8975A] uppercase mb-2">
                  {selectedFloor === 1
                    ? "Upper Ground Level · Premium Amenities"
                    : `Level ${selectedFloor} · Residential Suites`}
                </p>
                <h2 className="font-['Cormorant_Garamond',_serif] text-4xl md:text-5xl font-light text-slate-900 leading-none">
                  {FLOOR_NAMES[selectedFloor]}{" "}
                  <em className="italic text-[#B8975A] font-normal">
                    {selectedFloor === 1 ? "Level" : "Floor"}
                  </em>
                </h2>
              </div>

              <div className="w-full overflow-x-auto pb-8">
                <FloorPlan
                  floorData={floorData}
                  onUnitClick={setSelectedUnit}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* ── Unit detail modal ── */}
      <UnitModal
        unit={selectedUnit}
        onClose={() => setSelectedUnit(null)}
        onReserve={handleReserve}
      />

      {/* ── Reservation confirmation ── */}
      {showConfirm && reservedUnit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-white w-full max-w-md p-10 text-center shadow-2xl rounded-sm fade-up"
            style={{ borderTop: "4px solid #B8975A" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-full border border-[#B8975A] bg-[#fcfaf7] flex items-center justify-center text-[#B8975A] mx-auto mb-6">
              <Check size={28} strokeWidth={1.5} />
            </div>
            <p className="font-['Cormorant_Garamond',_serif] text-[11px] tracking-[0.35em] text-[#B8975A] uppercase mb-2">
              Request Received
            </p>
            <h2 className="font-['Cormorant_Garamond',_serif] text-4xl font-light text-slate-900 mb-4 leading-snug">
              Unit {reservedUnit.roomNumber}
              <br />
              <span className="text-2xl font-light text-slate-500">
                has been locked
              </span>
            </h2>
            <p className="font-sans text-[14px] text-slate-500 leading-relaxed font-light mb-8">
              Your broker will contact you shortly to confirm the technical
              requirements and finalize your reservation documents.
            </p>
            <button
              onClick={() => setShowConfirm(false)}
              className="w-full py-4 bg-slate-900 hover:bg-[#B8975A] text-white font-['Cormorant_Garamond',_serif] text-[12px] tracking-[0.3em] uppercase transition-all duration-300"
            >
              Return to Directory
            </button>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="border-t border-[#ece9e3] bg-white px-8 py-8 flex flex-col md:flex-row items-center justify-between mt-16 gap-4">
        <p className="font-sans text-[12px] text-slate-400 font-light tracking-wide">
          © 2026 Residences at the Tower. All rights reserved.
        </p>
        <p className="font-['Cormorant_Garamond',_serif] text-[12px] text-[#B8975A] tracking-[0.25em] uppercase">
          Luxury Brokerage Management
        </p>
      </footer>
    </main>
  );
}
