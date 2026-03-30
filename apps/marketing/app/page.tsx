"use client";

import { useState, useEffect } from "react";
import {
  FloorData,
  Unit,
  FLOOR_LABELS,
  UnitType,
  UnitStatus,
} from "./lib/floorData";
import FloorSelector from "./components/Floorselector";
import FloorPlan from "./components/Floorplan";
import UnitModal from "./components/Unitmodal";
import ReservationFormModal from "./components/ReservationFormModal";
import { Building2, Loader2 } from "lucide-react";

export default function ReservationPage() {
  const [floorsData, setFloorsData] = useState<FloorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [activeUnit, setActiveUnit] = useState<Unit | null>(null);
  // Unit being reserved — triggers the reservation form modal
  const [reservingUnit, setReservingUnit] = useState<Unit | null>(null);

  const loadUnits = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/units/public`,
        { headers: { "Content-Type": "application/json" } },
      );
      if (!res.ok)
        throw new Error("Something went wrong. Please try again later.");

      const dbUnits = await res.json();
      const floorsMap = new Map<number, FloorData>();

      dbUnits.forEach((dbUnit: any) => {
        if (dbUnit.floor === null) return;

        if (!floorsMap.has(dbUnit.floor)) {
          floorsMap.set(dbUnit.floor, {
            floor: dbUnit.floor,
            label: FLOOR_LABELS[dbUnit.floor] ?? `Floor ${dbUnit.floor}`,
            totalSqm: 0,
            units: [],
          });
        }

        const floorGroup = floorsMap.get(dbUnit.floor)!;
        const sqmValue = parseInt(dbUnit.size?.replace(" sqm", "") || "0", 10);

        // Map DB status to visual status shown on the floor plan
        // "available"  → available (green, clickable)
        // "onHold"     → reserved  (shown as taken, not clickable)
        // "reserved"   → reserved
        // "underNego"  → reserved
        // "occupied"   → sold
        let visualStatus: UnitStatus = "available";
        if (["reserved", "underNego", "onHold"].includes(dbUnit.unitStatus)) {
          visualStatus = "reserved";
        } else if (dbUnit.unitStatus === "occupied") {
          visualStatus = "sold";
        }

        floorGroup.units.push({
          id: dbUnit.id.toString(),
          roomNumber: dbUnit.roomNo || "",
          type: (dbUnit.unitType as UnitType) || "S-24",
          sqm: sqmValue,
          floor: dbUnit.floor,
          status: visualStatus,
          price: dbUnit.price ? Number(dbUnit.price) : null,
        });

        floorGroup.totalSqm += sqmValue;
      });

      const formattedData = Array.from(floorsMap.values()).sort(
        (a, b) => a.floor - b.floor,
      );
      setFloorsData(formattedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnits();
  }, []);

  const floorData: FloorData | null =
    selectedFloor != null
      ? (floorsData.find((f) => f.floor === selectedFloor) ?? null)
      : null;

  const handleSelect = (floor: number) => {
    setSelectedFloor(floor);
    setActiveUnit(null);
  };

  // Called from UnitModal when customer clicks "Reserve"
  // Closes the info modal and opens the reservation form
  const handleReserve = (unit: Unit) => {
    setActiveUnit(null);
    setReservingUnit(unit);
  };

  // Called after successful reservation — reload units so the floor plan
  // reflects the newly onHold unit
  const handleReservationSuccess = () => {
    setReservingUnit(null);
    loadUnits();
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#FAF9F7" }}
      >
        <div
          className="flex flex-col items-center gap-4"
          style={{ color: "#B8975A" }}
        >
          <Loader2 className="animate-spin" size={48} />
          <p className="tracking-[0.2em] uppercase text-sm font-serif">
            Loading Live Inventory...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#FAF9F7" }}
      >
        <p className="text-red-500 font-medium">Error: {error}</p>
      </div>
    );
  }

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
          {[
            { label: "Overview", href: "#", active: false },
            { label: "Amenities", href: "#", active: false },
            { label: "Reservation", href: "/", active: true },
            { label: "Check Status", href: "/status", active: false },
          ].map(({ label, href, active }) => (
            <a
              key={label}
              href={href}
              className="text-[11px] tracking-[0.18em] uppercase pb-0.5 border-b transition-colors"
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                color: active ? "#B8975A" : "#9A9090",
                borderColor: active ? "#B8975A" : "transparent",
              }}
            >
              {label}
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

        <div
          className="flex flex-wrap justify-center border-y py-5 max-w-3xl mx-auto"
          style={{ borderColor: "#E8E4DA" }}
        >
          {[
            { label: "Total Floors", value: floorsData.length.toString() },
            {
              label: "Total Units",
              value: floorsData
                .reduce((a, f) => a + f.units.length, 0)
                .toString(),
            },
            { label: "Unit Types", value: "5" },
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
        <aside className="w-full md:w-52 shrink-0 md:sticky md:top-24 h-fit">
          <p
            className="text-center text-[9px] tracking-[0.28em] uppercase mb-3 text-slate-400"
            style={{ fontFamily: "'Cormorant Garamond',serif" }}
          >
            Select Floor
          </p>
          <FloorSelector
            floors={floorsData}
            selectedFloor={selectedFloor}
            onSelect={handleSelect}
          />
        </aside>

        <main className="flex-1 min-w-0">
          {floorData ? (
            <div key={selectedFloor} className="fade-up">
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
              className="flex flex-col items-center justify-center min-h-[500px] gap-5 border border-dashed rounded-xl text-center p-10"
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

      {/* ── UNIT INFO MODAL ── */}
      {activeUnit && (
        <UnitModal
          unit={activeUnit}
          onClose={() => setActiveUnit(null)}
          onReserve={handleReserve}
        />
      )}

      {/* ── RESERVATION FORM MODAL ── */}
      {reservingUnit && (
        <ReservationFormModal
          unit={reservingUnit}
          onClose={() => setReservingUnit(null)}
          onSuccess={handleReservationSuccess}
        />
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
        <a
          href="/status"
          className="text-[12px] tracking-[0.2em] uppercase transition-opacity hover:opacity-70"
          style={{ fontFamily: "'Cormorant Garamond',serif", color: "#B8975A" }}
        >
          Check Reservation Status →
        </a>
      </footer>
    </div>
  );
}
