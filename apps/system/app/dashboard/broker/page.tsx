"use client";
import RoleGuard from "../../../components/RoleGuard";
import DashboardLayout from "../../../components/DashboardLayout";

export default function BrokerDashboard() {
  const brokerNavItems = [
    { label: "Dashboard", href: "/dashboard/broker" },
    { label: "Client Management", href: "/dashboard/broker/clients" },
    { label: "Unit Management", href: "/dashboard/broker/units" },
  ];

  return (
    <RoleGuard allowedRoles={["BROKER", "MANAGER", "ADMIN"]}>
      <DashboardLayout navItems={brokerNavItems} roleTitle="Broker Dashboard">
        <div>
          <h1 className="text-2xl font-bold mb-2">
            Welcome to Broker Dashboard
          </h1>
          <p className="text-slate-600">
            Manage your clients and units from here.
          </p>

          {/* Placeholder stats or content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-white p-4 rounded border border-slate-200">
              <h3 className="font-semibold text-slate-900">Active Clients</h3>
              <p className="text-2xl font-bold text-blue-600 mt-2">0</p>
            </div>
            <div className="bg-white p-4 rounded border border-slate-200">
              <h3 className="font-semibold text-slate-900">Available Units</h3>
              <p className="text-2xl font-bold text-green-600 mt-2">0</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
