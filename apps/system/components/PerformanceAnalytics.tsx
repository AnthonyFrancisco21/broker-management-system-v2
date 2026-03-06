"use client";

import { useEffect, useState } from "react";
import { Trophy, Medal, Award } from "lucide-react";

interface BrokerStats {
  id: number;
  name: string;
  closedDeals: number;
  activeDeals: number;
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

        if (!response.ok) throw new Error("Failed to fetch brokers");

        const data = await response.json();

        const brokerData = data
          .map((broker: any) => {
            const clients = broker.clients || [];
            const closedDeals = clients.filter(
              (c: any) => c.clientStatus === "success",
            ).length;
            const activeDeals = clients.filter(
              (c: any) =>
                c.clientStatus === "underNego" || c.clientStatus === "reserved",
            ).length;

            return {
              id: broker.id,
              name:
                `${broker.firstName || ""} ${broker.lastName || ""}`.trim() ||
                "Unknown Agent",
              closedDeals,
              activeDeals,
            };
          })
          // Sort primary by closed deals, secondary by active deals
          .sort((a: BrokerStats, b: BrokerStats) => {
            if (b.closedDeals !== a.closedDeals)
              return b.closedDeals - a.closedDeals;
            return b.activeDeals - a.activeDeals;
          })
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

  if (loading || error) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center min-h-[350px]">
        {loading ? (
          <>
            <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-3" />
            <p className="text-sm font-medium text-slate-500">
              Loading leaderboard...
            </p>
          </>
        ) : (
          <p className="text-red-500 text-sm font-medium">{error}</p>
        )}
      </div>
    );
  }

  const maxDeals = Math.max(...brokers.map((b) => b.closedDeals), 1);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Trophy size={20} className="text-amber-500" />
          Top Closers
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Team leaderboard based on successful closed deals.
        </p>
      </div>

      {brokers.length === 0 ||
      brokers.every((b) => b.closedDeals === 0 && b.activeDeals === 0) ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
          <Award size={32} className="mb-2 opacity-50" />
          <p className="text-sm font-medium">No closed deals yet</p>
        </div>
      ) : (
        <div className="flex-1 space-y-5">
          {brokers.map((broker, index) => {
            const percentage = (broker.closedDeals / maxDeals) * 100;
            return (
              <div key={broker.id} className="group">
                <div className="flex justify-between items-end mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 w-4">
                      {index + 1}.
                    </span>
                    <span className="text-sm font-semibold text-slate-800 truncate max-w-[140px]">
                      {broker.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {broker.activeDeals > 0 && (
                      <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                        +{broker.activeDeals} active
                      </span>
                    )}
                    <span className="text-sm font-bold text-emerald-600">
                      {broker.closedDeals}{" "}
                      <span className="text-xs text-emerald-500 font-medium">
                        won
                      </span>
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-700 ease-out"
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
