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
      <div className="bg-white p-4 rounded border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-4">
          Performance Analytics
        </h3>
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-4">
          Performance Analytics
        </h3>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  const maxClients = Math.max(...brokers.map((b) => b.clientCount), 1);

  return (
    <div className="bg-white p-4 rounded border border-slate-200">
      <h3 className="font-semibold text-slate-900 mb-4">
        Performance Analytics - Top 5 Brokers
      </h3>

      {brokers.length === 0 ? (
        <p className="text-slate-500 text-sm">No broker data available</p>
      ) : (
        <div className="space-y-3">
          {brokers.map((broker) => {
            const percentage = (broker.clientCount / maxClients) * 100;
            return (
              <div key={broker.id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-slate-900 truncate">
                    {broker.name}
                  </span>
                  <span className="text-sm font-semibold text-blue-600 ml-2">
                    {broker.clientCount}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded h-2">
                  <div
                    className="bg-blue-600 h-2 rounded transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
