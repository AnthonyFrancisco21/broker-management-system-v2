"use client";

import RoleGuard from "../../../../components/RoleGuard";
import DashboardLayout from "../../../../components/DashboardLayout";
import { managerNavItems } from "../../../../lib/navigation";
import { useStatisticsData } from "../../../../lib/useStatisticsData";

import { KpiCard } from "../../../../components/KpiCard";
import { SectionCard, SectionHeader } from "../../../../components/SectionCard";
import { UnitStatusDonut } from "../../../../components/UnitStatusDonut";
import { UnitRevenueBreakdown } from "../../../../components/UnitRevenueBreakdown";
import { AgentRosterTable } from "../../../../components/AgentRosterTable";

import {
  Wallet,
  Building2,
  Users,
  BadgeCheck,
  RefreshCw,
  Loader2,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

// ─── Formatter ────────────────────────────────────────────────────────────────

function formatPesoCompact(value: number): string {
  if (value === 0) return "₱0";
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

// ─── Section divider ──────────────────────────────────────────────────────────

function SectionDivider({
  title,
  sub,
  href,
  linkLabel,
}: {
  title: string;
  sub: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between mt-8 mb-4">
      <div>
        <h2 className="text-base font-bold text-slate-800 leading-tight">
          {title}
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
      </div>
      {href && (
        <a
          href={href}
          className="flex items-center gap-0.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors shrink-0 ml-4 mb-0.5"
        >
          {linkLabel ?? "View all"}
          <ChevronRight size={13} />
        </a>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function StatisticsPage() {
  const { data, isLoading, error, refresh } = useStatisticsData();

  return (
    <RoleGuard allowedRoles={["ADMIN", "MANAGER"]}>
      <DashboardLayout navItems={managerNavItems} roleTitle="Manager Dashboard">
        <div className="flex flex-col min-h-full">

          {/* ── Page header ───────────────────────────────────────────── */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight tracking-tight">
                Statistics
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Unit inventory, revenue breakdown, and agent overview — visible
                to all managers
              </p>
            </div>
            <button
              onClick={refresh}
              disabled={isLoading}
              className="p-2 rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-40"
              aria-label="Refresh"
            >
              <RefreshCw
                size={14}
                className={isLoading ? "animate-spin" : ""}
              />
            </button>
          </div>

          {/* ── Error ─────────────────────────────────────────────────── */}
          {error && (
            <div className="flex items-center gap-3 px-4 py-3 bg-rose-50 border border-rose-100 rounded-xl text-sm text-rose-700 mb-5">
              <AlertTriangle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          {/* ── Full-page loader ──────────────────────────────────────── */}
          {isLoading && !data && (
            <div className="flex-1 flex items-center justify-center py-24">
              <Loader2 size={28} className="animate-spin text-slate-200" />
            </div>
          )}

          {data && (
            <>
              {/* ════════════════════════════════════════════════════════
                  SECTION 1 — UNITS & REVENUE
              ════════════════════════════════════════════════════════ */}
              <SectionDivider
                title="Units & Revenue"
                sub="Inventory status and financial breakdown by unit pricing"
                href="/dashboard/manager/units"
                linkLabel="Manage units"
              />

              {/* Unit KPIs */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <KpiCard
                  icon={Building2}
                  label="Occupancy Rate"
                  value={`${data.summary.occupancyRate}%`}
                  sub={`${data.summary.totalUnits} total units`}
                  accentClasses="bg-slate-50 text-slate-600"
                  isLoading={false}
                />
                <KpiCard
                  icon={Wallet}
                  label="Total Portfolio Value"
                  value={formatPesoCompact(
                    data.revenueRows.reduce((s, r) => s + r.value, 0),
                  )}
                  sub="All priced units combined"
                  accentClasses="bg-emerald-50 text-emerald-600"
                  isLoading={false}
                />
              </div>

              {/* Unit status donut + Revenue breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-2">
                <SectionCard>
                  <SectionHeader
                    title="Unit Status Breakdown"
                    sub="Current status of all units in inventory"
                  />
                  <UnitStatusDonut slices={data.unitSlices} />
                </SectionCard>

                <SectionCard>
                  <SectionHeader
                    title="Revenue by Status"
                    sub="Sum of unit prices grouped by current status"
                  />
                  <UnitRevenueBreakdown rows={data.revenueRows} />
                </SectionCard>
              </div>

              {/* ════════════════════════════════════════════════════════
                  SECTION 2 — AGENTS
                  ALL agents — both managers see the same list.
                  No client connection — profile data only.
              ════════════════════════════════════════════════════════ */}
              <SectionDivider
                title="Agent Overview"
                sub="All agents on record — visible to all managers"
                href="/dashboard/manager/brokers"
                linkLabel="Manage agents"
              />

              {/* Agent KPIs */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <KpiCard
                  icon={Users}
                  label="Total Agents"
                  value={data.summary.totalAgents}
                  sub="Active on the team"
                  accentClasses="bg-indigo-50 text-indigo-600"
                  isLoading={false}
                />
                <KpiCard
                  icon={BadgeCheck}
                  label="Licensed Agents"
                  value={data.summary.licensedAgents}
                  sub={
                    data.summary.totalAgents > 0
                      ? `${Math.round((data.summary.licensedAgents / data.summary.totalAgents) * 100)}% of team`
                      : "No agents yet"
                  }
                  accentClasses="bg-emerald-50 text-emerald-600"
                  isLoading={false}
                />
              </div>

              {/* Agent roster table */}
              <SectionCard>
                <SectionHeader
                  title="Agent Roster"
                  sub="Profile overview — name, position, contact, and license status"
                  href="/dashboard/manager/brokers"
                  linkLabel="Full details"
                />
                <AgentRosterTable agents={data.agents} />
              </SectionCard>
            </>
          )}

        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}