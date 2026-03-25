// ─────────────────────────────────────────────────────────────────────────────
// lib/useStatisticsData.ts
//
// Single hook for the Statistics page. Fetches three endpoints in parallel:
//   /clients  — for client analytics (rates, trends, funnel)
//   /units    — for inventory and revenue breakdown
//   /brokers  — for agent overview (ALL agents, both managers see the same)
//
// All computation is done here — the page and components just render.
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Raw API shapes ───────────────────────────────────────────────────────────

interface ApiClient {
  id?: number;
  clientID?: number;
  clientStatus?: string;
  client_status?: string;
  createdAt?: string;
  created_at?: string;
}

interface ApiUnit {
  id?: number;
  unit_id?: number;
  unitType?: string;
  unit_type?: string;
  unitStatus?: string;
  unit_status?: string;
  price?: string | number | null;
  installmentPerMonth?: string | number | null;
  installment_per_month?: string | number | null;
  floor?: number;
}

interface ApiBroker {
  id?: number;
  userID?: number;
  firstName?: string;
  lastName?: string;
  position?: string;
  primaryContact?: string;
  brokersLicense?: string;
  email?: string;
  isDeleted?: number;
}

// ─── Computed output shapes ───────────────────────────────────────────────────

export interface StatSummary {
  closeRate: number; // success / total clients * 100
  pipelineValue: number; // sum of prices for reserved + underNego units
  occupancyRate: number; // occupied / total units * 100
  totalAgents: number;
  licensedAgents: number;
  totalUnits: number;
  totalRejected: number; // clients with status === "rejected"
}

export interface MonthlyPoint {
  month: string;
  newClients: number;
  closed: number;
}

export interface FunnelStage {
  key: string;
  label: string;
  count: number;
  pct: number; // % of total non-rejected clients
  dropOffPct: number; // % conversion from previous stage (0 for first)
  color: string;
}

export interface UnitStatusSlice {
  status: string;
  label: string;
  count: number;
  color: string;
}

export interface RevenueRow {
  label: string;
  status: string;
  value: number;
  color: string;
}

export interface AgentStatRow {
  id: number;
  name: string;
  position: string;
  contact: string;
  email: string;
  hasLicense: boolean;
}

export interface StatisticsData {
  summary: StatSummary;
  monthlyTrend: MonthlyPoint[];
  funnelStages: FunnelStage[];
  unitSlices: UnitStatusSlice[];
  revenueRows: RevenueRow[];
  agents: AgentStatRow[];
}

export interface StatisticsState {
  data: StatisticsData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const TREND_MONTHS = 6;

const FUNNEL_ORDER = [
  { key: "prospect", label: "Prospect", color: "#94a3b8" },
  { key: "viewing", label: "Viewing", color: "#0ea5e9" },
  { key: "undernego", label: "Negotiating", color: "#f59e0b" },
  { key: "reserved", label: "Reserved", color: "#8b5cf6" },
  { key: "success", label: "Closed", color: "#10b981" },
];

const UNIT_STATUS_DISPLAY: Record<string, { label: string; color: string }> = {
  available: { label: "Available", color: "#10b981" },
  viewing: { label: "Viewing", color: "#0ea5e9" },
  reserved: { label: "Reserved", color: "#8b5cf6" },
  undernego: { label: "Negotiating", color: "#f59e0b" },
  occupied: { label: "Occupied", color: "#64748b" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clientStatus(c: ApiClient): string {
  return (c.clientStatus ?? c.client_status ?? "prospect").toLowerCase();
}

function unitStatus(u: ApiUnit): string {
  return (u.unitStatus ?? u.unit_status ?? "available").toLowerCase();
}

function unitPrice(u: ApiUnit): number {
  return Number(u.price ?? 0);
}

function clientDate(c: ApiClient): Date {
  return new Date(c.createdAt ?? c.created_at ?? Date.now());
}

function getHeaders(): Record<string, string> | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function fetchJson<T>(
  url: string,
  headers: Record<string, string>,
): Promise<T> {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} — ${url}`);
  return res.json() as Promise<T>;
}

// ─── Pure computation functions ───────────────────────────────────────────────

function computeSummary(
  clients: ApiClient[],
  units: ApiUnit[],
  agents: ApiBroker[],
): StatSummary {
  const total = clients.length || 1;
  const closed = clients.filter((c) => clientStatus(c) === "success").length;
  const occupied = units.filter((u) => unitStatus(u) === "occupied").length;

  const pipelineValue = units
    .filter((u) => ["reserved", "undernego"].includes(unitStatus(u)))
    .reduce((sum, u) => sum + unitPrice(u), 0);

  return {
    closeRate: Math.round((closed / total) * 100),
    pipelineValue,
    occupancyRate:
      units.length > 0 ? Math.round((occupied / units.length) * 100) : 0,
    totalAgents: agents.length,
    licensedAgents: agents.filter(
      (a) =>
        typeof a.brokersLicense === "string" &&
        a.brokersLicense.trim().length > 0,
    ).length,
    totalUnits: units.length,
    totalRejected: clients.filter((c) => clientStatus(c) === "rejected").length,
  };
}

function computeMonthlyTrend(clients: ApiClient[]): MonthlyPoint[] {
  const today = new Date();
  const points: MonthlyPoint[] = [];
  const keyMap = new Map<string, number>();

  for (let i = TREND_MONTHS - 1; i >= 0; i--) {
    const ref = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = `${MONTH_LABELS[ref.getMonth()]}|${ref.getFullYear()}`;
    const idx = TREND_MONTHS - 1 - i;
    points.push({
      month: MONTH_LABELS[ref.getMonth()],
      newClients: 0,
      closed: 0,
    });
    keyMap.set(key, idx);
  }

  clients.forEach((c) => {
    const d = clientDate(c);
    const key = `${MONTH_LABELS[d.getMonth()]}|${d.getFullYear()}`;
    const idx = keyMap.get(key);
    if (idx === undefined) return;
    points[idx].newClients++;
    if (clientStatus(c) === "success") points[idx].closed++;
  });

  return points;
}

function computeFunnel(clients: ApiClient[]): FunnelStage[] {
  const active = clients.filter((c) => clientStatus(c) !== "rejected");
  const total = active.length || 1;

  return FUNNEL_ORDER.map((cfg, i) => {
    const count = active.filter((c) => clientStatus(c) === cfg.key).length;
    const prev =
      i > 0
        ? active.filter((c) => clientStatus(c) === FUNNEL_ORDER[i - 1].key)
            .length
        : 0;

    return {
      key: cfg.key,
      label: cfg.label,
      count,
      pct: Math.round((count / total) * 100),
      dropOffPct: i > 0 && prev > 0 ? Math.round((count / prev) * 100) : 0,
      color: cfg.color,
    };
  });
}

function computeUnitSlices(units: ApiUnit[]): UnitStatusSlice[] {
  const counts: Record<string, number> = {};
  units.forEach((u) => {
    const s = unitStatus(u);
    counts[s] = (counts[s] ?? 0) + 1;
  });

  return Object.entries(counts).map(([status, count]) => ({
    status,
    label: UNIT_STATUS_DISPLAY[status]?.label ?? status,
    count,
    color: UNIT_STATUS_DISPLAY[status]?.color ?? "#cbd5e1",
  }));
}

function computeRevenueRows(units: ApiUnit[]): RevenueRow[] {
  const groups: { key: string; label: string; color: string }[] = [
    { key: "reserved", label: "Reserved", color: "#8b5cf6" },
    { key: "undernego", label: "Negotiating", color: "#f59e0b" },
    { key: "occupied", label: "Occupied / Sold", color: "#10b981" },
  ];

  return groups.map(({ key, label, color }) => ({
    label,
    status: key,
    value: units
      .filter((u) => unitStatus(u) === key)
      .reduce((sum, u) => sum + unitPrice(u), 0),
    color,
  }));
}

function computeAgents(brokers: ApiBroker[]): AgentStatRow[] {
  return brokers
    .filter((b) => !b.isDeleted)
    .map((b) => ({
      id: b.id ?? b.userID ?? 0,
      name: [b.firstName, b.lastName].filter(Boolean).join(" ") || "Unnamed",
      position: b.position ?? "—",
      contact: b.primaryContact ?? "—",
      email: b.email ?? "—",
      hasLicense:
        typeof b.brokersLicense === "string" &&
        b.brokersLicense.trim().length > 0,
    }));
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useStatisticsData(): StatisticsState {
  const [data, setData] = useState<StatisticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const headers = getHeaders();
    if (!headers) {
      setError("Not authenticated");
      setIsLoading(false);
      return;
    }

    try {
      const base = process.env.NEXT_PUBLIC_API_URL ?? "";

      // All three fetch in parallel — independent concerns
      const [rawClients, rawUnits, rawBrokers] = await Promise.all([
        fetchJson<ApiClient[]>(`${base}/clients`, headers),
        fetchJson<ApiUnit[]>(`${base}/units`, headers).catch(() => []),
        fetchJson<ApiBroker[]>(`${base}/brokers`, headers).catch(() => []),
      ]);

      const clients = Array.isArray(rawClients) ? rawClients : [];
      const units = Array.isArray(rawUnits) ? rawUnits : [];
      const brokers = Array.isArray(rawBrokers) ? rawBrokers : [];

      setData({
        summary: computeSummary(clients, units, brokers),
        monthlyTrend: computeMonthlyTrend(clients),
        funnelStages: computeFunnel(clients),
        unitSlices: computeUnitSlices(units),
        revenueRows: computeRevenueRows(units),
        agents: computeAgents(brokers),
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load statistics",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, error, refresh: load };
}
