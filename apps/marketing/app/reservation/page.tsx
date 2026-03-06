"use client";

import { useState } from "react";
import { FLOORS, FloorData, Unit } from "../lib/floorData";
import FloorSelector from "../components/Floorselector";
import FloorPlan from "../components/Floorplan";
import UnitModal from "../components/Unitmodal";
import { Check, Building } from "lucide-react"; // <-- FIXED: Added Building here

export default function ReservationPage() {
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [reservedUnit, setReservedUnit] = useState<Unit | null>(null);

  const currentFloorData: FloorData | undefined = selectedFloor
    ? FLOORS.find((f) => f.floor === selectedFloor)
    : undefined;

  const handleSelectFloor = (floor: number) => {
    setSelectedFloor(floor);
    setSelectedUnit(null);
  };

  const handleUnitClick = (unit: Unit) => {
    setSelectedUnit(unit);
  };

  const handleReserve = (unit: Unit) => {
    setReservedUnit(unit);
    setSelectedUnit(null);
    setShowConfirmation(true);
  };

  return (
    <main className="min-h-screen bg-[#faf9f7] font-sans text-slate-900 pb-20">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Lato:wght@300;400;700&display=swap');
        
        .fade-up {
          animation: fadeUp 0.45s ease forwards;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="sticky top-0 z-40 bg-white border-b border-[#ece9e3] px-6 md:px-10 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-[1px] h-7 bg-[#B8975A]" />
          <div>
            <p className="text-[9px] tracking-[0.3em] text-[#B8975A] uppercase leading-none mb-0.5">
              Property
            </p>
            <p className="text-base font-semibold text-slate-900 leading-tight">
              Residences at the Tower
            </p>
          </div>
        </div>
        <nav className="hidden md:flex gap-8 items-center">
          {["Overview", "Amenities", "Reservation"].map((item, i) => (
            <a
              key={item}
              href="#"
              className={`font-['Cormorant_Garamond',_serif] text-[13px] tracking-[0.15em] uppercase pb-0.5 border-b transition-colors ${
                i === 2
                  ? "text-[#B8975A] border-[#B8975A]"
                  : "text-slate-500 border-transparent hover:text-slate-800"
              }`}
            >
              {item}
            </a>
          ))}
        </nav>
      </div>

      <div className="bg-white border-b border-[#ece9e3] px-6 py-12 md:py-16 text-center">
        <p className="text-[10px] tracking-[0.4em] text-[#B8975A] uppercase mb-4">
          — Reservation Portal —
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-slate-900 leading-tight tracking-tight mb-4">
          Choose Your{" "}
          <em className="italic font-normal text-[#B8975A]">Residence</em>
        </h1>
        <p className="font-sans text-sm text-slate-500 max-w-md mx-auto leading-relaxed font-light mb-10">
          Select a floor level to explore available studio suites and begin your
          reservation.
        </p>

        <div className="flex flex-wrap justify-center border-y border-[#ece9e3] py-5 max-w-4xl mx-auto">
          {[
            { label: "Total Floors", value: "10" },
            { label: "Total Units", value: "188" },
            { label: "Unit Types", value: "4" },
            { label: "Starting From", value: "24 sqm" },
          ].map(({ label, value }, idx, arr) => (
            <div
              key={label}
              className={`px-6 md:px-10 text-center ${idx !== arr.length - 1 ? "border-r border-[#ece9e3]" : ""}`}
            >
              <p className="text-2xl md:text-3xl font-medium text-slate-900 leading-none">
                {value}
              </p>
              <p className="font-sans text-[10px] tracking-[0.2em] text-slate-400 uppercase mt-2">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row max-w-6xl mx-auto px-6 py-12 gap-10 lg:gap-16">
        <div className="w-full md:w-48 shrink-0 md:border-r border-[#ece9e3] md:pr-8 md:sticky md:top-24 h-fit">
          <FloorSelector
            selectedFloor={selectedFloor}
            onSelectFloor={handleSelectFloor}
          />
        </div>

        <div className="flex-1">
          {!selectedFloor ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center border border-dashed border-slate-300 rounded-xl bg-white p-10">
              <Building
                className="w-16 h-16 text-[#B8975A] opacity-30 mb-4"
                strokeWidth={1}
              />
              <p className="text-[10px] tracking-[0.35em] text-[#B8975A] uppercase mb-3">
                Interactive Floor Plan
              </p>
              <h2 className="text-2xl font-light text-slate-900 mb-2">
                Select a floor to begin
              </h2>
              <p className="font-sans text-sm text-slate-400 max-w-xs font-light">
                Use the level selector on the left to browse available units on
                each floor.
              </p>
            </div>
          ) : (
            currentFloorData && (
              <div key={selectedFloor} className="fade-up">
                <div className="mb-8">
                  <p className="text-[10px] tracking-[0.3em] text-[#B8975A] uppercase mb-2">
                    {selectedFloor === 1
                      ? "Upper Ground Level · 479 sqm"
                      : `Floor ${selectedFloor} · 552 sqm`}
                  </p>
                  <h2 className="text-3xl md:text-4xl font-light text-slate-900 leading-none">
                    {selectedFloor === 1
                      ? "Upper Ground"
                      : `Level ${selectedFloor}`}{" "}
                    <em className="italic text-[#B8975A] font-normal">Plan</em>
                  </h2>
                </div>
                <FloorPlan
                  floorData={currentFloorData}
                  onUnitClick={handleUnitClick}
                />
              </div>
            )
          )}
        </div>
      </div>

      <UnitModal
        unit={selectedUnit}
        onClose={() => setSelectedUnit(null)}
        onReserve={handleReserve}
      />

      {showConfirmation && reservedUnit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          onClick={() => setShowConfirmation(false)}
        >
          <div
            className="bg-white max-w-md w-full p-10 text-center border-t-4 border-[#B8975A] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full border-2 border-[#B8975A] flex items-center justify-center text-[#B8975A] mx-auto mb-5">
              <Check size={28} />
            </div>
            <p className="text-[10px] tracking-[0.35em] text-[#B8975A] uppercase mb-2">
              Request Received
            </p>
            <h2 className="font-['Cormorant_Garamond',_serif] text-3xl text-slate-900 mb-3">
              Unit {reservedUnit.roomNumber} Reserved
            </h2>
            <p className="font-sans text-sm text-slate-500 leading-relaxed font-light mb-8">
              Thank you for your interest. Our sales team will contact you
              shortly to confirm your reservation and guide you through the next
              steps.
            </p>
            <button
              onClick={() => setShowConfirmation(false)}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-['Cormorant_Garamond',_serif] text-xs tracking-[0.3em] uppercase transition-colors"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
