"use client";
import RoleGuard from "../../../components/RoleGuard";
import DashboardLayout from "../../../components/DashboardLayout";
import {
  Users,
  Briefcase,
  TrendingUp,
  Building,
  ArrowRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Mock Data for the Pipeline Graph
const pipelineData = [
  { stage: "Prospect", count: 12 },
  { stage: "Viewing", count: 8 },
  { stage: "Under Nego", count: 5 },
  { stage: "Reserved", count: 3 },
  { stage: "Success", count: 15 },
];

// Mock Data for Recently Added Clients
const recentClients = [
  {
    id: 1,
    name: "Alice Johnson",
    unit: "Studio - A101",
    status: "viewing",
    date: "2 hrs ago",
  },
  {
    id: 2,
    name: "Michael Smith",
    unit: "1BR - B205",
    status: "reserved",
    date: "5 hrs ago",
  },
  {
    id: 3,
    name: "Samantha Lee",
    unit: "2BR - C301",
    status: "underNego",
    date: "1 day ago",
  },
  {
    id: 4,
    name: "David Chen",
    unit: "Studio - A105",
    status: "prospect",
    date: "1 day ago",
  },
  {
    id: 5,
    name: "Maria Garcia",
    unit: "3BR - Penthouse",
    status: "success",
    date: "2 days ago",
  },
];

export default function BrokerDashboard() {
  const brokerNavItems = [
    { label: "Dashboard", href: "/dashboard/broker" },
    { label: "Client Management", href: "/dashboard/broker/clients" },
    { label: "Unit Management", href: "/dashboard/broker/units" },
  ];

  // Helper for status badges
  const getStatusColor = (status: string) => {
    switch (status) {
      case "prospect":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "viewing":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "underNego":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "reserved":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "success":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <RoleGuard allowedRoles={["AGENT", "BROKER", "MANAGER", "ADMIN"]}>
      <DashboardLayout navItems={brokerNavItems} roleTitle="Broker Dashboard">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              Broker Dashboard
            </h1>
            <p className="text-sm text-slate-500">
              Welcome back! Here is an overview of your active clients and
              units.
            </p>
          </div>

          {/* 1. Stat Cards (4 in a row on large screens) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-50 text-blue-600 shrink-0">
                <Users size={24} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500">
                  Total Clients
                </h3>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">43</p>
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
                <p className="text-2xl font-bold text-slate-900 mt-0.5">8</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600 shrink-0">
                <TrendingUp size={24} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500">
                  Success Rate
                </h3>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">34%</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-50 text-purple-600 shrink-0">
                <Building size={24} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500">
                  Available Units
                </h3>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">12</p>
              </div>
            </div>
          </div>

          {/* 2. Charts and Lists Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Client Pipeline Graph (Takes up 2 columns) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-800">
                  Client Pipeline
                </h2>
                <p className="text-xs text-slate-500">
                  Number of clients at each stage of the buying process
                </p>
              </div>

              <div className="flex-1 w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={pipelineData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e2e8f0"
                    />
                    <XAxis
                      dataKey="stage"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                    />
                    <Tooltip
                      cursor={{ fill: "#f8fafc" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recently Added Clients List (Takes up 1 column) */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Recent Clients
                  </h2>
                  <p className="text-xs text-slate-500">
                    Latest added to your roster
                  </p>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                  View All <ArrowRight size={14} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="divide-y divide-slate-100">
                  {recentClients.map((client) => (
                    <div
                      key={client.id}
                      className="py-3.5 flex items-center justify-between group"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer">
                          {client.name}
                        </span>
                        <span className="text-xs text-slate-500 mt-0.5">
                          {client.unit}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded border font-medium uppercase tracking-wider ${getStatusColor(client.status)}`}
                        >
                          {client.status}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {client.date}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
