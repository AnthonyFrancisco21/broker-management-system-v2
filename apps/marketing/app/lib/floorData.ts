export type UnitType = "S-24" | "S-28" | "S-36" | "S-40" | "S-75";

export type UnitStatus = "available" | "reserved" | "sold";

export interface Unit {
  id: string;
  roomNumber: string;
  type: UnitType;
  sqm: number;
  floor: number;
  status: UnitStatus;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface FloorData {
  floor: number;
  label: string;
  totalSqm: number;
  units: Unit[];
}

export const UNIT_SPECS: Record<
  UnitType,
  { sqm: number; label: string; color: string }
> = {
  "S-24": { sqm: 24, label: "Studio 24 sqm", color: "#93C5FD" },
  "S-28": { sqm: 28, label: "Studio 28 sqm", color: "#FCD34D" },
  "S-36": { sqm: 36, label: "Studio 36 sqm", color: "#86EFAC" },
  "S-40": { sqm: 40, label: "Studio 40 sqm", color: "#FDBA74" },
  "S-75": { sqm: 75, label: "Multi-purpose 75 sqm", color: "#C4B5FD" },
};

// Ground floor layout (unique - 17 units)
const groundFloorUnits = (floor: number): Unit[] => [
  {
    id: `${floor}-02`,
    roomNumber: `${floor}02`,
    type: "S-28",
    sqm: 28,
    floor,
    status: "available",
    position: { x: 180, y: 640, width: 110, height: 80 },
  },
  {
    id: `${floor}-03`,
    roomNumber: `${floor}03`,
    type: "S-28",
    sqm: 28,
    floor,
    status: "available",
    position: { x: 180, y: 560, width: 110, height: 80 },
  },
  {
    id: `${floor}-04`,
    roomNumber: `${floor}04`,
    type: "S-28",
    sqm: 28,
    floor,
    status: "available",
    position: { x: 290, y: 560, width: 110, height: 80 },
  },
  {
    id: `${floor}-05`,
    roomNumber: `${floor}05`,
    type: "S-28",
    sqm: 28,
    floor,
    status: "available",
    position: { x: 180, y: 480, width: 110, height: 80 },
  },
  {
    id: `${floor}-07`,
    roomNumber: `${floor}07`,
    type: "S-28",
    sqm: 28,
    floor,
    status: "available",
    position: { x: 180, y: 400, width: 110, height: 80 },
  },
  {
    id: `${floor}-09`,
    roomNumber: `${floor}09`,
    type: "S-28",
    sqm: 28,
    floor,
    status: "available",
    position: { x: 180, y: 320, width: 110, height: 80 },
  },
  {
    id: `${floor}-11`,
    roomNumber: `${floor}11`,
    type: "S-28",
    sqm: 28,
    floor,
    status: "available",
    position: { x: 180, y: 240, width: 110, height: 80 },
  },
  {
    id: `${floor}-13`,
    roomNumber: `${floor}13`,
    type: "S-28",
    sqm: 28,
    floor,
    status: "available",
    position: { x: 180, y: 160, width: 110, height: 80 },
  },
  {
    id: `${floor}-06`,
    roomNumber: `${floor}06`,
    type: "S-24",
    sqm: 24,
    floor,
    status: "available",
    position: { x: 400, y: 480, width: 110, height: 80 },
  },
  {
    id: `${floor}-08`,
    roomNumber: `${floor}08`,
    type: "S-24",
    sqm: 24,
    floor,
    status: "available",
    position: { x: 400, y: 400, width: 110, height: 80 },
  },
  {
    id: `${floor}-10`,
    roomNumber: `${floor}10`,
    type: "S-24",
    sqm: 24,
    floor,
    status: "available",
    position: { x: 400, y: 320, width: 110, height: 80 },
  },
  {
    id: `${floor}-12`,
    roomNumber: `${floor}12`,
    type: "S-24",
    sqm: 24,
    floor,
    status: "available",
    position: { x: 400, y: 240, width: 110, height: 80 },
  },
  {
    id: `${floor}-14`,
    roomNumber: `${floor}14`,
    type: "S-24",
    sqm: 24,
    floor,
    status: "available",
    position: { x: 400, y: 160, width: 110, height: 80 },
  },
  {
    id: `${floor}-15`,
    roomNumber: `${floor}15`,
    type: "S-24",
    sqm: 24,
    floor,
    status: "available",
    position: { x: 400, y: 80, width: 110, height: 80 },
  },
  {
    id: `${floor}-01`,
    roomNumber: `${floor}01`,
    type: "S-36",
    sqm: 36,
    floor,
    status: "available",
    position: { x: 180, y: 720, width: 220, height: 90 },
  },
  {
    id: `${floor}-36c`,
    roomNumber: `${floor === 1 ? "101" : `${floor}17`}`,
    type: "S-36",
    sqm: 36,
    floor,
    status: "available",
    position: { x: 40, y: 60, width: 120, height: 100 },
  },
  {
    id: `${floor}-36a`,
    roomNumber: `${floor === 1 ? "101" : `${floor}18`}`,
    type: "S-36",
    sqm: 36,
    floor,
    status: "available",
    position: { x: 160, y: 60, width: 100, height: 100 },
  },
  {
    id: `${floor}-36b`,
    roomNumber: `${floor === 1 ? "101" : `${floor}19`}`,
    type: "S-36",
    sqm: 36,
    floor,
    status: "available",
    position: { x: 260, y: 60, width: 100, height: 100 },
  },
  {
    id: `${floor}-16`,
    roomNumber: `${floor}16`,
    type: "S-40",
    sqm: 40,
    floor,
    status: "available",
    position: { x: 400, y: 60, width: 120, height: 100 },
  },
];

// Standard floors 2-10 layout (19 units each)
const standardFloorUnits = (floor: number): Unit[] => {
  const f = floor.toString();
  return [
    {
      id: `${f}-02`,
      roomNumber: `${f}02`,
      type: "S-28",
      sqm: 28,
      floor,
      status: "available",
      position: { x: 185, y: 640, width: 115, height: 82 },
    },
    {
      id: `${f}-03`,
      roomNumber: `${f}03`,
      type: "S-28",
      sqm: 28,
      floor,
      status: "available",
      position: { x: 185, y: 558, width: 115, height: 82 },
    },
    {
      id: `${f}-04`,
      roomNumber: `${f}04`,
      type: "S-28",
      sqm: 28,
      floor,
      status: "available",
      position: { x: 300, y: 558, width: 115, height: 82 },
    },
    {
      id: `${f}-05`,
      roomNumber: `${f}05`,
      type: "S-28",
      sqm: 28,
      floor,
      status: "available",
      position: { x: 185, y: 476, width: 115, height: 82 },
    },
    {
      id: `${f}-07`,
      roomNumber: `${f}07`,
      type: "S-28",
      sqm: 28,
      floor,
      status: "available",
      position: { x: 185, y: 394, width: 115, height: 82 },
    },
    {
      id: `${f}-09`,
      roomNumber: `${f}09`,
      type: "S-28",
      sqm: 28,
      floor,
      status: "available",
      position: { x: 185, y: 312, width: 115, height: 82 },
    },
    {
      id: `${f}-11`,
      roomNumber: `${f}11`,
      type: "S-28",
      sqm: 28,
      floor,
      status: "available",
      position: { x: 185, y: 230, width: 115, height: 82 },
    },
    {
      id: `${f}-13`,
      roomNumber: `${f}13`,
      type: "S-28",
      sqm: 28,
      floor,
      status: "available",
      position: { x: 185, y: 148, width: 115, height: 82 },
    },
    {
      id: `${f}-06`,
      roomNumber: `${f}06`,
      type: "S-24",
      sqm: 24,
      floor,
      status: "available",
      position: { x: 415, y: 476, width: 112, height: 82 },
    },
    {
      id: `${f}-08`,
      roomNumber: `${f}08`,
      type: "S-24",
      sqm: 24,
      floor,
      status: "available",
      position: { x: 415, y: 394, width: 112, height: 82 },
    },
    {
      id: `${f}-10`,
      roomNumber: `${f}10`,
      type: "S-24",
      sqm: 24,
      floor,
      status: "available",
      position: { x: 415, y: 312, width: 112, height: 82 },
    },
    {
      id: `${f}-12`,
      roomNumber: `${f}12`,
      type: "S-24",
      sqm: 24,
      floor,
      status: "available",
      position: { x: 415, y: 230, width: 112, height: 82 },
    },
    {
      id: `${f}-14`,
      roomNumber: `${f}14`,
      type: "S-24",
      sqm: 24,
      floor,
      status: "available",
      position: { x: 415, y: 148, width: 112, height: 82 },
    },
    {
      id: `${f}-15`,
      roomNumber: `${f}15`,
      type: "S-24",
      sqm: 24,
      floor,
      status: "available",
      position: { x: 415, y: 66, width: 112, height: 82 },
    },
    {
      id: `${f}-01`,
      roomNumber: `${f}01`,
      type: "S-36",
      sqm: 36,
      floor,
      status: "available",
      position: { x: 185, y: 722, width: 230, height: 90 },
    },
    {
      id: `${f}-17`,
      roomNumber: `${f}17`,
      type: "S-36",
      sqm: 36,
      floor,
      status: "available",
      position: { x: 44, y: 66, width: 141, height: 82 },
    },
    {
      id: `${f}-18`,
      roomNumber: `${f}18`,
      type: "S-36",
      sqm: 36,
      floor,
      status: "available",
      position: { x: 185, y: 66, width: 115, height: 82 },
    },
    {
      id: `${f}-19`,
      roomNumber: `${f}19`,
      type: "S-36",
      sqm: 36,
      floor,
      status: "available",
      position: { x: 300, y: 66, width: 115, height: 82 },
    },
    {
      id: `${f}-16`,
      roomNumber: `${f}16`,
      type: "S-40",
      sqm: 40,
      floor,
      status: "available",
      position: { x: 415, y: 66, width: 112, height: 82 },
    },
  ];
};

export function generateFloorData(): FloorData[] {
  const floors: FloorData[] = [];
  for (let i = 1; i <= 10; i++) {
    const isGround = i === 1;
    floors.push({
      floor: i,
      label: i === 1 ? "Upper Ground Level" : `${getOrdinal(i)} Floor`,
      totalSqm: i === 1 ? 479 : 552,
      units: isGround ? groundFloorUnits(i) : standardFloorUnits(i),
    });
  }
  return floors;
}

// 100% Type-Safe Ordinal Number Generator
function getOrdinal(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) {
    return n + "th";
  }
  switch (n % 10) {
    case 1:
      return n + "st";
    case 2:
      return n + "nd";
    case 3:
      return n + "rd";
    default:
      return n + "th";
  }
}

export const FLOORS = generateFloorData();
