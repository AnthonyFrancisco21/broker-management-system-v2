// ─────────────────────────────────────────────────────────────────────────────
// dashboard.config.ts
// Static configuration: status display maps, colours, chart colours.
// Keep all "magic" values here so components stay declarative.
// ─────────────────────────────────────────────────────────────────────────────

import {
  Clock,
  Eye,
  Handshake,
  Star,
  CheckCircle2,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import type { ClientStatus, UnitStatus } from "./dashboard.types";

// ─── Client status display map ────────────────────────────────────────────────

export interface StatusDisplayConfig {
  label: string;
  /** Tailwind text colour class */
  textClass: string;
  /** Tailwind background colour class */
  bgClass: string;
  /** Tailwind border colour class (optional, for outlined badges) */
  borderClass: string;
  icon: LucideIcon;
  /** Used for ordering in charts / tables */
  order: number;
  /** Hex used in Recharts (must be a real colour value) */
  chartColor: string;
}

export const CLIENT_STATUS_CONFIG: Record<ClientStatus, StatusDisplayConfig> = {
  prospect: {
    label: "Prospect",
    textClass: "text-slate-600",
    bgClass: "bg-slate-100",
    borderClass: "border-slate-200",
    icon: Clock,
    order: 0,
    chartColor: "#94a3b8",
  },
  viewing: {
    label: "Viewing",
    textClass: "text-sky-700",
    bgClass: "bg-sky-50",
    borderClass: "border-sky-200",
    icon: Eye,
    order: 1,
    chartColor: "#0ea5e9",
  },
  underNego: {
    label: "Negotiating",
    textClass: "text-amber-700",
    bgClass: "bg-amber-50",
    borderClass: "border-amber-200",
    icon: Handshake,
    order: 2,
    chartColor: "#f59e0b",
  },
  reserved: {
    label: "Reserved",
    textClass: "text-violet-700",
    bgClass: "bg-violet-50",
    borderClass: "border-violet-200",
    icon: Star,
    order: 3,
    chartColor: "#8b5cf6",
  },
  success: {
    label: "Closed",
    textClass: "text-emerald-700",
    bgClass: "bg-emerald-50",
    borderClass: "border-emerald-200",
    icon: CheckCircle2,
    order: 4,
    chartColor: "#10b981",
  },
  rejected: {
    label: "Rejected",
    textClass: "text-rose-700",
    bgClass: "bg-rose-50",
    borderClass: "border-rose-200",
    icon: XCircle,
    order: 5,
    chartColor: "#f43f5e",
  },
};

/** Statuses shown in the pipeline bar chart (rejected is tracked separately) */
export const PIPELINE_STATUSES: ClientStatus[] = [
  "prospect",
  "viewing",
  "underNego",
  "reserved",
  "success",
];

/** Statuses counted as an "active deal" requiring attention */
export const ACTIVE_DEAL_STATUSES: ClientStatus[] = ["underNego", "reserved"];

/** Statuses considered part of the warm pipeline (shown in KPI) */
export const WARM_PIPELINE_STATUSES: ClientStatus[] = [
  "viewing",
  "underNego",
  "reserved",
];

// ─── Unit status display map ───────────────────────────────────────────────────

export interface UnitStatusConfig {
  label: string;
  chartColor: string;
  textClass: string;
  bgClass: string;
}

export const UNIT_STATUS_CONFIG: Record<UnitStatus, UnitStatusConfig> = {
  available: {
    label: "Available",
    chartColor: "#10b981",
    textClass: "text-emerald-700",
    bgClass: "bg-emerald-50",
  },
  viewing: {
    label: "Viewing",
    chartColor: "#0ea5e9",
    textClass: "text-sky-700",
    bgClass: "bg-sky-50",
  },
  reserved: {
    label: "Reserved",
    chartColor: "#8b5cf6",
    textClass: "text-violet-700",
    bgClass: "bg-violet-50",
  },
  underNego: {
    label: "Negotiating",
    chartColor: "#f59e0b",
    textClass: "text-amber-700",
    bgClass: "bg-amber-50",
  },
  occupied: {
    label: "Occupied",
    chartColor: "#64748b",
    textClass: "text-slate-600",
    bgClass: "bg-slate-100",
  },
};

// ─── Thresholds ───────────────────────────────────────────────────────────────

/** Days a client can stay in "prospect" before flagged as stale */
export const STALE_PROSPECT_DAYS = 30;

/** Days a client can stay in "viewing" before flagged as stale */
export const STALE_VIEWING_DAYS = 14;
