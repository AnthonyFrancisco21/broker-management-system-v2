"use client";
import RoleGuard from "../../../components/RoleGuard";
import DashboardLayout from "../../../components/DashboardLayout";
import BrokerPerformanceTable from "../../../components/BrokerPerformanceTable";
import PerformanceAnalytics from "../../../components/PerformanceAnalytics";
import { Users, UserCheck, Briefcase } from "lucide-react";

export default function ManagerDashboard() {
  const managerNavItems = [
    { label: "Dashboard", href: "/dashboard/manager" },
    { label: "Brokers/Agent List", href: "/dashboard/manager/brokers" },
    { label: "Statistics", href: "/dashboard/manager/statistics" },
    { label: "Unit Management", href: "/dashboard/manager/units" },
  ];

  return (
    <RoleGuard allowedRoles={["ADMIN", "MANAGER"]}>
      <DashboardLayout navItems={managerNavItems} roleTitle="Manager Dashboard">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              Manager Dashboard
            </h1>
            <p className="text-sm text-slate-500">
              Select an option from the sidebar to get started.
            </p>
          </div>

          {/* Stats Cards (Now matching the Broker layout with icons) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-50 text-blue-600 shrink-0">
                <Users size={24} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500">
                  Overall Agents/Brokers
                </h3>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">0</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600 shrink-0">
                <UserCheck size={24} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500">
                  Total Clients
                </h3>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">0</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-amber-50 text-amber-600 shrink-0">
                <Briefcase size={24} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500">
                  Active Deals
                </h3>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">N/A</p>
              </div>
            </div>
          </div>

          {/* Performance Analytics and Table Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PerformanceAnalytics />
            <BrokerPerformanceTable />
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
