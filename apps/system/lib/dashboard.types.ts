// ─────────────────────────────────────────────────────────────────────────────
// dashboard.types.ts
// Centralised type definitions derived from the Prisma schema.
// ─────────────────────────────────────────────────────────────────────────────

export type ClientStatus =
  | "prospect"
  | "viewing"
  | "underNego"
  | "reserved"
  | "success"
  | "rejected";

export type UnitStatus =
  | "available"
  | "viewing"
  | "reserved"
  | "underNego"
  | "occupied";

// ─── Shapes returned by the API (snake_case fields are normalised in the hook) ─

export interface ApiClient {
  clientID?: number;
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  client_status?: ClientStatus;
  clientStatus?: ClientStatus;
  brokerID?: number;
  brokerId?: number;
  broker?: ApibrokerRef;
  handlingManagerID?: number;
  managerId?: number;
  unit_id?: number;
  unitId?: number;
  unit?: ApiUnitRef;
  created_at?: string;
  createdAt?: string;
}

export interface ApibrokerRef {
  id?: number;
  userID?: number;
  firstName?: string;
  lastName?: string;
}

export interface ApiUnitRef {
  unit_id?: number;
  id?: number;
  roomNo?: string;
  room_no?: string;
  unitType?: string;
  unit_type?: string;
  floor?: number;
  price?: string | number;
}

export interface ApiBroker {
  userID?: number;
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  primaryContact?: string;
  isDeleted?: number;
}

export interface ApiUnit {
  unit_id?: number;
  id?: number;
  roomNo?: string;
  room_no?: string;
  unitType?: string;
  unit_type?: string;
  floor?: number;
  size?: string;
  price?: string | number;
  installment_per_month?: string | number;
  installmentPerMonth?: string | number;
  unit_status?: UnitStatus;
  unitStatus?: UnitStatus;
}

// ─── Normalised shapes used by all UI components ──────────────────────────────

export interface Client {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  clientStatus: ClientStatus;
  createdAt: Date;
  brokerId: number | null;
  brokerName: string | null; // pre-computed full name
  unitId: number | null;
  unitLabel: string | null; // e.g. "Studio · Room 12B"
  unitPrice: number | null;
}

export interface Broker {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Unit {
  id: number;
  roomNo: string;
  unitType: string;
  floor: number | null;
  size: string | null;
  price: number | null;
  installmentPerMonth: number | null;
  unitStatus: UnitStatus;
}

// ─── Dashboard aggregate ───────────────────────────────────────────────────────

export interface DashboardData {
  clients: Client[];
  brokers: Broker[];
  units: Unit[];
}

export interface DashboardState {
  data: DashboardData;
  isLoading: boolean;
  isRefreshing: boolean;
  lastUpdated: Date | null;
  refresh: () => void;
}

// ─── Attention / alert items ──────────────────────────────────────────────────

export type AlertSeverity = "urgent" | "warning" | "info";

export interface AttentionItem {
  id: string;
  severity: AlertSeverity;
  message: string;
  count: number;
  href: string;
}
