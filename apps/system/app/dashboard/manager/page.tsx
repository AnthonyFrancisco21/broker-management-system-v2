"use client";

import { useEffect, useState } from "react";
import RoleGuard from "../../../components/RoleGuard";
import DashboardLayout from "../../../components/DashboardLayout";
import BrokerPerformanceTable from "../../../components/BrokerPerformanceTable";
import PerformanceAnalytics from "../../../components/PerformanceAnalytics";
import { Users, UserCheck, Briefcase, Loader2 } from "lucide-react";

export default function ManagerDashboard() {
  const managerNavItems = [
    { label: "Dashboard", href: "/dashboard/manager" },
    { label: "Brokers/Agent List", href: "/dashboard/manager/brokers" },
    { label: "Statistics", href: "/dashboard/manager/statistics" },
    { label: "Unit Management", href: "/dashboard/manager/units" },
  ];

  const [stats, setStats] = useState({
    totalBrokers: 0,
    totalClients: 0,
    activeDeals: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) {
          setLoading(false);
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const [brokersRes, clientsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/brokers`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients`, { headers }),
        ]);

        if (brokersRes.ok && clientsRes.ok) {
          const brokersData = await brokersRes.json();
          const clientsData = await clientsRes.json();

          const activeDealsCount = clientsData.filter(
            (client: any) =>
              client.clientStatus === "underNego" ||
              client.clientStatus === "reserved",
          ).length;

          setStats({
            totalBrokers: brokersData.length || 0,
            totalClients: clientsData.length || 0,
            activeDeals: activeDealsCount,
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <RoleGuard allowedRoles={["ADMIN", "MANAGER"]}>
      <DashboardLayout navItems={managerNavItems} roleTitle="Manager Dashboard">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              Manager Dashboard Overview
            </h1>
            <p className="text-sm text-slate-500">
              High-level insights into your team's performance and pipeline
              health.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-50 text-blue-600 shrink-0">
                <Users size={24} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500">
                  Overall Agents/Brokers
                </h3>
                <div className="text-2xl font-bold text-slate-900 mt-0.5 flex items-center h-8">
                  {loading ? (
                    <Loader2
                      size={20}
                      className="animate-spin text-slate-400"
                    />
                  ) : (
                    stats.totalBrokers
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600 shrink-0">
                <UserCheck size={24} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500">
                  Total Clients
                </h3>
                <div className="text-2xl font-bold text-slate-900 mt-0.5 flex items-center h-8">
                  {loading ? (
                    <Loader2
                      size={20}
                      className="animate-spin text-slate-400"
                    />
                  ) : (
                    stats.totalClients
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-amber-50 text-amber-600 shrink-0">
                <Briefcase size={24} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500">
                  Active Deals (Nego/Reserved)
                </h3>
                <div className="text-2xl font-bold text-slate-900 mt-0.5 flex items-center h-8">
                  {loading ? (
                    <Loader2
                      size={20}
                      className="animate-spin text-slate-400"
                    />
                  ) : (
                    stats.activeDeals
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Performance Grid - 1/3 and 2/3 split for better data visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <PerformanceAnalytics />
            </div>
            <div className="lg:col-span-2">
              <BrokerPerformanceTable />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
