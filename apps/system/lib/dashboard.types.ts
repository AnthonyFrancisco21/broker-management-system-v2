// ─────────────────────────────────────────────────────────────────────────────
// lib/dashboard.types.ts
//
// Two completely separate domains on the dashboard:
//   1. Clients  — 100% owned by the manager
//   2. Agents   — profile records managed by the manager, no client connection
//
// brokerId on the Client model is a schema leftover — fully ignored here.
// Units and revenue are a Statistics page concern — not typed here.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Client enums ─────────────────────────────────────────────────────────────

export type ClientStatus =
  | "prospect"
  | "viewing"
  | "underNego"
  | "reserved"
  | "success"
  | "rejected";

// ─── Raw API shapes (handles camelCase / snake_case from Prisma serialiser) ───

export interface ApiClient {
  clientID?: number;
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  clientStatus?: ClientStatus;
  client_status?: ClientStatus;
  // brokerId / brokerID intentionally omitted — legacy field, ignored
  created_at?: string;
  createdAt?: string;
}

export interface ApiBroker {
  userID?: number;
  id?: number;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  email?: string;
  position?: string;
  primaryContact?: string;
  brokersLicense?: string;
  isDeleted?: number;
}

// ─── Normalised shapes used by all UI components ──────────────────────────────

export interface Client {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  clientStatus: ClientStatus;
  createdAt: Date;
}

export interface Agent {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  primaryContact: string;
  /** true = has a license number on record */
  hasLicense: boolean;
}

// ─── Per-domain data + state shapes ──────────────────────────────────────────

export interface ClientSummaryData {
  clients: Client[];
}

export interface AgentSummaryData {
  agents: Agent[];
}

export interface ClientSummaryState {
  data: ClientSummaryData;
  isLoading: boolean;
  isRefreshing: boolean;
  lastUpdated: Date | null;
  refresh: () => void;
}

export interface AgentSummaryState {
  data: AgentSummaryData;
  isLoading: boolean;
  refresh: () => void;
}

// ─── Attention items ──────────────────────────────────────────────────────────

export type AlertSeverity = "urgent" | "warning" | "info";

export interface AttentionItem {
  id: string;
  severity: AlertSeverity;
  message: string;
  href: string;
}
