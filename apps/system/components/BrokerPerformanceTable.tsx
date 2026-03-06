"use client";

import { useEffect, useState } from "react";
import { Users, Target, CheckCircle2 } from "lucide-react";

interface BrokerData {
  id: number;
  name: string;
  totalClients: number;
  leads: number; // prospect, viewing
  active: number; // reserved, underNego
  closed: number; // success
}

export default function BrokerPerformanceTable() {
  const [brokers, setBrokers] = useState<BrokerData[]>([]);
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

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/brokers`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) throw new Error("Failed to fetch brokers");

        const data = await response.json();

        const brokerData = data
          .map((broker: any) => {
            const clients = broker.clients || [];

            let leads = 0;
            let active = 0;
            let closed = 0;

            clients.forEach((c: any) => {
              const status = c.clientStatus?.toLowerCase();
              if (status === "success") closed++;
              else if (status === "reserved" || status === "undernego")
                active++;
              else if (status === "prospect" || status === "viewing") leads++;
            });

            return {
              id: broker.id,
              name:
                `${broker.firstName || ""} ${broker.lastName || ""}`.trim() ||
                "Unknown",
              totalClients: clients.length,
              leads,
              active,
              closed,
            };
          })
          .sort(
            (a: BrokerData, b: BrokerData) => b.totalClients - a.totalClients,
          );

        setBrokers(brokerData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchBrokers();
  }, []);

  if (loading || error) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center min-h-[350px]">
        {loading ? (
          <>
            <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-3" />
            <p className="text-sm font-medium text-slate-500">
              Loading pipeline data...
            </p>
          </>
        ) : (
          <p className="text-red-500 text-sm font-medium">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-800">
          Team Pipeline Overview
        </h2>
        <p className="text-xs text-slate-500">
          Breakdown of each agent's current client funnel.
        </p>
      </div>

      <div className="flex-1 overflow-x-auto custom-scrollbar">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-slate-50/80 sticky top-0 z-10">
            <tr className="text-slate-500 border-b border-slate-200 text-xs uppercase tracking-wider">
              <th className="py-3 px-4 font-semibold rounded-tl-lg">
                Agent Name
              </th>
              <th className="py-3 px-4 font-semibold text-center">
                <div className="flex items-center justify-center gap-1">
                  <Users size={14} /> Total
                </div>
              </th>
              <th className="py-3 px-4 font-semibold text-center text-slate-400">
                Leads
              </th>
              <th className="py-3 px-4 font-semibold text-center text-amber-600">
                <div className="flex items-center justify-center gap-1">
                  <Target size={14} /> Active
                </div>
              </th>
              <th className="py-3 px-4 font-semibold text-center text-emerald-600 rounded-tr-lg">
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle2 size={14} /> Closed
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {brokers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  No team pipeline data available
                </td>
              </tr>
            ) : (
              brokers.map((broker) => (
                <tr
                  key={broker.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {broker.name}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-slate-100 text-slate-700 py-1 px-2.5 rounded-full font-semibold text-xs">
                      {broker.totalClients}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-500 font-medium">
                    {broker.leads}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {broker.active > 0 ? (
                      <span className="text-amber-600 font-bold">
                        {broker.active}
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {broker.closed > 0 ? (
                      <span className="text-emerald-600 font-bold">
                        {broker.closed}
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
