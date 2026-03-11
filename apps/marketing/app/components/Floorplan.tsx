"use client";

import { useState } from "react";
import {
  Unit,
  FloorData,
  UNIT_SPECS,
  UnitType,
  UnitStatus,
} from "../lib/floorData";

interface FloorPlanProps {
  floorData: FloorData;
  onUnitClick: (unit: Unit) => void;
}

const STATUS_COLORS: Record<
  UnitStatus,
  { fill: string; stroke: string; text: string }
> = {
  available: { fill: "", stroke: "", text: "" },
  reserved: { fill: "#FEF3C7", stroke: "#D97706", text: "#92400E" },
  sold: { fill: "#FEE2E2", stroke: "#DC2626", text: "#991B1B" },
};

const TYPE_COLORS: Record<
  UnitType,
  { fill: string; stroke: string; text: string }
> = {
  "S-24": { fill: "#A8CBE8", stroke: "#5A8FB0", text: "#1E3A5F" },
  "S-28": { fill: "#F8CE8F", stroke: "#C88A3A", text: "#6B3A10" },
  "S-36": { fill: "#BEDD9A", stroke: "#72A050", text: "#2A4F10" },
  "S-40": { fill: "#F5A84A", stroke: "#C06A10", text: "#5C2A00" },
  "S-75": { fill: "#DDD6FE", stroke: "#7C3AED", text: "#4C1D95" },
};

// ═══════════════════════════════════════════════════════
//  COORDINATE MAP  — viewBox "0 0 900 1100"
//
//  Traced directly from the image, scaled proportionally.
//
//  Building outer polygon (main block, not the wing):
//   Top-left:     (290, 160)
//   Top-right:    (750, 160)
//   Bottom-right: (750, 970)
//   Bottom-left:  (290, 970)
//
//  Top wing (L-shape green block):
//   Outer left:   x=90   (S-36c left edge)
//   Outer top:    y=120
//   Bottom:       y=320  (bottom of wing, aligns with row 0 top)
//
//  Columns:
//   Left S-28:   x=290  w=170
//   Pullway:     x=460  w=75
//   Right S-24:  x=535  w=165
//   Right edge:  x=700
//
//  Rows (8 rows + bottom unit):
//   Row start: y=320
//   Row height: RH=78
// ═══════════════════════════════════════════════════════

// Primary geometry
const LX = 290; // left col X
const LW = 170; // left col width
const PX = 460; // pullway X
const PW = 75; // pullway width
const RX = 535; // right col X
const RW = 165; // right col width
const RE = 700; // right edge

const WING_Y = 120; // top of wing
const WING_BOT = 320; // bottom of wing = top of row 0
const WING_H = WING_BOT - WING_Y;

const ROW_START = 320;
const RH = 78;

const ry = (i: number) => ROW_START + i * RH;

// Wing cell positions (traced from image)
// S-36c RM10: the L-shaped leftmost cell — wider, L-bump protrudes left+down
const W36C_X = 90; // far left
const W36C_W = 200; // wide
const W36A_X = 290; // S-36A RM18 starts at left column X
const W36A_W = 115;
const W36B_X = 405; // S-36B RM17
const W36B_W = 55; // narrow, up to stair core
const CORE_X = 460; // stair core = pullway width
const CORE_W = 75;
const W40_X = 535; // S-40 RM16
const W40_W = 165;

function buildUnits(floor: number): Unit[] {
  const rn = (n: number) => `${floor}${String(n).padStart(2, "0")}`;
  const mk = (
    id: string,
    roomNumber: string,
    type: UnitType,
    x: number,
    y: number,
    w: number,
    h: number,
  ): Unit => ({
    id,
    roomNumber,
    type,
    sqm: UNIT_SPECS[type].sqm,
    floor,
    status: "available",
    position: { x, y, width: w, height: h },
  });

  return [
    // TOP WING
    mk(`${floor}-w36c`, rn(10), "S-36", W36C_X, WING_Y, W36C_W, WING_H),
    mk(`${floor}-w36a`, rn(18), "S-36", W36A_X, WING_Y, W36A_W, WING_H),
    mk(`${floor}-w36b`, rn(17), "S-36", W36B_X, WING_Y, W36B_W, WING_H),
    mk(`${floor}-w40`, rn(16), "S-40", W40_X, WING_Y, W40_W, WING_H),
    // LEFT COLUMN S-28
    mk(`${floor}-13`, rn(13), "S-28", LX, ry(0), LW, RH),
    mk(`${floor}-11`, rn(11), "S-28", LX, ry(1), LW, RH),
    mk(`${floor}-09`, rn(9), "S-28", LX, ry(2), LW, RH),
    mk(`${floor}-07`, rn(7), "S-28", LX, ry(3), LW, RH),
    mk(`${floor}-05`, rn(5), "S-28", LX, ry(4), LW, RH),
    mk(`${floor}-03`, rn(3), "S-28", LX, ry(5), LW, RH),
    mk(`${floor}-02`, rn(2), "S-28", LX, ry(6), LW, RH),
    // RIGHT COLUMN S-24 (rows 0–5) + S-28 RM04 (row 6)
    mk(`${floor}-15`, rn(15), "S-24", RX, ry(0), RW, RH),
    mk(`${floor}-14`, rn(14), "S-24", RX, ry(1), RW, RH),
    mk(`${floor}-12`, rn(12), "S-24", RX, ry(2), RW, RH),
    mk(`${floor}-10`, rn(10), "S-24", RX, ry(3), RW, RH),
    mk(`${floor}-08`, rn(8), "S-24", RX, ry(4), RW, RH),
    mk(`${floor}-06`, rn(6), "S-24", RX, ry(5), RW, RH),
    mk(`${floor}-04`, rn(4), "S-28", RX, ry(6), RW, RH),
    // BOTTOM S-36c RM01 (spans left + pullway)
    mk(`${floor}-01`, rn(1), "S-36", LX, ry(7), LW + PW, 82),
  ];
}

// ─── Architectural detail renderers ───────────────────────────

// S-28 unit interior details (bathroom block top-left + door hinge right side)
function S28Details({
  x,
  y,
  w,
  h,
  stroke,
  hov,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  stroke: string;
  hov: boolean;
}) {
  if (hov) return null;
  return (
    <g opacity={0.7}>
      {/* Bathroom block — small rectangle top-left */}
      <rect
        x={x + 6}
        y={y + 6}
        width={32}
        height={24}
        fill="none"
        stroke={stroke}
        strokeWidth="0.8"
      />
      {/* Toilet hint circle */}
      <ellipse
        cx={x + 22}
        cy={y + 18}
        rx={6}
        ry={8}
        fill="none"
        stroke={stroke}
        strokeWidth="0.7"
      />
      {/* Door swing — right side, opening inward */}
      <line
        x1={x + w - 2}
        y1={y + h - 4}
        x2={x + w - 2}
        y2={y + h - 22}
        stroke={stroke}
        strokeWidth="1.2"
      />
      <path
        d={`M ${x + w - 2} ${y + h - 22} A 18 18 0 0 0 ${x + w - 20} ${y + h - 4}`}
        fill="none"
        stroke={stroke}
        strokeWidth="0.9"
      />
    </g>
  );
}

// S-24 unit interior details (bathroom block top-right + arc door swing)
function S24Details({
  x,
  y,
  w,
  h,
  stroke,
  hov,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  stroke: string;
  hov: boolean;
}) {
  if (hov) return null;
  return (
    <g opacity={0.7}>
      {/* Bathroom rectangle top-right */}
      <rect
        x={x + w - 38}
        y={y + 6}
        width={32}
        height={24}
        fill="none"
        stroke={stroke}
        strokeWidth="0.8"
      />
      <ellipse
        cx={x + w - 22}
        cy={y + 18}
        rx={6}
        ry={8}
        fill="none"
        stroke={stroke}
        strokeWidth="0.7"
      />
      {/* Small sink hint */}
      <rect
        x={x + w - 38}
        y={y + 6}
        width={12}
        height={10}
        fill="none"
        stroke={stroke}
        strokeWidth="0.6"
      />
      {/* Arc door swing — left side */}
      <line
        x1={x + 2}
        y1={y + h - 4}
        x2={x + 2}
        y2={y + h - 22}
        stroke={stroke}
        strokeWidth="1.2"
      />
      <path
        d={`M ${x + 2} ${y + h - 22} A 18 18 0 0 1 ${x + 20} ${y + h - 4}`}
        fill="none"
        stroke={stroke}
        strokeWidth="0.9"
      />
    </g>
  );
}

// S-36 / S-40 wing unit details
function WingDetails({
  x,
  y,
  w,
  h,
  stroke,
  hov,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  stroke: string;
  hov: boolean;
}) {
  if (hov) return null;
  return (
    <g opacity={0.65}>
      <rect
        x={x + 8}
        y={y + 8}
        width={40}
        height={28}
        fill="none"
        stroke={stroke}
        strokeWidth="0.8"
      />
      <ellipse
        cx={x + 28}
        cy={y + 22}
        rx={8}
        ry={10}
        fill="none"
        stroke={stroke}
        strokeWidth="0.7"
      />
      <rect
        x={x + 8}
        y={y + 8}
        width={16}
        height={12}
        fill="none"
        stroke={stroke}
        strokeWidth="0.6"
      />
      {/* Door bottom */}
      <line
        x1={x + 6}
        y1={y + h - 2}
        x2={x + 6}
        y2={y + h - 20}
        stroke={stroke}
        strokeWidth="1.2"
      />
      <path
        d={`M ${x + 6} ${y + h - 20} A 18 18 0 0 1 ${x + 24} ${y + h - 2}`}
        fill="none"
        stroke={stroke}
        strokeWidth="0.9"
      />
    </g>
  );
}

export default function FloorPlan({ floorData, onUnitClick }: FloorPlanProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const units: Unit[] = buildUnits(floorData.floor).map((u) => {
    const live = floorData.units.find((fu) => fu.roomNumber === u.roomNumber);
    return live ? { ...u, status: live.status } : u;
  });

  const getColors = (u: Unit) =>
    u.status !== "available" ? STATUS_COLORS[u.status] : TYPE_COLORS[u.type];

  const isGround = floorData.floor === 1;

  const SVG_W = 900;
  const SVG_H = 1100;

  // Stairwell bottom-right (below row 6 on right col)
  const STAIR_X = RX;
  const STAIR_Y = ry(7);
  const STAIR_W = RW;
  const STAIR_H = 110;

  // Bottom service rooms (BUTCH / CLEAN) from image
  const SVC_Y = STAIR_Y + STAIR_H + 10;

  const legendTypes: UnitType[] = ["S-24", "S-28", "S-36", "S-40"];

  return (
    <div className="w-full">
      {/* ── Legend ── */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 justify-center mb-5 pb-4 border-b border-[#ece9e3]">
        {legendTypes.map((t) => {
          const c = TYPE_COLORS[t];
          return (
            <div key={t} className="flex items-center gap-2">
              <div
                className="w-4 h-4 shrink-0"
                style={{
                  background: c.fill,
                  border: `2.5px solid ${c.stroke}`,
                }}
              />
              <span className="font-['Cormorant_Garamond',_serif] text-[12px] font-semibold tracking-[0.06em] text-slate-600 uppercase">
                {t} · {UNIT_SPECS[t].sqm}sqm
              </span>
            </div>
          );
        })}
        {[
          { label: "Reserved", fill: "#FEF3C7", stroke: "#D97706" },
          { label: "Sold", fill: "#FEE2E2", stroke: "#DC2626" },
        ].map(({ label, fill, stroke }) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className="w-4 h-4 shrink-0"
              style={{ background: fill, border: `2.5px solid ${stroke}` }}
            />
            <span className="font-['Cormorant_Garamond',_serif] text-[12px] tracking-[0.06em] text-slate-600 uppercase">
              {label}
            </span>
          </div>
        ))}
        {isGround && (
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 shrink-0"
              style={{ background: "#BAE6FD", border: "2.5px solid #38BDF8" }}
            />
            <span className="font-['Cormorant_Garamond',_serif] text-[12px] tracking-[0.06em] text-slate-600 uppercase">
              Pool
            </span>
          </div>
        )}
      </div>

      {/* ── SVG Canvas ── */}
      <div className="w-full max-w-[720px] mx-auto">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full h-auto"
          style={{ background: "#F0EDE6", border: "2.5px solid #7A6E60" }}
        >
          <defs>
            {/* X-hatch paver pattern — matches image tile texture */}
            <pattern
              id="xhatch"
              x="0"
              y="0"
              width="28"
              height="28"
              patternUnits="userSpaceOnUse"
            >
              <rect width="28" height="28" fill="#E8E2D5" />
              <rect
                x="1"
                y="1"
                width="26"
                height="26"
                fill="none"
                stroke="#CFC8B8"
                strokeWidth="0.8"
              />
              <line
                x1="1"
                y1="1"
                x2="27"
                y2="27"
                stroke="#CFC8B8"
                strokeWidth="0.5"
              />
              <line
                x1="27"
                y1="1"
                x2="1"
                y2="27"
                stroke="#CFC8B8"
                strokeWidth="0.5"
              />
            </pattern>
            {/* Ramp diagonal lines */}
            <pattern
              id="ramp"
              x="0"
              y="0"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(30)"
            >
              <line
                x1="0"
                y1="5"
                x2="10"
                y2="5"
                stroke="#8A8070"
                strokeWidth="0.8"
              />
            </pattern>
          </defs>

          {/* ═══════════════════════════════════════
               1. OUTER BUILDING IRREGULAR POLYGON
               Traced from image — the main block has
               a stepped top-right corner cut and
               overall rectangular shape.
              ═══════════════════════════════════════ */}

          {/* Main building block (right portion including all units) */}
          <polygon
            points={`
              ${LX},${WING_BOT}
              ${LX},${WING_Y}
              ${W40_X},${WING_Y}
              ${W40_X + W40_W},${WING_Y}
              ${W40_X + W40_W},${ry(7) + 82}
              ${LX},${ry(7) + 82}
            `}
            fill="#EDE8DF"
            stroke="#4A3F30"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Top wing extension (L-shape block — green wing that sticks out left) */}
          {/* The L-shape: wide left cell that is taller and extends further left */}
          <polygon
            points={`
              ${W36C_X},${WING_Y + 40}
              ${W36C_X},${WING_BOT}
              ${LX - 2},${WING_BOT}
              ${LX - 2},${WING_Y}
              ${W36C_X + W36C_W},${WING_Y}
              ${W36C_X + W36C_W},${WING_Y + 40}
            `}
            fill="#EDE8DF"
            stroke="#4A3F30"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Bottom stairwell area extension (below RM01, right side) */}
          <rect
            x={LX}
            y={ry(7) + 82}
            width={LW + PW + RW}
            height={STAIR_H + 60}
            fill="#EDE8DF"
            stroke="#4A3F30"
            strokeWidth="2.5"
          />

          {/* ═══════════════════════════════════════
               2. AMENITY DECK — paver tile area
               Left of the main unit block, ground floor context
              ═══════════════════════════════════════ */}
          {/* Left paver zone beside main rows */}
          <rect
            x="30"
            y={ROW_START}
            width={LX - 30}
            height={RH * 7 + 82}
            fill="url(#xhatch)"
            stroke="#B0A898"
            strokeWidth="1"
          />

          {/* Top-left paver zone beside the wing */}
          <rect
            x="30"
            y={WING_Y}
            width={W36C_X - 30}
            height={WING_H + RH}
            fill="url(#xhatch)"
            stroke="#B0A898"
            strokeWidth="1"
          />

          {/* Left boundary wall of the building (the thick outer wall on the far left of image) */}
          <polyline
            points={`30,${WING_Y + 40} 30,${ry(7) + 82 + STAIR_H + 40} ${LX},${ry(7) + 82 + STAIR_H + 40}`}
            fill="none"
            stroke="#4A3F30"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Amenity deck labels */}
          {isGround && (
            <>
              <text
                x={30 + (LX - 30) / 2}
                y={ry(5) + 20}
                textAnchor="middle"
                style={{
                  fontFamily: "sans-serif",
                  fontSize: "11px",
                  fontWeight: "700",
                  fill: "#5C5040",
                  letterSpacing: "1.5px",
                }}
              >
                AMENITY DECK AT
              </text>
              <text
                x={30 + (LX - 30) / 2}
                y={ry(5) + 36}
                textAnchor="middle"
                style={{
                  fontFamily: "sans-serif",
                  fontSize: "11px",
                  fontWeight: "700",
                  fill: "#5C5040",
                  letterSpacing: "1.5px",
                }}
              >
                UPPER GROUND
              </text>
            </>
          )}

          {/* ═══════════════════════════════════════
               3. POOL  (ground floor only)
              ═══════════════════════════════════════ */}
          {isGround && (
            <g>
              {/* Pool rectangle */}
              <rect
                x="55"
                y={ROW_START + 18}
                width="168"
                height={RH * 5 - 10}
                fill="#BAE6FD"
                stroke="#29A8D8"
                strokeWidth="2"
                rx="2"
              />
              {/* POOL FEED side strip */}
              <rect
                x="55"
                y={ROW_START + 18}
                width="46"
                height={RH * 5 - 10}
                fill="#72C8EE"
                stroke="#29A8D8"
                strokeWidth="1"
                rx="2"
              />
              <text
                x="78"
                y={ROW_START + RH * 2.5 + 14}
                textAnchor="middle"
                transform={`rotate(-90, 78, ${ROW_START + RH * 2.5 + 14})`}
                style={{
                  fontFamily: "sans-serif",
                  fontSize: "9px",
                  fontWeight: "700",
                  fill: "#075985",
                  letterSpacing: "2px",
                }}
              >
                POOL FEED
              </text>
              {/* Lane dividers */}
              {[1, 2, 3].map((i) => (
                <line
                  key={i}
                  x1="103"
                  y1={ROW_START + 18 + i * ((RH * 5 - 10) / 4)}
                  x2="221"
                  y2={ROW_START + 18 + i * ((RH * 5 - 10) / 4)}
                  stroke="#52BDE0"
                  strokeWidth="1"
                  strokeDasharray="10 6"
                />
              ))}
              {/* POOL text */}
              <text
                x="162"
                y={ROW_START + RH * 2.5 + 20}
                textAnchor="middle"
                style={{
                  fontFamily: "sans-serif",
                  fontSize: "20px",
                  fontWeight: "700",
                  fill: "#0369A1",
                  letterSpacing: "6px",
                }}
              >
                POOL
              </text>
            </g>
          )}

          {/* ═══════════════════════════════════════
               4. PULLWAY CORRIDOR
              ═══════════════════════════════════════ */}
          <rect
            x={PX}
            y={ROW_START}
            width={PW}
            height={RH * 7}
            fill="#E0D8C8"
            stroke="#8A7E6C"
            strokeWidth="1.5"
          />
          <text
            x={PX + PW / 2}
            y={ROW_START + RH * 3.5}
            textAnchor="middle"
            dominantBaseline="middle"
            transform={`rotate(-90, ${PX + PW / 2}, ${ROW_START + RH * 3.5})`}
            style={{
              fontFamily: "sans-serif",
              fontSize: "11px",
              fontWeight: "800",
              fill: "#7A6E5C",
              letterSpacing: "5px",
            }}
          >
            PULLWAY
          </text>

          {/* ═══════════════════════════════════════
               5. STAIR / ELEVATOR CORE (top, between wing and RM15)
               The X-cross box visible in the image
              ═══════════════════════════════════════ */}
          <rect
            x={CORE_X}
            y={WING_Y}
            width={CORE_W}
            height={WING_H}
            fill="#D8D0C2"
            stroke="#7A6E5C"
            strokeWidth="2"
          />
          {/* X cross */}
          <line
            x1={CORE_X + 6}
            y1={WING_Y + 6}
            x2={CORE_X + CORE_W - 6}
            y2={WING_Y + WING_H - 6}
            stroke="#7A6E5C"
            strokeWidth="2"
          />
          <line
            x1={CORE_X + CORE_W - 6}
            y1={WING_Y + 6}
            x2={CORE_X + 6}
            y2={WING_Y + WING_H - 6}
            stroke="#7A6E5C"
            strokeWidth="2"
          />
          {/* Stair step lines inside top core (visible in image) */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line
              key={i}
              x1={CORE_X + 8}
              y1={WING_Y + 20 + i * 14}
              x2={CORE_X + CORE_W - 8}
              y2={WING_Y + 20 + i * 14}
              stroke="#9A8E7E"
              strokeWidth="0.8"
            />
          ))}

          {/* ═══════════════════════════════════════
               6. BOTTOM-RIGHT STAIRWELL
               Stair steps left half + two X-lift boxes right
              ═══════════════════════════════════════ */}
          <rect
            x={STAIR_X}
            y={STAIR_Y}
            width={STAIR_W}
            height={STAIR_H}
            fill="#D8D0C2"
            stroke="#7A6E5C"
            strokeWidth="2"
          />
          {/* Stair steps (left portion of the stairwell) */}
          {Array.from({ length: 10 }).map((_, i) => (
            <g key={i}>
              <line
                x1={STAIR_X + 8}
                y1={STAIR_Y + 8 + i * 9}
                x2={STAIR_X + STAIR_W / 2 - 4}
                y2={STAIR_Y + 8 + i * 9}
                stroke="#7A6E5C"
                strokeWidth="1.2"
              />
            </g>
          ))}
          {/* Arrow indicating stair direction */}
          <text
            x={STAIR_X + STAIR_W / 4}
            y={STAIR_Y + STAIR_H - 8}
            textAnchor="middle"
            style={{
              fontFamily: "sans-serif",
              fontSize: "7px",
              fill: "#7A6E5C",
              letterSpacing: "0.5px",
            }}
          >
            STAIRS
          </text>
          {/* Two X-cross lift boxes (right half of stairwell) */}
          {[0, 1].map((i) => {
            const bx = STAIR_X + STAIR_W / 2 + 6 + i * 40;
            const by = STAIR_Y + 12;
            const bs = 34;
            return (
              <g key={i}>
                <rect
                  x={bx}
                  y={by}
                  width={bs}
                  height={bs}
                  fill="#C8C0B0"
                  stroke="#7A6E5C"
                  strokeWidth="1.5"
                />
                <line
                  x1={bx + 4}
                  y1={by + 4}
                  x2={bx + bs - 4}
                  y2={by + bs - 4}
                  stroke="#7A6E5C"
                  strokeWidth="1.5"
                />
                <line
                  x1={bx + bs - 4}
                  y1={by + 4}
                  x2={bx + 4}
                  y2={by + bs - 4}
                  stroke="#7A6E5C"
                  strokeWidth="1.5"
                />
              </g>
            );
          })}
          <text
            x={STAIR_X + (STAIR_W * 3) / 4}
            y={STAIR_Y + STAIR_H - 8}
            textAnchor="middle"
            style={{
              fontFamily: "sans-serif",
              fontSize: "7px",
              fill: "#7A6E5C",
              letterSpacing: "0.5px",
            }}
          >
            LIFT
          </text>

          {/* ═══════════════════════════════════════
               7. SERVICE ROOMS (BUTCH / CLEAN) — bottom right
               Two small labeled boxes from image
              ═══════════════════════════════════════ */}
          {[
            { label: "BUTCH", x: STAIR_X },
            { label: "CLEAN", x: STAIR_X + RW / 2 },
          ].map(({ label, x: bx }) => (
            <g key={label}>
              <rect
                x={bx + 6}
                y={SVC_Y}
                width={RW / 2 - 12}
                height={36}
                fill="#D8D0C2"
                stroke="#7A6E5C"
                strokeWidth="1.5"
              />
              <text
                x={bx + RW / 4}
                y={SVC_Y + 22}
                textAnchor="middle"
                style={{
                  fontFamily: "sans-serif",
                  fontSize: "7.5px",
                  fontWeight: "700",
                  fill: "#5A4E3C",
                  letterSpacing: "1px",
                }}
              >
                {label}
              </text>
            </g>
          ))}

          {/* ═══════════════════════════════════════
               8. OUTER THICK WALLS
               The bold black outline of the whole building visible in image
              ═══════════════════════════════════════ */}
          {/* Top wall line across the whole top */}
          <line
            x1={W36C_X}
            y1={WING_Y}
            x2={RE}
            y2={WING_Y}
            stroke="#2C2418"
            strokeWidth="3.5"
          />
          {/* Right wall (far right edge) */}
          <line
            x1={RE}
            y1={WING_Y}
            x2={RE}
            y2={ry(7) + 82}
            stroke="#2C2418"
            strokeWidth="3.5"
          />
          {/* Bottom wall of main block */}
          <line
            x1={LX}
            y1={ry(7) + 82}
            x2={RE}
            y2={ry(7) + 82}
            stroke="#2C2418"
            strokeWidth="3.5"
          />
          {/* Left wall of main block (from wing bottom to bottom) */}
          <line
            x1={LX}
            y1={WING_BOT}
            x2={LX}
            y2={ry(7) + 82}
            stroke="#2C2418"
            strokeWidth="3.5"
          />
          {/* Wing left wall */}
          <line
            x1={W36C_X}
            y1={WING_Y + 40}
            x2={W36C_X}
            y2={WING_BOT}
            stroke="#2C2418"
            strokeWidth="3.5"
          />
          {/* Wing bottom-left step */}
          <line
            x1={W36C_X}
            y1={WING_BOT}
            x2={LX}
            y2={WING_BOT}
            stroke="#2C2418"
            strokeWidth="3.5"
          />
          {/* Wing top-left short wall (the L-bump top) */}
          <line
            x1={W36C_X}
            y1={WING_Y + 40}
            x2={W36C_X + (LX - W36C_X) / 2}
            y2={WING_Y + 40}
            stroke="#2C2418"
            strokeWidth="2.5"
          />

          {/* ═══════════════════════════════════════
               9. INTERNAL WALL GRID — thick lines between units
               Horizontal row dividers + vertical column walls
              ═══════════════════════════════════════ */}

          {/* Left column vertical walls */}
          <line
            x1={LX}
            y1={ROW_START}
            x2={LX}
            y2={ry(7)}
            stroke="#3A3020"
            strokeWidth="2.5"
          />
          <line
            x1={LX + LW}
            y1={ROW_START}
            x2={LX + LW}
            y2={ry(7) + 82}
            stroke="#3A3020"
            strokeWidth="2.5"
          />

          {/* Right column vertical walls */}
          <line
            x1={RX}
            y1={WING_Y}
            x2={RX}
            y2={ry(7)}
            stroke="#3A3020"
            strokeWidth="2.5"
          />
          <line
            x1={RX + RW}
            y1={WING_Y}
            x2={RX + RW}
            y2={ry(7)}
            stroke="#3A3020"
            strokeWidth="2.5"
          />

          {/* Wing horizontal dividers between S-36 cells */}
          <line
            x1={W36C_X}
            y1={WING_Y}
            x2={W36C_X + W36C_W}
            y2={WING_Y}
            stroke="#3A3020"
            strokeWidth="2"
          />
          <line
            x1={W36C_X + W36C_W}
            y1={WING_Y}
            x2={W36B_X + W36B_W}
            y2={WING_Y}
            stroke="#3A3020"
            strokeWidth="2"
          />
          {/* Vertical dividers inside wing */}
          <line
            x1={W36A_X}
            y1={WING_Y}
            x2={W36A_X}
            y2={WING_BOT}
            stroke="#3A3020"
            strokeWidth="2"
          />
          <line
            x1={W36A_X + W36A_W}
            y1={WING_Y}
            x2={W36A_X + W36A_W}
            y2={WING_BOT}
            stroke="#3A3020"
            strokeWidth="2"
          />
          <line
            x1={W36B_X + W36B_W}
            y1={WING_Y}
            x2={W36B_X + W36B_W}
            y2={WING_BOT}
            stroke="#3A3020"
            strokeWidth="2"
          />

          {/* Left column horizontal row dividers */}
          {[1, 2, 3, 4, 5, 6, 7].map((r) => (
            <line
              key={`lh${r}`}
              x1={LX}
              y1={ry(r)}
              x2={PX}
              y2={ry(r)}
              stroke="#3A3020"
              strokeWidth="2.5"
            />
          ))}
          {/* Right column horizontal row dividers */}
          {[1, 2, 3, 4, 5, 6].map((r) => (
            <line
              key={`rh${r}`}
              x1={RX}
              y1={ry(r)}
              x2={RX + RW}
              y2={ry(r)}
              stroke="#3A3020"
              strokeWidth="2.5"
            />
          ))}
          {/* Bottom RM01 */}
          <line
            x1={LX}
            y1={ry(7) + 82}
            x2={LX + LW + PW}
            y2={ry(7) + 82}
            stroke="#3A3020"
            strokeWidth="2.5"
          />
          {/* Pullway vertical walls */}
          <line
            x1={PX}
            y1={ROW_START}
            x2={PX}
            y2={ry(7)}
            stroke="#3A3020"
            strokeWidth="2"
          />
          <line
            x1={PX + PW}
            y1={ROW_START}
            x2={PX + PW}
            y2={ry(7)}
            stroke="#3A3020"
            strokeWidth="2"
          />

          {/* ═══════════════════════════════════════
               10. STRUCTURAL COLUMN DOTS
               Small filled squares at every wall intersection
              ═══════════════════════════════════════ */}
          {(() => {
            const dots: React.ReactNode[] = [];
            const xs = [LX, PX, PX + PW, RX, RX + RW];
            const ys = Array.from({ length: 9 }, (_, i) => ROW_START + i * RH);
            let k = 0;
            xs.forEach((cx) => {
              ys.forEach((cy) => {
                dots.push(
                  <rect
                    key={k++}
                    x={cx - 5}
                    y={cy - 5}
                    width="10"
                    height="10"
                    fill="#1A1208"
                    rx="1"
                  />,
                );
              });
            });
            // Wing column dots
            [W36A_X, W36A_X + W36A_W, W36B_X + W36B_W].forEach((cx) => {
              [WING_Y, WING_BOT].forEach((cy) => {
                dots.push(
                  <rect
                    key={k++}
                    x={cx - 5}
                    y={cy - 5}
                    width="10"
                    height="10"
                    fill="#1A1208"
                    rx="1"
                  />,
                );
              });
            });
            return <g>{dots}</g>;
          })()}

          {/* ═══════════════════════════════════════
               11. UNIT CELLS — colored fills + details
              ═══════════════════════════════════════ */}
          {units.map((unit) => {
            const colors = getColors(unit);
            const isHov = hoveredId === unit.id;
            const canClick = unit.status === "available";
            const { x, y, width: w, height: h } = unit.position;

            return (
              <g
                key={unit.id}
                onClick={() => onUnitClick(unit)}
                onMouseEnter={() => setHoveredId(unit.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{ cursor: canClick ? "pointer" : "not-allowed" }}
              >
                {/* Hover ring */}
                {isHov && (
                  <rect
                    x={x - 3}
                    y={y - 3}
                    width={w + 6}
                    height={h + 6}
                    fill="none"
                    stroke={colors.stroke}
                    strokeWidth="5"
                    opacity="0.35"
                    rx="2"
                  />
                )}

                {/* Unit fill */}
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  fill={isHov && canClick ? colors.stroke : colors.fill}
                  stroke={colors.stroke}
                  strokeWidth="1.5"
                  style={{ transition: "fill 0.12s ease" }}
                />

                {/* Sold diagonal */}
                {unit.status === "sold" && (
                  <line
                    x1={x + 8}
                    y1={y + 8}
                    x2={x + w - 8}
                    y2={y + h - 8}
                    stroke="#DC2626"
                    strokeWidth="1.5"
                    opacity="0.55"
                  />
                )}

                {/* Architectural interior details per unit type */}
                {unit.type === "S-28" && !unit.id.includes("w") && (
                  <S28Details
                    x={x}
                    y={y}
                    w={w}
                    h={h}
                    stroke={colors.stroke}
                    hov={isHov}
                  />
                )}
                {unit.type === "S-24" && (
                  <S24Details
                    x={x}
                    y={y}
                    w={w}
                    h={h}
                    stroke={colors.stroke}
                    hov={isHov}
                  />
                )}
                {(unit.type === "S-36" || unit.type === "S-40") && (
                  <WingDetails
                    x={x}
                    y={y}
                    w={w}
                    h={h}
                    stroke={colors.stroke}
                    hov={isHov}
                  />
                )}

                {/* Unit type label */}
                <text
                  x={x + w / 2}
                  y={y + h / 2 - 10}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: w > 150 ? "15px" : "13px",
                    fontWeight: "800",
                    fill: isHov && canClick ? "#fff" : colors.text,
                    letterSpacing: "0.8px",
                  }}
                >
                  {unit.type}
                </text>

                {/* Room number */}
                <text
                  x={x + w / 2}
                  y={y + h / 2 + 12}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: w > 150 ? "13px" : "11.5px",
                    fill:
                      isHov && canClick ? "rgba(255,255,255,0.92)" : "#3A2E1E",
                    letterSpacing: "0.5px",
                  }}
                >
                  RM {unit.roomNumber}
                </text>
              </g>
            );
          })}

          {/* ═══════════════════════════════════════
               12. FLOOR LABEL
              ═══════════════════════════════════════ */}
          <text
            x={SVG_W / 2}
            y={SVG_H - 16}
            textAnchor="middle"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "14px",
              fill: "#5A4E3C",
              letterSpacing: "5px",
              fontWeight: "700",
            }}
          >
            {floorData.floor === 1
              ? "UPPER GROUND LEVEL — 479 SQM"
              : `TYPICAL PLAN — FLOOR ${floorData.floor} — 552 SQM`}
          </text>
        </svg>

        {/* ── Stats bar ── */}
        <div className="mt-4 pt-4 border-t border-[#ece9e3] flex justify-center">
          {[
            { label: "Total Units", value: units.length },
            {
              label: "Available",
              value: units.filter((u) => u.status === "available").length,
            },
            {
              label: "Reserved",
              value: units.filter((u) => u.status === "reserved").length,
            },
            {
              label: "Sold",
              value: units.filter((u) => u.status === "sold").length,
            },
          ].map(({ label, value }, i, arr) => (
            <div
              key={label}
              className={`text-center px-6 ${i !== arr.length - 1 ? "border-r border-[#ece9e3]" : ""}`}
            >
              <p className="font-['Cormorant_Garamond',_serif] text-2xl font-semibold text-slate-900 leading-none">
                {value}
              </p>
              <p className="font-['Cormorant_Garamond',_serif] text-[10px] tracking-[0.18em] text-slate-400 uppercase mt-1">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
