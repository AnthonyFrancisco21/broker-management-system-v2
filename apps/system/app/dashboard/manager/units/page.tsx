"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import RoleGuard from "../../../../components/RoleGuard";
import DashboardLayout from "../../../../components/DashboardLayout";

interface UnitRow {
  id: number;
  unitNo?: string;
  details?: string;
  floor?: number;
  size?: number;
  installment?: string;
  price?: number;
  unitStatus?: string;
}

export default function UnitsPage() {
  const managerNavItems = [
    { label: "Dashboard", href: "/dashboard/manager" },
    { label: "Brokers/Agent List", href: "/dashboard/manager/brokers" },
    { label: "Statistics", href: "/dashboard/manager/statistics" },
    { label: "Unit Management", href: "/dashboard/manager/units" },
  ];

  const [units, setUnits] = useState<UnitRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/units`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (res.status === 401) {
          setError("Unauthorized");
          setLoading(false);
          return;
        }

        if (!res.ok) throw new Error("Failed to fetch units");

        const data = await res.json();

        const rows: UnitRow[] = data.map((u: any) => ({
          id: u.id,
          unitNo: u.unitNo || u.unitCode || undefined,
          details: u.details || u.description || undefined,
          floor: u.floor,
          size: u.size || u.area || undefined,
          installment: u.installmentPlan || u.installment || undefined,
          price: u.price || undefined,
          unitStatus: u.unitStatus || u.status || undefined,
        }));

        setUnits(rows);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, []);

  return (
    <RoleGuard allowedRoles={["ADMIN", "MANAGER"]}>
      <DashboardLayout navItems={managerNavItems} roleTitle="Manager Dashboard">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Unit Management</h1>
            <Link
              href="/dashboard/manager/units/add"
              className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm"
            >
              Add Unit
            </Link>
          </div>

          <div className="bg-white p-4 rounded border border-slate-200">
            {loading ? (
              <p className="text-slate-500">Loading units...</p>
            ) : error ? (
              <p className="text-red-600">{error}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-700 border-b border-slate-200">
                      <th className="py-2 px-2 font-semibold">ID</th>
                      <th className="py-2 px-2 font-semibold">Details</th>
                      <th className="py-2 px-2 font-semibold">Floor</th>
                      <th className="py-2 px-2 font-semibold">Size (sqm)</th>
                      <th className="py-2 px-2 font-semibold">Installment</th>
                      <th className="py-2 px-2 font-semibold">Price</th>
                      <th className="py-2 px-2 font-semibold">Status</th>
                      <th className="py-2 px-2 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {units.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="py-4 px-2 text-center text-slate-500"
                        >
                          No units found
                        </td>
                      </tr>
                    ) : (
                      units.map((u) => (
                        <tr
                          key={u.id}
                          className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-2 px-2 text-slate-900">{u.id}</td>
                          <td className="py-2 px-2 text-slate-700">
                            {u.details || u.unitNo || "-"}
                          </td>
                          <td className="py-2 px-2 text-slate-700">
                            {u.floor ?? "-"}
                          </td>
                          <td className="py-2 px-2 text-slate-700">
                            {u.size ?? "-"}
                          </td>
                          <td className="py-2 px-2 text-slate-700">
                            {u.installment ?? "-"}
                          </td>
                          <td className="py-2 px-2 text-slate-700">
                            {u.price ? u.price.toLocaleString() : "-"}
                          </td>
                          <td className="py-2 px-2 text-slate-700">
                            {u.unitStatus ?? "-"}
                          </td>
                          <td className="py-2 px-2">
                            <div className="flex gap-2 justify-end">
                              <Link
                                href={`/dashboard/manager/units/${u.id}/edit`}
                                className="px-2 py-1 text-sm bg-yellow-500 text-white rounded"
                              >
                                Edit
                              </Link>
                              <button className="px-2 py-1 text-sm bg-red-600 text-white rounded">
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
