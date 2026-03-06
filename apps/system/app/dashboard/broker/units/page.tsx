"use client";

import { useEffect, useState, useMemo } from "react";
import { Home, Building, LayoutGrid, Loader2, Search } from "lucide-react";
import RoleGuard from "../../../../components/RoleGuard";
import DashboardLayout from "../../../../components/DashboardLayout";
import UnitDetailsModal from "../../../../components/UnitDetailsModal";

interface UnitRow {
  id: number;
  unitType?: string;
  details?: string;
  roomNo?: string;
  floor?: number;
  size?: string;
  installment?: string;
  installmentPerMonth?: string;
  price?: number;
  unitStatus?: string;
  unitPictures?: any[];
}

export default function BrokerUnitsPage() {
  // Adjusted navigation items for the broker dashboard
  const brokerNavItems = [
    { label: "Dashboard", href: "/dashboard/broker" },
    { label: "Client Management", href: "/dashboard/broker/clients" },
    { label: "Unit Management", href: "/dashboard/broker/units" },
  ];

  const [units, setUnits] = useState<UnitRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [fetchingUnitId, setFetchingUnitId] = useState<number | null>(null);
  const [viewingUnit, setViewingUnit] = useState<UnitRow | null>(null);

  const loadUnits = async () => {
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
        unitType: u.unitType,
        details: u.roomNo,
        roomNo: u.roomNo,
        floor: u.floor,
        size: u.size,
        installment: u.installmentPerMonth,
        installmentPerMonth: u.installmentPerMonth,
        price: u.price,
        unitStatus: u.unitStatus,
        unitPictures: u.unitPictures || [],
      }));

      setUnits(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnits();
  }, []);

  // Filter Logic
  const filteredUnits = useMemo(() => {
    if (!searchTerm.trim()) return units;
    const term = searchTerm.toLowerCase();
    return units.filter((u) => {
      return (
        u.unitType?.toLowerCase().includes(term) ||
        u.roomNo?.toLowerCase().includes(term) ||
        u.unitStatus?.toLowerCase().includes(term)
      );
    });
  }, [units, searchTerm]);

  const fetchFreshUnitData = async (unit: UnitRow) => {
    setFetchingUnitId(unit.id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/units/${unit.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (res.ok) {
        const freshData = await res.json();
        return {
          id: freshData.id,
          unitType: freshData.unitType,
          details: freshData.roomNo,
          roomNo: freshData.roomNo,
          floor: freshData.floor,
          size: freshData.size,
          installment: freshData.installmentPerMonth,
          installmentPerMonth: freshData.installmentPerMonth,
          price: freshData.price,
          unitStatus: freshData.unitStatus,
          unitPictures: freshData.unitPictures || [],
        };
      }
    } catch (err) {
      console.error("Failed to fetch fresh data", err);
    } finally {
      setFetchingUnitId(null);
    }
    return unit;
  };

  const handleRowClick = async (u: UnitRow) => {
    if (fetchingUnitId === u.id) return;
    const freshUnit = await fetchFreshUnitData(u);
    setViewingUnit(freshUnit);
  };

  const getStatusColor = (status?: string) => {
    const s = (status || "").toLowerCase();
    if (s.includes("available"))
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s.includes("reserved"))
      return "bg-amber-50 text-amber-700 border-amber-200";
    if (s.includes("sold")) return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <RoleGuard allowedRoles={["CLIENT", "AGENT"]}>
      <DashboardLayout navItems={brokerNavItems} roleTitle="Broker Dashboard">
        <div className="flex flex-col h-full">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Property Units
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Browse available properties, pricing, and status
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Functional Search Bar */}
              <div className="relative w-full sm:w-80">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search unit, room, or status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                />
              </div>
            </div>
          </div>

          <UnitDetailsModal
            isOpen={!!viewingUnit}
            onClose={() => setViewingUnit(null)}
            unit={viewingUnit}
          />

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
            {loading ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-sm font-medium">Loading units...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex-1 p-8 text-center">
                <p className="text-red-500 font-medium">{error}</p>
              </div>
            ) : (
              <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-240px)] w-full custom-scrollbar">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm shadow-sm">
                    <tr className="text-slate-600 border-b border-slate-200">
                      <th className="py-4 px-6 font-semibold w-2/5">
                        Unit Identity
                      </th>
                      <th className="py-4 px-6 font-semibold">
                        Specifications
                      </th>
                      <th className="py-4 px-6 font-semibold">Financials</th>
                      <th className="py-4 px-6 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUnits.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-12 px-6 text-center text-slate-500"
                        >
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Building size={32} className="text-slate-300" />
                            <p className="text-sm font-medium">
                              {searchTerm
                                ? "No units match your search"
                                : "No units available right now"}
                            </p>
                            <p className="text-xs text-slate-400">
                              {searchTerm
                                ? "Try adjusting your filters or search keywords."
                                : "Please check back later for updated listings."}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredUnits.map((u) => (
                        <tr
                          key={u.id}
                          onClick={() => handleRowClick(u)}
                          className={`hover:bg-slate-50/80 transition-colors group ${
                            fetchingUnitId === u.id
                              ? "cursor-wait opacity-60"
                              : "cursor-pointer"
                          }`}
                        >
                          <td className="py-3 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                {fetchingUnitId === u.id ? (
                                  <Loader2 size={18} className="animate-spin" />
                                ) : (
                                  <Home size={18} />
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                                  {u.unitType || "Unnamed Unit"}
                                </span>
                                <span className="text-xs text-slate-500 truncate max-w-[200px]">
                                  {u.roomNo
                                    ? `Room: ${u.roomNo}`
                                    : `ID: ${String(u.id).padStart(4, "0")}`}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-6">
                            <div className="flex flex-col">
                              <span className="text-slate-700">
                                Floor:{" "}
                                <span className="font-medium">
                                  {u.floor ?? "-"}
                                </span>
                              </span>
                              <span className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                <LayoutGrid size={12} />
                                {u.size
                                  ? `${u.size} sqm`
                                  : "Size not specified"}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-6">
                            <div className="flex flex-col">
                              <span className="text-slate-900 font-medium">
                                {u.price
                                  ? `₱ ${u.price.toLocaleString()}`
                                  : "-"}
                              </span>
                              <span className="text-xs text-slate-500 mt-0.5">
                                Plan: {u.installment || "N/A"}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-6">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-md border text-xs font-medium ${getStatusColor(
                                u.unitStatus,
                              )}`}
                            >
                              {u.unitStatus || "Unknown"}
                            </span>
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
