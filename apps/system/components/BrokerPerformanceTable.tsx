"use client";

import { useEffect, useState } from "react";

interface BrokerData {
  id: number;
  firstName: string;
  lastName: string;
  clientCount: number;
}

export default function BrokerPerformanceTable() {
  const [brokers, setBrokers] = useState<BrokerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrokers = async () => {
      try {
        // Ensure we have a token to call protected API
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
              firstName: broker.firstName || "",
              lastName: broker.lastName || "",
              clientCount: broker.clients?.length || 0,
            }),
          )
          .sort(
            (a: BrokerData, b: BrokerData) => b.clientCount - a.clientCount,
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

  if (loading) {
    return (
      <div className="bg-white p-4 rounded border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-4">
          Broker&apos;s Total Clients
        </h3>
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-4">
          Broker&apos;s Total Clients
        </h3>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded border border-slate-200">
      <h3 className="font-semibold text-slate-900 mb-4">
        Broker&apos;s Total Clients
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 px-2 font-semibold text-slate-700">
                Full Name
              </th>
              <th className="text-right py-2 px-2 font-semibold text-slate-700">
                Total Clients
              </th>
            </tr>
          </thead>
          <tbody>
            {brokers.length === 0 ? (
              <tr>
                <td
                  colSpan={2}
                  className="py-4 px-2 text-center text-slate-500"
                >
                  No brokers available
                </td>
              </tr>
            ) : (
              brokers.map((broker) => (
                <tr
                  key={broker.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <td className="py-2 px-2 text-slate-900">
                    {broker.firstName} {broker.lastName}
                  </td>
                  <td className="py-2 px-2 text-right text-slate-900 font-medium">
                    {broker.clientCount}
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
