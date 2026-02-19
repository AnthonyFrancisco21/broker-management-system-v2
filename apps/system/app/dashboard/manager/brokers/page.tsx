"use client";
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import RoleGuard from "../../../../components/RoleGuard";
import DashboardLayout from "../../../../components/DashboardLayout";

interface BrokerRow {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  contactNo?: string;
  brokersLicense?: string;
  employerName?: string;
}

export default function BrokersPage() {
  const managerNavItems = [
    { label: "Dashboard", href: "/dashboard/manager" },
    { label: "Brokers/Agent List", href: "/dashboard/manager/brokers" },
    { label: "Statistics", href: "/dashboard/manager/statistics" },
    { label: "Unit Management", href: "/dashboard/manager/units" },
  ];

  const [brokers, setBrokers] = useState<BrokerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrokers = async () => {
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/brokers`, {
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

        if (!res.ok) throw new Error("Failed to fetch brokers");

        const data = await res.json();
        const rows: BrokerRow[] = data.map(
          (b: {
            id: number;
            firstName?: string;
            lastName?: string;
            email?: string;
            contactNo?: string;
            brokersLicense?: string;
            employerName?: string;
          }) => ({
            id: b.id,
            firstName: b.firstName,
            lastName: b.lastName,
            email: b.email,
            contactNo: b.contactNo,
            brokersLicense: b.brokersLicense,
            employerName: b.employerName,
          }),
        );

        setBrokers(rows);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchBrokers();
  }, []);

  return (
    <RoleGuard allowedRoles={["ADMIN", "MANAGER"]}>
      <DashboardLayout navItems={managerNavItems} roleTitle="Manager Dashboard">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Brokers/Agent List</h1>
            <Link
              href="/dashboard/manager/brokers/add"
              className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm"
            >
              Add Agent
            </Link>
          </div>

          <div className="bg-white p-4 rounded border border-slate-200">
            {loading ? (
              <p className="text-slate-500">Loading...</p>
            ) : error ? (
              <p className="text-red-600">{error}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-700 border-b border-slate-200">
                      <th className="py-2 px-2 font-semibold">Full Name</th>
                      <th className="py-2 px-2 font-semibold">Email</th>
                      <th className="py-2 px-2 font-semibold">Contact No.</th>
                      <th className="py-2 px-2 font-semibold">
                        Broker License No.
                      </th>
                      <th className="py-2 px-2 font-semibold">
                        Employer / Company
                      </th>
                      <th className="py-2 px-2 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brokers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-4 px-2 text-center text-slate-500"
                        >
                          No brokers found
                        </td>
                      </tr>
                    ) : (
                      brokers.map((b) => (
                        <tr
                          key={b.id}
                          className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-2 px-2 text-slate-900">
                            {b.firstName} {b.lastName}
                          </td>
                          <td className="py-2 px-2 text-slate-700">
                            {b.email || "-"}
                          </td>
                          <td className="py-2 px-2 text-slate-700">
                            {b.contactNo || "-"}
                          </td>
                          <td className="py-2 px-2 text-slate-700">
                            {b.brokersLicense || "-"}
                          </td>
                          <td className="py-2 px-2 text-slate-700">
                            {b.employerName || "-"}
                          </td>
                          <td className="py-2 px-2">
                            <div className="flex gap-2 justify-end">
                              <button className="px-2 py-1 text-sm bg-yellow-500 text-white rounded">
                                Edit
                              </button>
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
