"use client";
import RoleGuard from "../../../components/RoleGuard";
import DashboardLayout from "../../../components/DashboardLayout";
import BrokerPerformanceTable from "../../../components/BrokerPerformanceTable";
import PerformanceAnalytics from "../../../components/PerformanceAnalytics";

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
        <div>
          <h1 className="text-2xl font-bold mb-2">
            Welcome to Manager Dashboard
          </h1>
          <p className="text-slate-600 mb-6">
            Select an option from the sidebar to get started.
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded border border-slate-200">
              <h3 className="font-semibold text-slate-900">
                Overall Agents/Brokers
              </h3>
              <p className="text-2xl font-bold text-blue-600 mt-2">0</p>
            </div>
            <div className="bg-white p-4 rounded border border-slate-200">
              <h3 className="font-semibold text-slate-900">Total Clients</h3>
              <p className="text-2xl font-bold text-green-600 mt-2">0</p>
            </div>
            <div className="bg-white p-4 rounded border border-slate-200">
              <h3 className="font-semibold text-slate-900">Active Deals</h3>
              <p className="text-2xl font-bold text-purple-600 mt-2">N/A</p>
            </div>
          </div>

          {/* Performance Analytics and Table Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PerformanceAnalytics />
            <BrokerPerformanceTable />
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
