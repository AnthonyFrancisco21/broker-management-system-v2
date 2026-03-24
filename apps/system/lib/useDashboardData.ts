// ─────────────────────────────────────────────────────────────────────────────
// useDashboardData.ts
// Single hook responsible for fetching, normalising, and refreshing all
// dashboard data. Keeps the page component free of data-layer concerns.
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  DashboardState,
  DashboardData,
  Client,
  Broker,
  Unit,
  ApiBroker,
  ApiClient,
  ApiUnit,
} from "./dashboard.types";

// ─── Normalisation helpers ────────────────────────────────────────────────────
// The API may use either camelCase or the raw Prisma-mapped snake_case column
// names, depending on the serialiser. We handle both defensively.

function normaliseBroker(raw: ApiBroker): Broker {
  return {
    id: raw.id ?? raw.userID ?? 0,
    firstName: raw.firstName ?? "",
    lastName: raw.lastName ?? "",
    email: raw.email ?? "",
  };
}

function normaliseUnit(raw: ApiUnit): Unit {
  const price = raw.price ?? null;
  const installment =
    raw.installmentPerMonth ?? raw.installment_per_month ?? null;

  return {
    id: raw.id ?? raw.unit_id ?? 0,
    roomNo: raw.roomNo ?? raw.room_no ?? "—",
    unitType: raw.unitType ?? raw.unit_type ?? "Unit",
    floor: raw.floor ?? null,
    size: raw.size ?? null,
    price: price !== null ? Number(price) : null,
    installmentPerMonth: installment !== null ? Number(installment) : null,
    unitStatus: raw.unitStatus ?? raw.unit_status ?? "available",
  };
}

function brokerLabel(broker?: ApiClient["broker"]): string | null {
  if (!broker) return null;
  const parts = [broker.firstName, broker.lastName].filter(Boolean);
  return parts.length ? parts.join(" ") : null;
}

function unitLabel(unit?: ApiClient["unit"]): string | null {
  if (!unit) return null;
  const type = unit.unitType ?? unit.unit_type ?? "Unit";
  const room = unit.roomNo ?? unit.room_no ?? `#${unit.id ?? unit.unit_id}`;
  return `${type} · ${room}`;
}

function unitPrice(unit?: ApiClient["unit"]): number | null {
  if (!unit) return null;
  return unit.price !== undefined && unit.price !== null
    ? Number(unit.price)
    : null;
}

function normaliseClient(raw: ApiClient): Client {
  return {
    id: raw.id ?? raw.clientID ?? 0,
    firstName: raw.firstName ?? "",
    lastName: raw.lastName ?? "",
    email: raw.email ?? "",
    clientStatus: raw.clientStatus ?? raw.client_status ?? "prospect",
    createdAt: new Date(raw.createdAt ?? raw.created_at ?? Date.now()),
    brokerId: raw.brokerId ?? raw.brokerID ?? null,
    brokerName: brokerLabel(raw.broker),
    unitId: raw.unitId ?? raw.unit_id ?? null,
    unitLabel: unitLabel(raw.unit),
    unitPrice: unitPrice(raw.unit),
  };
}

// ─── Fetch helpers ────────────────────────────────────────────────────────────

function getAuthHeaders(): Record<string, string> | null {
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
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  return res.json() as Promise<T>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

const EMPTY: DashboardData = { clients: [], brokers: [], units: [] };

export function useDashboardData(): DashboardState {
  const [data, setData] = useState<DashboardData>(EMPTY);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async (silent: boolean) => {
    const headers = getAuthHeaders();
    if (!headers) {
      setIsLoading(false);
      return;
    }

    silent ? setIsRefreshing(true) : setIsLoading(true);

    try {
      const base = process.env.NEXT_PUBLIC_API_URL ?? "";

      const [rawBrokers, rawClients, rawUnits] = await Promise.all([
        fetchJson<ApiBroker[]>(`${base}/brokers`, headers).catch(() => []),
        fetchJson<ApiClient[]>(`${base}/clients`, headers).catch(() => []),
        fetchJson<ApiUnit[]>(`${base}/units`, headers).catch(() => []),
      ]);

      setData({
        brokers: (Array.isArray(rawBrokers) ? rawBrokers : [])
          .filter((b) => !b.isDeleted)
          .map(normaliseBroker),
        clients: (Array.isArray(rawClients) ? rawClients : []).map(
          normaliseClient,
        ),
        units: (Array.isArray(rawUnits) ? rawUnits : []).map(normaliseUnit),
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error("[useDashboardData]", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);

  return { data, isLoading, isRefreshing, lastUpdated, refresh };
}

// ─── Derived selectors (pure functions — easy to unit-test) ──────────────────

import {
  ACTIVE_DEAL_STATUSES,
  WARM_PIPELINE_STATUSES,
  STALE_PROSPECT_DAYS,
  STALE_VIEWING_DAYS,
} from "./dashboard.config";
import type { AttentionItem } from "./dashboard.types";

function daysSince(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / 86_400_000);
}

export function deriveAttentionItems(
  clients: Client[],
  units: Unit[],
): AttentionItem[] {
  const items: AttentionItem[] = [];

  // Active deals without a linked unit
  const unlinked = clients.filter(
    (c) => ACTIVE_DEAL_STATUSES.includes(c.clientStatus) && !c.unitId,
  ).length;
  if (unlinked > 0) {
    items.push({
      id: "unlinked-units",
      severity: "urgent",
      message: `${unlinked} active deal${unlinked > 1 ? "s" : ""} have no unit linked yet`,
      count: unlinked,
      href: "/dashboard/manager/clients",
    });
  }

  // Stale prospects
  const staleProspects = clients.filter(
    (c) =>
      c.clientStatus === "prospect" &&
      daysSince(c.createdAt) > STALE_PROSPECT_DAYS,
  ).length;
  if (staleProspects > 0) {
    items.push({
      id: "stale-prospects",
      severity: "warning",
      message: `${staleProspects} prospect${staleProspects > 1 ? "s" : ""} untouched for over ${STALE_PROSPECT_DAYS} days`,
      count: staleProspects,
      href: "/dashboard/manager/clients",
    });
  }

  // Stale viewings
  const staleViewing = clients.filter(
    (c) =>
      c.clientStatus === "viewing" &&
      daysSince(c.createdAt) > STALE_VIEWING_DAYS,
  ).length;
  if (staleViewing > 0) {
    items.push({
      id: "stale-viewing",
      severity: "warning",
      message: `${staleViewing} viewing${staleViewing > 1 ? "s" : ""} with no status update in ${STALE_VIEWING_DAYS}+ days`,
      count: staleViewing,
      href: "/dashboard/manager/clients",
    });
  }

  // Available units (opportunity, not a problem)
  const available = units.filter((u) => u.unitStatus === "available").length;
  if (available > 0) {
    items.push({
      id: "available-units",
      severity: "info",
      message: `${available} unit${available > 1 ? "s" : ""} available — ready to assign to prospects`,
      count: available,
      href: "/dashboard/manager/units",
    });
  }

  return items;
}

export function deriveKpis(clients: Client[], units: Unit[]) {
  const now = new Date();

  const totalClients = clients.length;

  const warmPipeline = clients.filter((c) =>
    WARM_PIPELINE_STATUSES.includes(c.clientStatus),
  ).length;

  const availableUnits = units.filter(
    (u) => u.unitStatus === "available",
  ).length;

  const closedThisMonth = clients.filter((c) => {
    if (c.clientStatus !== "success") return false;
    const d = c.createdAt;
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  }).length;

  const totalClosed = clients.filter(
    (c) => c.clientStatus === "success",
  ).length;

  const conversionRate =
    totalClients > 0 ? Math.round((totalClosed / totalClients) * 100) : 0;

  return {
    totalClients,
    warmPipeline,
    availableUnits,
    closedThisMonth,
    conversionRate,
  };
}
