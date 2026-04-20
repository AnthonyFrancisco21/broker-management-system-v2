// ─────────────────────────────────────────────────────────────────────────────
// app/dashboard/manager/page.tsx
//
// Manager Dashboard — individual manager's own client portfolio only.
// Agents are a shared concern across managers → handled in Statistics.
// Units and revenue → handled in Statistics.
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { useMemo } from "react";
import RoleGuard from "../../../components/RoleGuard";
import DashboardLayout from "../../../components/DashboardLayout";
import { managerNavItems } from "../../../lib/navigation";

import {
  useClientSummary,
  deriveClientKpis,
  deriveAttentionItems,
} from "../../../lib/useDashboardData";

import { KpiCard } from "../../../components/KpiCard";
import { SectionCard, SectionHeader } from "../../../components/SectionCard";
import { AttentionBanner } from "../../../components/AttentionBanner";
import { PipelineChart } from "../../../components/PipelineChart";
import { RecentClientsTable } from "../../../components/RecentClientsTable";

import {
  UserCheck,
  TrendingUp,
  CheckCircle2,
  XCircle,
  RefreshCw,
  CalendarDays,
  Plus,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────

export default function ManagerDashboard() {
  const {
    data: clientData,
    isLoading,
    isRefreshing,
    lastUpdated,
    refresh,
  } = useClientSummary();

  const { clients } = clientData;

  const clientKpis = useMemo(() => deriveClientKpis(clients), [clients]);
  const attentionItems = useMemo(
    () => deriveAttentionItems(clients),
    [clients],
  );

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
          {/* ── Page header ───────────────────────────────────────────── */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight tracking-tight">
                Dashboard
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Your client portfolio at a glance
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {updatedStr && (
                <span className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 mr-1">
                  <CalendarDays size={12} />
                  {updatedStr}
                </span>
              )}
              <a
                href="/dashboard/manager/clients"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus size={13} />
                New Client
              </a>
              <button
                onClick={refresh}
                disabled={isRefreshing}
                className="p-2 rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-40"
                aria-label="Refresh"
              >
                <RefreshCw
                  size={14}
                  className={isRefreshing ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>

          {/* ── Attention banners ─────────────────────────────────────── */}
          {!isLoading && attentionItems.length > 0 && (
            <AttentionBanner items={attentionItems} />
          )}

          {/* ── KPI cards ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <KpiCard
              icon={UserCheck}
              label="Total Clients"
              value={clientKpis.totalClients}
              sub={`${clientKpis.conversionRate}% overall close rate`}
              accentClasses="bg-blue-50 text-blue-600"
              isLoading={isLoading}
            />
            <KpiCard
              icon={TrendingUp}
              label="Warm Pipeline"
              value={clientKpis.warmPipeline}
              sub="Negotiating & Reserved"
              accentClasses="bg-amber-50 text-amber-600"
              isLoading={isLoading}
            />
            <KpiCard
              icon={CheckCircle2}
              label="Closed This Month"
              value={clientKpis.closedThisMonth}
              sub="Successful reservations"
              accentClasses="bg-emerald-50 text-emerald-600"
              isLoading={isLoading}
            />
            <KpiCard
              icon={XCircle}
              label="Rejected"
              value={clientKpis.totalRejected}
              sub="Did not proceed"
              accentClasses="bg-rose-50 text-rose-500"
              isLoading={isLoading}
            />
          </div>

          {/* ── Pipeline chart (2/3) + Recent clients (1/3) ──────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <SectionCard
              className="lg:col-span-2"
              isLoading={isLoading}
              loadingHeight="h-[262px]"
            >
              <SectionHeader
                title="Client Pipeline"
                sub="Count per stage — rejected excluded"
                href="/dashboard/manager/clients"
              />
              <PipelineChart clients={clients} />
            </SectionCard>

            <SectionCard isLoading={isLoading} loadingHeight="h-[262px]">
              <SectionHeader
                title="Recently Added"
                sub="Last 7 clients, newest first"
                href="/dashboard/manager/clients"
              />
              <RecentClientsTable clients={clients} />
            </SectionCard>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
