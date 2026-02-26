"use client";
import RoleGuard from "../../../../components/RoleGuard";
import DashboardLayout from "../../../../components/DashboardLayout";

export default function ClientsPage() {
  const brokerNavItems = [
    { label: "Dashboard", href: "/dashboard/broker" },
    { label: "Client Management", href: "/dashboard/broker/clients" },
    { label: "Unit Management", href: "/dashboard/broker/units" },
  ];

  return (
    <RoleGuard allowedRoles={["AGENT", "MANAGER", "ADMIN"]}>
      <DashboardLayout navItems={brokerNavItems} roleTitle="Broker Dashboard">
        <div>
          <h1 className="text-2xl font-bold mb-4">Client Management</h1>

          <div className="bg-white p-6 rounded border border-slate-200">
            <p className="text-slate-600">No clients available yet.</p>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
