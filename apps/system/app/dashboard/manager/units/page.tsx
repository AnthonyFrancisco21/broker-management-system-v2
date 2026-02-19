"use client";
import RoleGuard from "../../../../components/RoleGuard";
import DashboardLayout from "../../../../components/DashboardLayout";

export default function UnitsPage() {
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
          <h1 className="text-2xl font-bold mb-4">Unit Management</h1>

          <div className="bg-white p-6 rounded border border-slate-200">
            <p className="text-slate-600">No units available yet.</p>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
