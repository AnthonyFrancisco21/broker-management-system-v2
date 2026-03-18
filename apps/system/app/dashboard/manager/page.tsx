"use client";

import { useEffect, useState, useCallback } from "react";
import RoleGuard from "../../../components/RoleGuard";
import DashboardLayout from "../../../components/DashboardLayout";
import { managerNavItems } from "../../../lib/navigation";
import {
  Users,
  UserCheck,
  Building2,
  TrendingUp,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Eye,
  Handshake,
  Clock,
  Star,
  ChevronRight,
  DollarSign,
  AlertCircle,
  CalendarDays,
  ArrowUpRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Client {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  clientStatus: string;
  createdAt: string;
  broker?: { firstName?: string; lastName?: string };
  unit?: { roomNo?: string; unitType?: string };
}

interface Broker {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  clients?: Client[];
}

interface Unit {
  id: number;
  roomNo?: string;
  unitType?: string;
  floor?: number;
  price?: number;
  installmentPerMonth?: number;
  unitStatus: string;
}

interface DashboardData {
  brokers: Broker[];
  clients: Client[];
  units: Unit[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CLIENT_STATUS_CONFIG: Record<
  string,
  {
    label: string;
    color: string;
    bg: string;
    icon: React.ElementType;
    order: number;
  }
> = {
  prospect: {
    label: "Prospect",
    color: "text-slate-600",
    bg: "bg-slate-100",
    icon: Clock,
    order: 0,
  },
  viewing: {
    label: "Viewing",
    color: "text-blue-600",
    bg: "bg-blue-50",
    icon: Eye,
    order: 1,
  },
  underNego: {
    label: "Negotiating",
    color: "text-amber-600",
    bg: "bg-amber-50",
    icon: Handshake,
    order: 2,
  },
  reserved: {
    label: "Reserved",
    color: "text-violet-600",
    bg: "bg-violet-50",
    icon: Star,
    order: 3,
  },
  success: {
    label: "Closed",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    icon: CheckCircle2,
    order: 4,
  },
  rejected: {
    label: "Rejected",
    color: "text-rose-600",
    bg: "bg-rose-50",
    icon: XCircle,
    order: 5,
  },
};

const UNIT_STATUS_COLORS: Record<string, string> = {
  available: "#10b981",
  viewing: "#3b82f6",
  reserved: "#8b5cf6",
  underNego: "#f59e0b",
  occupied: "#64748b",
};

const PIPELINE_COLORS = ["#94a3b8", "#3b82f6", "#f59e0b", "#8b5cf6", "#10b981"];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  sub?: string;
  accent: string;
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-all duration-200 group">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accent}`}
      >
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
          {label}
        </p>
        <div className="flex items-baseline gap-2">
          {loading ? (
            <Loader2 size={18} className="animate-spin text-slate-300 mt-1" />
          ) : (
            <span className="text-3xl font-bold text-slate-900 tabular-nums leading-none">
              {value}
            </span>
          )}
        </div>
        {sub && !loading && (
          <p className="text-xs text-slate-400 mt-1 truncate">{sub}</p>
        )}
      </div>
    </div>
  );
}

function ClientStatusBadge({ status }: { status: string }) {
  const cfg = CLIENT_STATUS_CONFIG[status] ?? {
    label: status,
    color: "text-slate-500",
    bg: "bg-slate-100",
    icon: Clock,
  };
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color} ${cfg.bg}`}
    >
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

function SectionHeader({
  title,
  sub,
  href,
}: {
  title: string;
  sub?: string;
  href?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      {href && (
        <a
          href={href}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          View all <ChevronRight size={13} />
        </a>
      )}
    </div>
  );
}

// ─── Pipeline Bar Chart ────────────────────────────────────────────────────────

function PipelineChart({ clients }: { clients: Client[] }) {
  const data = Object.entries(CLIENT_STATUS_CONFIG)
    .filter(([k]) => k !== "rejected")
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([key, cfg]) => ({
      name: cfg.label,
      count: clients.filter((c) => c.clientStatus === key).length,
      key,
    }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3">
          <p className="text-xs font-semibold text-slate-700 mb-1">{label}</p>
          <p className="text-lg font-bold text-slate-900">
            {payload[0].value}{" "}
            <span className="text-xs font-normal text-slate-400">clients</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} barCategoryGap="30%">
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#f1f5f9"
          vertical={false}
        />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={entry.key}
              fill={PIPELINE_COLORS[index % PIPELINE_COLORS.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Unit Status Pie ───────────────────────────────────────────────────────────

function UnitStatusPie({ units }: { units: Unit[] }) {
  const statusCount = units.reduce(
    (acc, u) => {
      acc[u.unitStatus] = (acc[u.unitStatus] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const data = Object.entries(statusCount).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
    color: UNIT_STATUS_COLORS[key] ?? "#cbd5e1",
  }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-300 text-sm">
        No unit data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={190}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={52}
          outerRadius={75}
          paddingAngle={3}
          dataKey="value"
          strokeWidth={0}
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [value, name]}
          contentStyle={{
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            fontSize: 12,
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ fontSize: 11, color: "#64748b" }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ─── Recent Clients Table ──────────────────────────────────────────────────────

function RecentClients({ clients }: { clients: Client[] }) {
  const recent = [...clients]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 6);

  return (
    <div className="overflow-hidden">
      {recent.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-slate-300">
          <UserCheck size={32} className="mb-2" />
          <p className="text-sm">No clients yet</p>
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left text-xs text-slate-400 font-medium pb-3 pr-4">
                Client
              </th>
              <th className="text-left text-xs text-slate-400 font-medium pb-3 pr-4">
                Status
              </th>
              <th className="text-left text-xs text-slate-400 font-medium pb-3 pr-4 hidden sm:table-cell">
                Agent
              </th>
              <th className="text-left text-xs text-slate-400 font-medium pb-3 hidden md:table-cell">
                Added
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {recent.map((client) => {
              const fullName =
                [client.firstName, client.lastName].filter(Boolean).join(" ") ||
                "Unnamed Client";
              const initials =
                [client.firstName?.[0], client.lastName?.[0]]
                  .filter(Boolean)
                  .join("")
                  .toUpperCase() || "?";
              const agentName = client.broker
                ? [client.broker.firstName, client.broker.lastName]
                    .filter(Boolean)
                    .join(" ") || "—"
                : "Direct";
              const dateStr = new Date(client.createdAt).toLocaleDateString(
                "en-PH",
                { month: "short", day: "numeric" },
              );

              return (
                <tr
                  key={client.id}
                  className="group hover:bg-slate-50/60 transition-colors"
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-xs font-semibold text-slate-600 shrink-0">
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800 leading-tight">
                          {fullName}
                        </p>
                        <p className="text-xs text-slate-400 truncate max-w-[120px]">
                          {client.email || "—"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <ClientStatusBadge status={client.clientStatus} />
                  </td>
                  <td className="py-3 pr-4 hidden sm:table-cell">
                    <span className="text-xs text-slate-500">{agentName}</span>
                  </td>
                  <td className="py-3 hidden md:table-cell">
                    <span className="text-xs text-slate-400">{dateStr}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── Broker Leaderboard ────────────────────────────────────────────────────────

function BrokerLeaderboard({
  brokers,
  clients,
}: {
  brokers: Broker[];
  clients: Client[];
}) {
  const rankedBrokers = brokers
    .map((b) => {
      const brokerClients = clients.filter(
        (c) => c.brokerId === b.id || (c.broker && c.broker === b),
      );
      // Count by fetching from the clients array
      const allBrokerClients = clients.filter(
        (c: any) => c.brokerID === b.id || c.brokerId === b.id,
      );
      const successes = allBrokerClients.filter(
        (c) => c.clientStatus === "success",
      ).length;
      const active = allBrokerClients.filter((c) =>
        ["underNego", "reserved", "viewing"].includes(c.clientStatus),
      ).length;
      return {
        ...b,
        total: allBrokerClients.length,
        successes,
        active,
      };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  if (rankedBrokers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-slate-300">
        <Users size={32} className="mb-2" />
        <p className="text-sm">No brokers yet</p>
      </div>
    );
  }

  const maxTotal = Math.max(...rankedBrokers.map((b) => b.total), 1);

  return (
    <div className="space-y-3">
      {rankedBrokers.map((broker, i) => {
        const fullName =
          [broker.firstName, broker.lastName].filter(Boolean).join(" ") ||
          "Unnamed Agent";
        const initials =
          [broker.firstName?.[0], broker.lastName?.[0]]
            .filter(Boolean)
            .join("")
            .toUpperCase() || "?";

        const rankColors = [
          "from-amber-400 to-amber-500",
          "from-slate-300 to-slate-400",
          "from-orange-300 to-orange-400",
        ];

        return (
          <div key={broker.id} className="flex items-center gap-3 group">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 bg-gradient-to-br ${rankColors[i] ?? "from-slate-200 to-slate-300"}`}
            >
              {i + 1}
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-xs font-semibold text-blue-700 shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-700 truncate">
                  {fullName}
                </span>
                <span className="text-xs tabular-nums font-semibold text-slate-900 ml-2 shrink-0">
                  {broker.total}{" "}
                  <span className="font-normal text-slate-400">clients</span>
                </span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-700"
                  style={{ width: `${(broker.total / maxTotal) * 100}%` }}
                />
              </div>
              <div className="flex gap-3 mt-1">
                <span className="text-xs text-emerald-600">
                  {broker.successes} closed
                </span>
                <span className="text-xs text-amber-600">
                  {broker.active} active
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Revenue Pipeline ──────────────────────────────────────────────────────────

function RevenuePipeline({
  clients,
  units,
}: {
  clients: Client[];
  units: Unit[];
}) {
  const activeClients = clients.filter((c) =>
    ["reserved", "underNego"].includes(c.clientStatus),
  );

  const items = activeClients
    .map((c: any) => {
      const unit = units.find((u) => u.id === (c.unitId || c.unit_id));
      return { client: c, unit };
    })
    .filter((item) => item.unit)
    .slice(0, 5);

  const formatPeso = (val?: number) => {
    if (!val) return "—";
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(val);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-slate-300">
        <DollarSign size={28} className="mb-2" />
        <p className="text-sm">No active deals</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map(({ client, unit }) => {
        const clientName =
          [client.firstName, client.lastName].filter(Boolean).join(" ") ||
          "Unnamed";
        return (
          <div
            key={client.id}
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
              <Building2 size={16} className="text-violet-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">
                {unit?.unitType ?? "Unit"} · {unit?.roomNo ?? `#${unit?.id}`}
              </p>
              <p className="text-xs text-slate-400 truncate">{clientName}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-semibold text-slate-800">
                {formatPeso(unit?.price)}
              </p>
              <ClientStatusBadge status={client.clientStatus} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Alert Banner ──────────────────────────────────────────────────────────────

function AlertBanner({ clients, units }: { clients: Client[]; units: Unit[] }) {
  const alerts: { msg: string; type: "warn" | "info" }[] = [];

  const noUnitClients = clients.filter(
    (c) =>
      ["reserved", "underNego"].includes(c.clientStatus) &&
      !(c as any).unitId &&
      !(c as any).unit_id,
  ).length;

  if (noUnitClients > 0) {
    alerts.push({
      msg: `${noUnitClients} active deal${noUnitClients > 1 ? "s" : ""} without a linked unit`,
      type: "warn",
    });
  }

  const availableUnits = units.filter(
    (u) => u.unitStatus === "available",
  ).length;
  if (availableUnits > 0) {
    alerts.push({
      msg: `${availableUnits} unit${availableUnits > 1 ? "s" : ""} available for new prospects`,
      type: "info",
    });
  }

  if (alerts.length === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-5">
      {alerts.map((a, i) => (
        <div
          key={i}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium flex-1 ${
            a.type === "warn"
              ? "bg-amber-50 text-amber-700 border border-amber-100"
              : "bg-blue-50 text-blue-700 border border-blue-100"
          }`}
        >
          <AlertCircle size={14} className="shrink-0" />
          {a.msg}
        </div>
      ))}
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────

export default function ManagerDashboard() {
  const [data, setData] = useState<DashboardData>({
    brokers: [],
    clients: [],
    units: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return;

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [brokersRes, clientsRes, unitsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/brokers`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/units`, { headers }),
      ]);

      const [brokersData, clientsData, unitsData] = await Promise.all([
        brokersRes.ok ? brokersRes.json() : [],
        clientsRes.ok ? clientsRes.json() : [],
        unitsRes.ok ? unitsRes.json() : [],
      ]);

      setData({
        brokers: Array.isArray(brokersData) ? brokersData : [],
        clients: Array.isArray(clientsData) ? clientsData : [],
        units: Array.isArray(unitsData) ? unitsData : [],
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Derived stats ──────────────────────────────────────────────────────────

  const { brokers, clients, units } = data;

  const activePipeline = clients.filter((c) =>
    ["underNego", "reserved", "viewing"].includes(c.clientStatus),
  ).length;

  const closedThisMonth = clients.filter((c) => {
    if (c.clientStatus !== "success") return false;
    const d = new Date(c.createdAt);
    const now = new Date();
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  }).length;

  const availableUnits = units.filter(
    (u) => u.unitStatus === "available",
  ).length;

  const conversionRate =
    clients.length > 0
      ? Math.round(
          (clients.filter((c) => c.clientStatus === "success").length /
            clients.length) *
            100,
        )
      : 0;

  const updatedStr = lastUpdated
    ? lastUpdated.toLocaleTimeString("en-PH", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <RoleGuard allowedRoles={["ADMIN", "MANAGER"]}>
      <DashboardLayout navItems={managerNavItems} roleTitle="Manager Dashboard">
        <div className="flex flex-col min-h-full">
          {/* ── Page Header ────────────────────────────────────────────────── */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">
                Dashboard Overview
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Your full pipeline, team, and inventory at a glance
              </p>
            </div>
            <div className="flex items-center gap-2">
              {updatedStr && (
                <span className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
                  <CalendarDays size={12} />
                  Updated {updatedStr}
                </span>
              )}
              <button
                onClick={() => fetchData(true)}
                disabled={refreshing}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                <RefreshCw
                  size={13}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* ── Alert Banners ───────────────────────────────────────────────── */}
          {!loading && <AlertBanner clients={clients} units={units} />}

          {/* ── KPI Cards ──────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <StatCard
              icon={UserCheck}
              label="Total Clients"
              value={clients.length}
              sub={`${closedThisMonth} closed this month`}
              accent="bg-blue-50 text-blue-600"
              loading={loading}
            />
            <StatCard
              icon={TrendingUp}
              label="Active Pipeline"
              value={activePipeline}
              sub="Viewing, Nego & Reserved"
              accent="bg-amber-50 text-amber-600"
              loading={loading}
            />
            <StatCard
              icon={Building2}
              label="Units Available"
              value={availableUnits}
              sub={`of ${units.length} total units`}
              accent="bg-emerald-50 text-emerald-600"
              loading={loading}
            />
            <StatCard
              icon={Users}
              label="Broker Team"
              value={brokers.length}
              sub={`${conversionRate}% overall close rate`}
              accent="bg-violet-50 text-violet-600"
              loading={loading}
            />
          </div>

          {/* ── Middle Row: Pipeline Chart + Unit Status ────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            {/* Pipeline Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <SectionHeader
                title="Client Pipeline"
                sub="Distribution by current stage"
                href="/dashboard/manager/clients"
              />
              {loading ? (
                <div className="flex items-center justify-center h-[200px]">
                  <Loader2 className="animate-spin text-slate-300" size={24} />
                </div>
              ) : (
                <PipelineChart clients={clients} />
              )}
            </div>

            {/* Unit Status */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <SectionHeader
                title="Unit Inventory"
                sub="Status breakdown"
                href="/dashboard/manager/units"
              />
              {loading ? (
                <div className="flex items-center justify-center h-[190px]">
                  <Loader2 className="animate-spin text-slate-300" size={24} />
                </div>
              ) : (
                <UnitStatusPie units={units} />
              )}
            </div>
          </div>

          {/* ── Bottom Row: Recent Clients + Broker Board + Revenue ─────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Recent Clients */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <SectionHeader
                title="Recent Clients"
                sub="Latest additions to your roster"
                href="/dashboard/manager/clients"
              />
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="animate-spin text-slate-300" size={24} />
                </div>
              ) : (
                <RecentClients clients={clients} />
              )}
            </div>

            {/* Right column: Broker Board + Revenue Pipeline stacked */}
            <div className="flex flex-col gap-4">
              {/* Broker Leaderboard */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex-1">
                <SectionHeader
                  title="Broker Performance"
                  sub="Top agents by client count"
                  href="/dashboard/manager/brokers"
                />
                {loading ? (
                  <div className="flex items-center justify-center h-24">
                    <Loader2
                      className="animate-spin text-slate-300"
                      size={24}
                    />
                  </div>
                ) : (
                  <BrokerLeaderboard brokers={brokers} clients={clients} />
                )}
              </div>

              {/* Revenue Pipeline */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <SectionHeader
                  title="Active Deal Values"
                  sub="Reserved & under negotiation"
                  href="/dashboard/manager/reservations"
                />
                {loading ? (
                  <div className="flex items-center justify-center h-24">
                    <Loader2
                      className="animate-spin text-slate-300"
                      size={24}
                    />
                  </div>
                ) : (
                  <RevenuePipeline clients={clients} units={units} />
                )}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
