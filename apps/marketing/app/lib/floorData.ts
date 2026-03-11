export type UnitType = "S-24" | "S-28" | "S-36" | "S-40" | "S-75";
export type UnitStatus = "available" | "reserved" | "sold";

export interface Unit {
  id: string;
  roomNumber: string;
  type: UnitType;
  sqm: number;
  floor: number;
  status: UnitStatus;
  // position is populated by FloorPlan.tsx via buildUnits(); stored here for the modal.
  position: { x: number; y: number; width: number; height: number };
}

export interface FloorData {
  floor: number;
  label: string;
  totalSqm: number;
  units: Unit[];
}

export const UNIT_SPECS: Record<UnitType, { sqm: number; label: string }> = {
  "S-24": { sqm: 24, label: "Studio 24 sqm" },
  "S-28": { sqm: 28, label: "Studio 28 sqm" },
  "S-36": { sqm: 36, label: "Studio 36 sqm" },
  "S-40": { sqm: 40, label: "Studio 40 sqm" },
  "S-75": { sqm: 75, label: "Multi-purpose 75 sqm" },
};

// ─── Per-floor unit definitions ──────────────────────────────
// Positions are intentionally zeroed here; FloorPlan.tsx owns the SVG geometry.
// Only type, roomNumber, floor and status matter from this file.

const DUMMY_POS = { x: 0, y: 0, width: 0, height: 0 };

function makeUnit(
  floor: number,
  roomSuffix: string | number,
  type: UnitType,
): Unit {
  const roomNumber = `${floor}${String(roomSuffix).padStart(2, "0")}`;
  return {
    id: `${floor}-${roomSuffix}`,
    roomNumber,
    type,
    sqm: UNIT_SPECS[type].sqm,
    floor,
    status: "available",
    position: DUMMY_POS,
  };
}

// Ground floor (Upper Ground) — 17 units
// S-24: 106,108,110,112,114,115
// S-28: 102,103,104,105,107,109,111,113
// S-36: 101 (RM01 bottom) + 117,118 (wing) + 110 (far-left bump)
// S-40: 116
function groundFloor(): Unit[] {
  return [
    // S-24
    makeUnit(1, "06", "S-24"),
    makeUnit(1, "08", "S-24"),
    makeUnit(1, "10", "S-24"),
    makeUnit(1, "12", "S-24"),
    makeUnit(1, "14", "S-24"),
    makeUnit(1, "15", "S-24"),
    // S-28
    makeUnit(1, "02", "S-28"),
    makeUnit(1, "03", "S-28"),
    makeUnit(1, "04", "S-28"),
    makeUnit(1, "05", "S-28"),
    makeUnit(1, "07", "S-28"),
    makeUnit(1, "09", "S-28"),
    makeUnit(1, "11", "S-28"),
    makeUnit(1, "13", "S-28"),
    // S-36
    makeUnit(1, "01", "S-36"), // bottom RM01
    makeUnit(1, "17", "S-36"), // wing S-36B RM17
    makeUnit(1, "18", "S-36"), // wing S-36A RM18
    // S-40
    makeUnit(1, "16", "S-40"),
  ];
}

// Standard floors 2-10 — 19 units each
// S-24: X06,X08,X10,X12,X14,X15
// S-28: X02,X03,X04,X05,X07,X09,X11,X13
// S-36: X01 (bottom) + X17,X18,X19 (wing)
// S-40: X16
function standardFloor(floor: number): Unit[] {
  return [
    // S-24
    makeUnit(floor, "06", "S-24"),
    makeUnit(floor, "08", "S-24"),
    makeUnit(floor, "10", "S-24"),
    makeUnit(floor, "12", "S-24"),
    makeUnit(floor, "14", "S-24"),
    makeUnit(floor, "15", "S-24"),
    // S-28
    makeUnit(floor, "02", "S-28"),
    makeUnit(floor, "03", "S-28"),
    makeUnit(floor, "04", "S-28"),
    makeUnit(floor, "05", "S-28"),
    makeUnit(floor, "07", "S-28"),
    makeUnit(floor, "09", "S-28"),
    makeUnit(floor, "11", "S-28"),
    makeUnit(floor, "13", "S-28"),
    // S-36
    makeUnit(floor, "01", "S-36"),
    makeUnit(floor, "17", "S-36"),
    makeUnit(floor, "18", "S-36"),
    makeUnit(floor, "19", "S-36"),
    // S-40
    makeUnit(floor, "16", "S-40"),
  ];
}

// Typed as const record with explicit keys so lookup always returns string (never undefined)
const FLOOR_LABELS: Record<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10, string> = {
  1: "Upper Ground Level",
  2: "Second Floor",
  3: "Third Floor",
  4: "Fourth Floor",
  5: "Fifth Floor",
  6: "Sixth Floor",
  7: "Seventh Floor",
  8: "Eighth Floor",
  9: "Ninth Floor",
  10: "Tenth Floor",
};

export const FLOORS: FloorData[] = Array.from({ length: 10 }, (_, i) => {
  const floor = (i + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  return {
    floor,
    label: FLOOR_LABELS[floor],
    totalSqm: floor === 1 ? 479 : 552,
    units: floor === 1 ? groundFloor() : standardFloor(floor),
  };
});
