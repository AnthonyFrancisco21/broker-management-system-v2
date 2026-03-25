// ─────────────────────────────────────────────────────────────────────────────
// lib/useDashboardData.ts
//
// Two completely independent hooks:
//   useClientSummary()  — fetches /clients, clients load first (primary concern)
//   useAgentSummary()   — fetches /brokers, loads independently with own state
//
// Keeping them separate means the page can render client data the moment it
// arrives without waiting for the agent fetch, and vice versa.
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  WARM_PIPELINE_STATUSES,
  STALE_PROSPECT_DAYS,
  STALE_VIEWING_DAYS,
} from "./dashboard.config";
import type {
  ApiClient,
  ApiBroker,
  Client,
  Agent,
  ClientSummaryState,
  AgentSummaryState,
  AttentionItem,
  ClientStatus,
} from "./dashboard.types";

// ─── Auth helper ──────────────────────────────────────────────────────────────

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
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

// ─── Normalisation ────────────────────────────────────────────────────────────

function normaliseClient(raw: ApiClient): Client {
  return {
    id: raw.id ?? raw.clientID ?? 0,
    firstName: raw.firstName ?? "",
    lastName: raw.lastName ?? "",
    email: raw.email ?? "",
    // Handle both camelCase and snake_case from Prisma
    clientStatus: (raw.clientStatus ??
      raw.client_status ??
      "prospect") as ClientStatus,
    createdAt: new Date(raw.createdAt ?? raw.created_at ?? Date.now()),
  };
}

function normaliseAgent(raw: ApiBroker): Agent {
  return {
    id: raw.id ?? raw.userID ?? 0,
    firstName: raw.firstName ?? "",
    lastName: raw.lastName ?? "",
    email: raw.email ?? "",
    position: raw.position ?? "",
    primaryContact: raw.primaryContact ?? "",
    hasLicense:
      typeof raw.brokersLicense === "string" &&
      raw.brokersLicense.trim().length > 0,
  };
}

// ─── useClientSummary ─────────────────────────────────────────────────────────

const EMPTY_CLIENTS: { clients: Client[] } = { clients: [] };

export function useClientSummary(): ClientSummaryState {
  const [data, setData] = useState<{ clients: Client[] }>(EMPTY_CLIENTS);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async (silent: boolean) => {
    const headers = getHeaders();
    if (!headers) {
      setIsLoading(false);
      return;
    }

    silent ? setIsRefreshing(true) : setIsLoading(true);

    try {
      const base = process.env.NEXT_PUBLIC_API_URL ?? "";
      const raw = await fetchJson<ApiClient[]>(
        `${base}/clients`,
        headers,
      ).catch(() => []);
      setData({
        clients: (Array.isArray(raw) ? raw : []).map(normaliseClient),
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error("[useClientSummary]", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  return {
    data,
    isLoading,
    isRefreshing,
    lastUpdated,
    refresh: useCallback(() => load(true), [load]),
  };
}

// ─── useAgentSummary ──────────────────────────────────────────────────────────

const EMPTY_AGENTS: { agents: Agent[] } = { agents: [] };

export function useAgentSummary(): AgentSummaryState {
  const [data, setData] = useState<{ agents: Agent[] }>(EMPTY_AGENTS);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    const headers = getHeaders();
    if (!headers) {
      setIsLoading(false);
      return;
    }

    try {
      const base = process.env.NEXT_PUBLIC_API_URL ?? "";
      const raw = await fetchJson<ApiBroker[]>(
        `${base}/brokers`,
        headers,
      ).catch(() => []);
      setData({
        agents: (Array.isArray(raw) ? raw : [])
          .filter((b) => !b.isDeleted)
          .map(normaliseAgent),
      });
    } catch (err) {
      console.error("[useAgentSummary]", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    data,
    isLoading,
    refresh: load,
  };
}

// ─── Pure selectors ───────────────────────────────────────────────────────────

function daysSince(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / 86_400_000);
}

export function deriveClientKpis(clients: Client[]) {
  const now = new Date();
  const total = clients.length;
  const totalClosed = clients.filter(
    (c) => c.clientStatus === "success",
  ).length;

  return {
    totalClients: total,
    warmPipeline: clients.filter((c) =>
      WARM_PIPELINE_STATUSES.includes(c.clientStatus),
    ).length,
    closedThisMonth: clients.filter((c) => {
      if (c.clientStatus !== "success") return false;
      return (
        c.createdAt.getMonth() === now.getMonth() &&
        c.createdAt.getFullYear() === now.getFullYear()
      );
    }).length,
    totalRejected: clients.filter((c) => c.clientStatus === "rejected").length,
    conversionRate: total > 0 ? Math.round((totalClosed / total) * 100) : 0,
  };
}

export function deriveAgentKpis(agents: Agent[]) {
  return {
    totalAgents: agents.length,
    licensedAgents: agents.filter((a) => a.hasLicense).length,
  };
}

export function deriveAttentionItems(clients: Client[]): AttentionItem[] {
  const items: AttentionItem[] = [];

  const staleProspects = clients.filter(
    (c) =>
      c.clientStatus === "prospect" &&
      daysSince(c.createdAt) > STALE_PROSPECT_DAYS,
  ).length;
  if (staleProspects > 0) {
    items.push({
      id: "stale-prospects",
      severity: "warning",
      message: `${staleProspects} prospect${staleProspects > 1 ? "s" : ""} with no update in ${STALE_PROSPECT_DAYS}+ days`,
      href: "/dashboard/manager/clients",
    });
  }

  const staleViewing = clients.filter(
    (c) =>
      c.clientStatus === "viewing" &&
      daysSince(c.createdAt) > STALE_VIEWING_DAYS,
  ).length;
  if (staleViewing > 0) {
    items.push({
      id: "stale-viewing",
      severity: "warning",
      message: `${staleViewing} viewing${staleViewing > 1 ? "s" : ""} stuck for ${STALE_VIEWING_DAYS}+ days`,
      href: "/dashboard/manager/clients",
    });
  }

  return items;
}
