"use client";

import { useState } from "react";
import { FLOORS, FloorData, Unit } from "../lib/floorData";
import FloorSelector from "../components/Floorselector";
import FloorPlan from "../components/Floorplan";
import UnitModal from "../components/Unitmodal";
import { Building2, CheckCircle2 } from "lucide-react";

export default function ReservationPage() {
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [activeUnit, setActiveUnit] = useState<Unit | null>(null);
  const [confirmed, setConfirmed] = useState<Unit | null>(null);

  const floorData: FloorData | null =
    selectedFloor != null
      ? (FLOORS.find((f) => f.floor === selectedFloor) ?? null)
      : null;

  const handleSelect = (floor: number) => {
    setSelectedFloor(floor);
    setActiveUnit(null);
  };

  const handleReserve = (unit: Unit) => {
    setActiveUnit(null);
    setConfirmed(unit);
  };

  return (
    <div className="min-h-screen" style={{ background: "#FAF9F7" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Lato:wght@300;400;700&display=swap');
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .fade-up { animation: fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav
        className="sticky top-0 z-30 h-16 flex items-center justify-between px-6 md:px-10 border-b"
        style={{
          background: "rgba(250,249,247,0.97)",
          backdropFilter: "blur(8px)",
          borderColor: "#E8E4DA",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-0.5 h-7 rounded-full"
            style={{ background: "#B8975A" }}
          />
          <div>
            <p
              className="text-[9px] tracking-[0.3em] uppercase leading-none mb-0.5"
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                color: "#B8975A",
              }}
            >
              Property
            </p>
            <p
              className="text-[15px] font-semibold text-slate-900 leading-tight"
              style={{ fontFamily: "'Cormorant Garamond',serif" }}
            >
              Residences at the Tower
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Overview", "Amenities", "Reservation"].map((item, i) => (
            <a
              key={item}
              href="#"
              className="text-[11px] tracking-[0.18em] uppercase pb-0.5 border-b transition-colors"
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                color: i === 2 ? "#B8975A" : "#9A9090",
                borderColor: i === 2 ? "#B8975A" : "transparent",
              }}
            >
              {item}
            </a>
          ))}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        className="border-b px-6 py-12 text-center"
        style={{ background: "#FFFFFF", borderColor: "#E8E4DA" }}
      >
        <p
          className="text-[10px] tracking-[0.45em] uppercase mb-4"
          style={{ fontFamily: "'Cormorant Garamond',serif", color: "#B8975A" }}
        >
          — Reservation Portal —
        </p>
        <h1
          className="text-4xl md:text-5xl font-light text-slate-900 leading-tight mb-3"
          style={{ fontFamily: "'Cormorant Garamond',serif" }}
        >
          Choose Your{" "}
          <em className="italic font-normal" style={{ color: "#B8975A" }}>
            Residence
          </em>
        </h1>
        <p
          className="text-[13px] text-slate-400 max-w-sm mx-auto leading-relaxed font-light mb-10"
          style={{ fontFamily: "Lato,sans-serif" }}
        >
          Select a floor to explore available studio suites and begin your
          reservation.
        </p>
        {/* Stats strip */}
        <div
          className="flex flex-wrap justify-center border-y py-5 max-w-3xl mx-auto"
          style={{ borderColor: "#E8E4DA" }}
        >
          {[
            { label: "Total Floors", value: "10" },
            {
              label: "Total Units",
              value: FLOORS.reduce((a, f) => a + f.units.length, 0).toString(),
            },
            { label: "Unit Types", value: "4" },
            { label: "Min. Area", value: "24 m²" },
          ].map(({ label, value }, i, arr) => (
            <div
              key={label}
              className={`px-8 text-center ${i !== arr.length - 1 ? "border-r" : ""}`}
              style={{ borderColor: "#E8E4DA" }}
            >
              <p
                className="text-2xl md:text-3xl font-medium text-slate-900 leading-none"
                style={{ fontFamily: "'Cormorant Garamond',serif" }}
              >
                {value}
              </p>
              <p
                className="text-[9px] tracking-[0.22em] text-slate-400 uppercase mt-2"
                style={{ fontFamily: "'Cormorant Garamond',serif" }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── MAIN LAYOUT ── */}
      <div className="flex flex-col md:flex-row max-w-[1400px] mx-auto px-4 md:px-8 py-10 gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-52 shrink-0 md:sticky md:top-24 h-fit">
          <p
            className="text-center text-[9px] tracking-[0.28em] uppercase mb-3 text-slate-400"
            style={{ fontFamily: "'Cormorant Garamond',serif" }}
          >
            Select Floor
          </p>
          <FloorSelector
            floors={FLOORS}
            selectedFloor={selectedFloor}
            onSelect={handleSelect}
          />
        </aside>

        {/* Floor Plan area */}
        <main className="flex-1 min-w-0">
          {floorData ? (
            <div key={selectedFloor} className="fade-up">
              {/* Floor heading */}
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <p
                    className="text-[10px] tracking-[0.28em] uppercase mb-1"
                    style={{
                      fontFamily: "'Cormorant Garamond',serif",
                      color: "#B8975A",
                    }}
                  >
                    {floorData.floor === 1
                      ? "Upper Ground Level · Premium Amenities"
                      : `Level ${floorData.floor} · Residential Suites`}
                  </p>
                  <h2
                    className="text-4xl font-light text-slate-900 leading-none"
                    style={{ fontFamily: "'Cormorant Garamond',serif" }}
                  >
                    {floorData.label}{" "}
                    <em
                      className="italic font-normal"
                      style={{ color: "#B8975A" }}
                    >
                      {floorData.floor === 1 ? "Level" : "Floor"}
                    </em>
                  </h2>
                </div>
                <p
                  className="hidden md:block text-[12px] text-slate-400 pb-1"
                  style={{ fontFamily: "'Cormorant Garamond',serif" }}
                >
                  Click a room to reserve
                </p>
              </div>

              <FloorPlan floorData={floorData} onUnitClick={setActiveUnit} />
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center min-h-[500px] gap-5
              border border-dashed rounded-xl text-center p-10"
              style={{ borderColor: "#D8D4CA", background: "#FFFFFF" }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "#F0EDE6" }}
              >
                <Building2
                  size={32}
                  className="text-[#B8975A]"
                  strokeWidth={1.5}
                />
              </div>
              <div>
                <h3
                  className="text-2xl font-light text-slate-700 mb-2"
                  style={{ fontFamily: "'Cormorant Garamond',serif" }}
                >
                  Select a Floor Level
                </h3>
                <p
                  className="text-[13px] text-slate-400 max-w-xs leading-relaxed"
                  style={{ fontFamily: "Lato,sans-serif" }}
                >
                  Use the building directory on the left to browse available
                  layouts.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── UNIT MODAL ── */}
      {activeUnit && (
        <UnitModal
          unit={activeUnit}
          onClose={() => setActiveUnit(null)}
          onReserve={handleReserve}
        />
      )}

      {/* ── CONFIRMATION ── */}
      {confirmed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(10,8,4,0.65)",
            backdropFilter: "blur(6px)",
          }}
          onClick={() => setConfirmed(null)}
        >
          <div
            className="relative w-full max-w-sm p-8 text-center shadow-2xl fade-up"
            style={{
              background: "#FDFBF8",
              borderRadius: "16px",
              borderTop: "4px solid #B8975A",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-5">
              <CheckCircle2 size={52} color="#B8975A" strokeWidth={1.5} />
            </div>
            <p
              className="text-[10px] tracking-[0.35em] uppercase mb-2"
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                color: "#B8975A",
              }}
            >
              Request Received
            </p>
            <h2
              className="text-3xl font-light text-slate-900 mb-1 leading-snug"
              style={{ fontFamily: "'Cormorant Garamond',serif" }}
            >
              Room {confirmed.roomNumber}
            </h2>
            <p
              className="text-xl text-slate-500 font-light mb-3"
              style={{ fontFamily: "'Cormorant Garamond',serif" }}
            >
              has been locked for you
            </p>
            <p
              className="text-[13px] text-slate-400 leading-relaxed font-light mb-7"
              style={{ fontFamily: "Lato,sans-serif" }}
            >
              Your broker will contact you shortly to finalize the reservation
              documents.
            </p>
            <button
              onClick={() => setConfirmed(null)}
              className="w-full py-3.5 font-bold text-[11px] tracking-[0.3em] uppercase transition-all hover:opacity-90 rounded-xl text-white"
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                background: "#1A140A",
              }}
            >
              Return to Directory
            </button>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer
        className="border-t mt-16 px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4"
        style={{ borderColor: "#E8E4DA", background: "#FFFFFF" }}
      >
        <p
          className="text-[12px] text-slate-400 tracking-wide"
          style={{ fontFamily: "Lato,sans-serif" }}
        >
          © {new Date().getFullYear()} Residences at the Tower. All rights
          reserved.
        </p>
        <p
          className="text-[12px] tracking-[0.25em] uppercase"
          style={{ fontFamily: "'Cormorant Garamond',serif", color: "#B8975A" }}
        >
          Luxury Brokerage Management
        </p>
      </footer>
    </div>
  );
}
