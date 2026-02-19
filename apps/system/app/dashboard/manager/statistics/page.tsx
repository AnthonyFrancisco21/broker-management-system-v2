"use client";
import { useEffect, useState } from "react";
import RoleGuard from "../../../../components/RoleGuard";
import DashboardLayout from "../../../../components/DashboardLayout";
import OccupancyPieChart from "../../../../components/OccupancyPieChart";
import OccupiedUnitsBarChart from "../../../../components/OccupiedUnitsBarChart";
import SalesGrowthLineChart from "../../../../components/SalesGrowthLineChart";

export default function StatisticsPage() {
  const managerNavItems = [
    { label: "Dashboard", href: "/dashboard/manager" },
    { label: "Brokers/Agent List", href: "/dashboard/manager/brokers" },
    { label: "Statistics", href: "/dashboard/manager/statistics" },
    { label: "Unit Management", href: "/dashboard/manager/units" },
  ];

  const [occupied, setOccupied] = useState(0);
  const [available, setAvailable] = useState(0);
  const [floorData, setFloorData] = useState<
    { floor: number; occupied: number }[]
  >([
    { floor: 1, occupied: 0 },
    { floor: 2, occupied: 0 },
    { floor: 3, occupied: 0 },
    { floor: 4, occupied: 0 },
  ]);
  const [salesData, setSalesData] = useState<
    { month: string; sales: number }[]
  >([
    { month: "Jan", sales: 0 },
    { month: "Feb", sales: 0 },
    { month: "Mar", sales: 0 },
    { month: "Apr", sales: 0 },
    { month: "May", sales: 0 },
    { month: "Jun", sales: 0 },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
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

        const units = await res.json();

        // Calculate occupancy
        const occupiedCount = units.filter(
          (u: { unitStatus: string }) => u.unitStatus === "occupied",
        ).length;
        const availableCount = units.filter(
          (u: { unitStatus: string }) => u.unitStatus === "available",
        ).length;

        setOccupied(occupiedCount);
        setAvailable(availableCount);

        // Calculate by floor
        const floorMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
        units.forEach((u: { floor?: number; unitStatus: string }) => {
          if (
            u.unitStatus === "occupied" &&
            u.floor &&
            floorMap.hasOwnProperty(u.floor)
          ) {
            floorMap[u.floor]++;
          }
        });
        setFloorData([
          { floor: 1, occupied: floorMap[1] },
          { floor: 2, occupied: floorMap[2] },
          { floor: 3, occupied: floorMap[3] },
          { floor: 4, occupied: floorMap[4] },
        ]);

        // Mock monthly sales (in production, fetch from real data)
        setSalesData([
          {
            month: "Jan",
            sales: Math.floor(Math.random() * occupiedCount) + 2,
          },
          {
            month: "Feb",
            sales: Math.floor(Math.random() * occupiedCount) + 3,
          },
          {
            month: "Mar",
            sales: Math.floor(Math.random() * occupiedCount) + 4,
          },
          {
            month: "Apr",
            sales: Math.floor(Math.random() * occupiedCount) + 5,
          },
          {
            month: "May",
            sales: Math.floor(Math.random() * occupiedCount) + 3,
          },
          { month: "Jun", sales: occupiedCount },
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <RoleGuard allowedRoles={["ADMIN", "MANAGER"]}>
      <DashboardLayout navItems={managerNavItems} roleTitle="Manager Dashboard">
        <div>
          <h1 className="text-2xl font-bold mb-4">Statistics</h1>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-2">
                Occupancy Rate
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {occupied + available > 0
                  ? Math.round((occupied / (occupied + available)) * 100)
                  : 0}
                %
              </p>
            </div>
            <div className="bg-white p-4 rounded border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-2">
                Vacancy Rate
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {occupied + available > 0
                  ? Math.round((available / (occupied + available)) * 100)
                  : 0}
                %
              </p>
            </div>
            <div className="bg-white p-4 rounded border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-2">Total Units</h3>
              <p className="text-3xl font-bold text-purple-600">
                {occupied + available}
              </p>
            </div>
          </div>

          {/* Charts */}
          {loading ? (
            <p className="text-slate-500">Loading statistics...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <OccupancyPieChart
                occupied={occupied}
                available={available}
                title="Occupancy Status"
              />
              <OccupiedUnitsBarChart
                data={floorData}
                title="Occupied Units Per Floor"
              />
              <div className="lg:col-span-2">
                <SalesGrowthLineChart
                  data={salesData}
                  title="Sales Growth (Monthly)"
                />
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
