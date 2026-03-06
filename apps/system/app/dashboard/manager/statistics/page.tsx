"use client";

import { useEffect, useState } from "react";
import { Building, TrendingUp, Users, Wallet } from "lucide-react";
import RoleGuard from "../../../../components/RoleGuard";
import DashboardLayout from "../../../../components/DashboardLayout";
import UnitStatusPieChart from "../../../../components/UnitStatusPieChart";
import ClientPipelineBarChart from "../../../../components/ClientPipelineBarChart";
import SalesGrowthLineChart from "../../../../components/SalesGrowthLineChart";

interface ClientData {
  clientStatus: string;
  createdAt: string;
}

interface UnitData {
  unitStatus: string;
  price: number | string | null;
}

export default function StatisticsPage() {
  const managerNavItems = [
    { label: "Dashboard", href: "/dashboard/manager" },
    { label: "Brokers/Agent List", href: "/dashboard/manager/brokers" },
    { label: "Statistics", href: "/dashboard/manager/statistics" },
    { label: "Unit Management", href: "/dashboard/manager/units" },
  ];

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Summary Metrics
  const [metrics, setMetrics] = useState({
    totalUnits: 0,
    occupancyRate: 0,
    pipelineValue: 0,
    activeClients: 0,
  });

  // Chart Data States
  const [unitStatusData, setUnitStatusData] = useState<
    { name: string; value: number }[]
  >([]);
  const [pipelineData, setPipelineData] = useState<
    { status: string; count: number }[]
  >([]);
  const [monthlyData, setMonthlyData] = useState<
    { month: string; leads: number; closed: number }[]
  >([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const [unitsRes, clientsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/units`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients`, { headers }),
        ]);

        if (!unitsRes.ok || !clientsRes.ok)
          throw new Error("Failed to fetch analytical data");

        const units: UnitData[] = await unitsRes.json();
        const clients: ClientData[] = await clientsRes.json();

        // 1. Calculate Unit Metrics & Pie Chart Data
        let occupied = 0;
        let pipelineVal = 0;
        const statusCounts: Record<string, number> = {
          Available: 0,
          Viewing: 0,
          Reserved: 0,
          "Under Nego": 0,
          Occupied: 0,
        };

        units.forEach((u) => {
          const status = u.unitStatus?.toLowerCase() || "available";
          if (status === "occupied") {
            occupied++;
            statusCounts["Occupied"]++;
          } else if (status === "viewing") {
            statusCounts["Viewing"]++;
          } else if (status === "reserved") {
            statusCounts["Reserved"]++;
            pipelineVal += Number(u.price || 0);
          } else if (status === "undernego") {
            statusCounts["Under Nego"]++;
            pipelineVal += Number(u.price || 0);
          } else {
            statusCounts["Available"]++;
          }
        });

        const totalU = units.length;
        const occRate = totalU > 0 ? Math.round((occupied / totalU) * 100) : 0;

        setUnitStatusData(
          Object.entries(statusCounts).map(([name, value]) => ({
            name,
            value,
          })),
        );

        // 2. Calculate Client Metrics & Pipeline Bar Chart
        let activeC = 0;
        const clientFunnel: Record<string, number> = {
          Prospect: 0,
          Viewing: 0,
          Reserved: 0,
          "Under Nego": 0,
          Success: 0,
        };

        clients.forEach((c) => {
          const status = c.clientStatus?.toLowerCase() || "prospect";
          if (status !== "rejected" && status !== "success") activeC++;

          if (status === "prospect") clientFunnel["Prospect"]++;
          if (status === "viewing") clientFunnel["Viewing"]++;
          if (status === "reserved") clientFunnel["Reserved"]++;
          if (status === "undernego") clientFunnel["Under Nego"]++;
          if (status === "success") clientFunnel["Success"]++;
        });

        setPipelineData(
          Object.entries(clientFunnel).map(([status, count]) => ({
            status,
            count,
          })),
        );

        // 3. Calculate Monthly Sales & Leads Data
        const monthNames = [
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
        ];
        const monthlyStats: Record<string, { leads: number; closed: number }> =
          {};

        // Initialize last 6 months
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
          monthlyStats[monthNames[d.getMonth()]] = { leads: 0, closed: 0 };
        }

        clients.forEach((c) => {
          if (!c.createdAt) return;
          const d = new Date(c.createdAt);
          const m = monthNames[d.getMonth()];
          if (monthlyStats[m] !== undefined) {
            monthlyStats[m].leads++;
            if (c.clientStatus?.toLowerCase() === "success") {
              monthlyStats[m].closed++;
            }
          }
        });

        setMonthlyData(
          Object.entries(monthlyStats).map(([month, data]) => ({
            month,
            ...data,
          })),
        );

        setMetrics({
          totalUnits: totalU,
          occupancyRate: occRate,
          pipelineValue: pipelineVal,
          activeClients: activeC,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <RoleGuard allowedRoles={["ADMIN", "MANAGER"]}>
      <DashboardLayout navItems={managerNavItems} roleTitle="Manager Dashboard">
        <div className="flex flex-col h-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              Performance Statistics
            </h1>
            <p className="text-sm text-slate-500">
              Comprehensive view of inventory and sales pipeline health.
            </p>
          </div>

          {/* Manager Insights Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-50 text-purple-600 shrink-0">
                <Building size={24} />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Units
                </h3>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">
                  {metrics.totalUnits}
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-50 text-blue-600 shrink-0">
                <TrendingUp size={24} />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Occupancy Rate
                </h3>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">
                  {metrics.occupancyRate}%
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600 shrink-0">
                <Wallet size={24} />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Pipeline Value
                </h3>
                <p className="text-xl font-bold text-slate-900 mt-0.5">
                  ₱ {metrics.pipelineValue.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-amber-50 text-amber-600 shrink-0">
                <Users size={24} />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Active Clients
                </h3>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">
                  {metrics.activeClients}
                </p>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <p className="text-red-600 text-center py-10 bg-red-50 rounded-xl border border-red-100">
              {error}
            </p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Unit Distribution Pie Chart */}
              <div className="lg:col-span-1">
                <UnitStatusPieChart
                  data={unitStatusData}
                  title="Unit Status Distribution"
                />
              </div>

              {/* Pipeline Bar Chart */}
              <div className="lg:col-span-2">
                <ClientPipelineBarChart
                  data={pipelineData}
                  title="Client Sales Funnel"
                />
              </div>

              {/* Growth Line Chart */}
              <div className="lg:col-span-3">
                <SalesGrowthLineChart
                  data={monthlyData}
                  title="Monthly Growth (Leads vs Closed Deals)"
                />
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
