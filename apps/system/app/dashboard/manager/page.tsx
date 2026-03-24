// ─────────────────────────────────────────────────────────────────────────────
// app/dashboard/manager/page.tsx
//
// Manager Dashboard — first screen after login.
//
// Responsibility: layout + composition only.
// All data fetching lives in useDashboardData.
// All derived calculations live in deriveKpis / deriveAttentionItems.
// All UI pieces live in _components/.
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { useMemo } from "react";
import RoleGuard from "../../../components/RoleGuard";
import DashboardLayout from "../../../components/DashboardLayout";
import { managerNavItems } from "../../../lib/navigation";

// Data layer
import {
  useDashboardData,
  deriveKpis,
  deriveAttentionItems,
} from "../../../lib/useDashboardData";

// UI components
import { KpiCard } from "../../../components/KpiCard";
import { SectionCard, SectionHeader } from "../../../components/SectionCard";
import { AttentionBanner } from "../../../components/AttentionBanner";
import { PipelineChart } from "../../../components/PipelineChart";
import { UnitInventoryChart } from "../../../components/UnitInventoryChart";
import { RecentClientsTable } from "../../..//components/RecentClientsTable";
import { ActiveDealsList } from "../../../components/ActiveDealsList";

// Icons
import {
  UserCheck,
  TrendingUp,
  Building2,
  CheckCircle2,
  RefreshCw,
  CalendarDays,
  Plus,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────

export default function ManagerDashboard() {
  const { data, isLoading, isRefreshing, lastUpdated, refresh } =
    useDashboardData();

  const { clients, units } = data;

  // Derived values are pure functions — no side effects, easy to test
  const kpis = useMemo(() => deriveKpis(clients, units), [clients, units]);
  const attentionItems = useMemo(
    () => deriveAttentionItems(clients, units),
    [clients, units],
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
          {/* ── Page header ──────────────────────────────────────────────── */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight tracking-tight">
                Dashboard
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Your pipeline, inventory, and recent activity at a glance
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Last updated */}
              {updatedStr && (
                <span className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 mr-1">
                  <CalendarDays size={12} />
                  {updatedStr}
                </span>
              )}

              {/* Quick actions */}
              <a
                href="/dashboard/manager/clients"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus size={13} />
                Add Client
              </a>
              <a
                href="/dashboard/manager/units"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <Plus size={13} />
                Add Unit
              </a>

              {/* Refresh */}
              <button
                onClick={refresh}
                disabled={isRefreshing}
                className="p-2 rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-40"
                aria-label="Refresh dashboard"
              >
                <RefreshCw
                  size={14}
                  className={isRefreshing ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>

          {/* ── Attention banners (only when loaded & items exist) ───────── */}
          {!isLoading && <AttentionBanner items={attentionItems} />}

          {/* ── KPI cards ─────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <KpiCard
              icon={UserCheck}
              label="Total Clients"
              value={kpis.totalClients}
              sub={`${kpis.conversionRate}% overall close rate`}
              accentClasses="bg-blue-50 text-blue-600"
              isLoading={isLoading}
            />
            <KpiCard
              icon={TrendingUp}
              label="Warm Pipeline"
              value={kpis.warmPipeline}
              sub="Viewing, negotiating & reserved"
              accentClasses="bg-amber-50 text-amber-600"
              isLoading={isLoading}
            />
            <KpiCard
              icon={Building2}
              label="Units Available"
              value={kpis.availableUnits}
              sub={`of ${units.length} total`}
              accentClasses="bg-emerald-50 text-emerald-600"
              isLoading={isLoading}
            />
            <KpiCard
              icon={CheckCircle2}
              label="Closed This Month"
              value={kpis.closedThisMonth}
              sub="Successful reservations"
              accentClasses="bg-violet-50 text-violet-600"
              isLoading={isLoading}
            />
          </div>

          {/* ── Charts row: Pipeline (2/3) + Unit inventory (1/3) ───────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            {/* Pipeline bar chart */}
            <SectionCard
              className="lg:col-span-2"
              isLoading={isLoading}
              loadingHeight="h-[262px]"
            >
              <SectionHeader
                title="Client Pipeline"
                sub="Count of clients at each stage (excluding rejected)"
                href="/dashboard/manager/clients"
              />
              <PipelineChart clients={clients} />
            </SectionCard>

            {/* Unit inventory donut */}
            <SectionCard isLoading={isLoading} loadingHeight="h-[262px]">
              <SectionHeader
                title="Unit Inventory"
                sub="Status breakdown across all units"
                href="/dashboard/manager/units"
              />
              <UnitInventoryChart units={units} />
            </SectionCard>
          </div>

          {/* ── Bottom row: Recent clients (2/3) + Active deals (1/3) ────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Recent clients table */}
            <SectionCard
              className="lg:col-span-2"
              isLoading={isLoading}
              loadingHeight="h-48"
            >
              <SectionHeader
                title="Recently Added Clients"
                sub="Latest 7 entries sorted by date"
                href="/dashboard/manager/clients"
              />
              <RecentClientsTable clients={clients} />
            </SectionCard>

            {/* Active deals */}
            <SectionCard isLoading={isLoading} loadingHeight="h-48">
              <SectionHeader
                title="Active Deals"
                sub="Reserved & negotiating"
                href="/dashboard/manager/reservations"
              />
              <ActiveDealsList clients={clients} />
            </SectionCard>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
