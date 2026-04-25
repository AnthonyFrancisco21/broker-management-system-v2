// ─────────────────────────────────────────────────────────────────────────────
// lib/dashboard.config.ts
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
import type { ClientStatus } from "./dashboard.types";

export interface StatusDisplayConfig {
  label: string;
  textClass: string;
  bgClass: string;
  icon: LucideIcon;
  order: number;
  chartColor: string;
}

export const ACTIVE_DEAL_STATUSES = [
  "active",
  "pending",
  "in_progress",
  "negotiating",
];

export const CLIENT_STATUS_CONFIG: Record<ClientStatus, StatusDisplayConfig> = {
  prospect: {
    label: "Prospect",
    textClass: "text-slate-600",
    bgClass: "bg-slate-100",
    icon: Clock,
    order: 0,
    chartColor: "#94a3b8",
  },
  viewing: {
    label: "Viewing",
    textClass: "text-sky-700",
    bgClass: "bg-sky-50",
    icon: Eye,
    order: 1,
    chartColor: "#0ea5e9",
  },
  underNego: {
    label: "Negotiating",
    textClass: "text-amber-700",
    bgClass: "bg-amber-50",
    icon: Handshake,
    order: 2,
    chartColor: "#f59e0b",
  },
  reserved: {
    label: "Reserved",
    textClass: "text-violet-700",
    bgClass: "bg-violet-50",
    icon: Star,
    order: 3,
    chartColor: "#8b5cf6",
  },
  success: {
    label: "Closed",
    textClass: "text-emerald-700",
    bgClass: "bg-emerald-50",
    icon: CheckCircle2,
    order: 4,
    chartColor: "#10b981",
  },
  rejected: {
    label: "Rejected",
    textClass: "text-rose-700",
    bgClass: "bg-rose-50",
    icon: XCircle,
    order: 5,
    chartColor: "#f43f5e",
  },
};

/** Shown in the pipeline bar chart */
export const PIPELINE_STATUSES: ClientStatus[] = [
  "prospect",
  "viewing",
  "underNego",
  "reserved",
  "success",
];

/** Counted as warm pipeline KPI */
export const WARM_PIPELINE_STATUSES: ClientStatus[] = [
  "viewing",
  "underNego",
  "reserved",
];

/** Days before a prospect is flagged stale */
export const STALE_PROSPECT_DAYS = 30;

/** Days before a viewing is flagged stale */
export const STALE_VIEWING_DAYS = 14;
