export type UnitType = "S-24" | "S-28" | "S-36" | "S-40";
export type UnitStatus = "available" | "reserved" | "sold";

export interface Unit {
  id: string;
  roomNumber: string; // e.g. "101", "210"
  type: UnitType;
  sqm: number;
  floor: number;
  status: UnitStatus;
}

export interface FloorData {
  floor: number;
  label: string;
  totalSqm: number;
  units: Unit[];
}

export const UNIT_SPECS: Record<
  UnitType,
  { sqm: number; description: string }
> = {
  "S-24": {
    sqm: 24,
    description:
      "Compact studio with efficient open-plan layout and premium finishes.",
  },
  "S-28": {
    sqm: 28,
    description:
      "Spacious studio with dedicated sleeping zone and modern amenities.",
  },
  "S-36": {
    sqm: 36,
    description:
      "Junior suite with generous living area and separate dining space.",
  },
  "S-40": {
    sqm: 40,
    description:
      "Premium corner suite with panoramic views and expansive layout.",
  },
};

export const FLOOR_LABELS: Record<number, string> = {
  1: "Upper Ground",
  2: "Floor 2",
  3: "Floor 3",
  4: "Floor 4",
  5: "Floor 5",
  6: "Floor 6",
  7: "Floor 7",
  8: "Floor 8",
  9: "Floor 9",
  10: "Floor 10",
};

function u(
  floor: number,
  num: number,
  type: UnitType,
  status: UnitStatus = "available",
): Unit {
  const rn = `${floor}${String(num).padStart(2, "0")}`;
  return {
    id: `${floor}-${rn}`,
    roomNumber: rn,
    type,
    sqm: UNIT_SPECS[type].sqm,
    floor,
    status,
  };
}

function buildFloor(floor: number, sqm: number): FloorData {
  return {
    floor,
    label: FLOOR_LABELS[floor] ?? `Floor ${floor}`,
    totalSqm: sqm,
    units: [
      u(floor, 10, "S-36"), // Wing left    RM10
      u(floor, 18, "S-36"), // Wing mid-A   RM18
      u(floor, 17, "S-36"), // Wing mid-B   RM17
      u(floor, 16, "S-40"), // Wing right   RM16
      u(floor, 13, "S-28"), // Left col row 0
      u(floor, 11, "S-28"), // Left col row 1
      u(floor, 9, "S-28"), // Left col row 2
      u(floor, 7, "S-28"), // Left col row 3
      u(floor, 5, "S-28"), // Left col row 4
      u(floor, 3, "S-28"), // Left col row 5
      u(floor, 2, "S-28"), // Left col row 6
      u(floor, 15, "S-24"), // Right col RM15 (below S-40)
      u(floor, 14, "S-24"), // Right col row 0
      u(floor, 12, "S-24"), // Right col row 1
      u(floor, 10, "S-24"), // Right col row 2
      u(floor, 8, "S-24"), // Right col row 3
      u(floor, 6, "S-24"), // Right col row 4
      u(floor, 4, "S-28"), // Right col row 5 (amber, not blue)
      u(floor, 1, "S-36"), // Bottom RM01
    ],
  };
}

export const FLOORS: FloorData[] = [
  buildFloor(1, 479),
  ...Array.from({ length: 9 }, (_, i) => buildFloor(i + 2, 552)),
];
