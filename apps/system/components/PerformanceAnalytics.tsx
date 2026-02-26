"use client";

import { useEffect, useState } from "react";

interface BrokerStats {
  id: number;
  name: string;
  clientCount: number;
}

export default function PerformanceAnalytics() {
  const [brokers, setBrokers] = useState<BrokerStats[]>([]);
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

        if (response.status === 401) {
          setError("Unauthorized");
          return;
        }

        if (!response.ok) throw new Error("Failed to fetch brokers");

        const data = await response.json();

        const brokerData = data
          .map(
            (broker: {
              id: number;
              firstName?: string;
              lastName?: string;
              clients?: unknown[];
            }) => ({
              id: broker.id,
              name: `${broker.firstName} ${broker.lastName}`.trim(),
              clientCount: broker.clients?.length || 0,
            }),
          )
          .sort(
            (a: BrokerStats, b: BrokerStats) => b.clientCount - a.clientCount,
          )
          .slice(0, 5); // Top 5

        setBrokers(brokerData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchBrokers();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center min-h-[300px]">
        <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-500">
          Loading analytics...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center min-h-[300px]">
        <p className="text-red-600 font-medium text-sm">{error}</p>
      </div>
    );
  }

  const maxClients = Math.max(...brokers.map((b) => b.clientCount), 1);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
      {/* Updated Header Style */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-800">
          Top Performing Brokers
        </h2>
        <p className="text-xs text-slate-500">
          Analytics based on total client volume (Top 5)
        </p>
      </div>

      {brokers.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-500 text-sm font-medium">
            No broker data available
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="space-y-5">
            {brokers.map((broker) => {
              const percentage = (broker.clientCount / maxClients) * 100;
              return (
                <div key={broker.id} className="group">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {broker.name}
                    </span>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                      {broker.clientCount} Clients
                    </span>
                  </div>
                  {/* Updated Progress Bar Style */}
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-blue-500 h-2.5 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
