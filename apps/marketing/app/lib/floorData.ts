export type UnitType = "S-24" | "S-28" | "S-36" | "S-40" | "S-75";
// Mapped to your visual themes
export type UnitStatus = "available" | "reserved" | "sold";

export interface Unit {
  id: string;
  roomNumber: string;
  type: UnitType;
  sqm: number;
  floor: number;
  status: UnitStatus;
  price?: number | null;
  installmentPerMonth?: number | null;
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
  "S-75": {
    sqm: 108,
    description:
      "Multi-purpose premium unit with expansive space and specialized amenities.",
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
