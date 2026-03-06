"use client";

import { ClientRow } from "../app/dashboard/broker/clients/page";
import { User, Mail, Calendar, Home, CheckCircle } from "lucide-react";

interface ClientDetailsViewProps {
  client: ClientRow;
}

export default function ClientDetailsView({ client }: ClientDetailsViewProps) {
  if (!client) return null;

  return (
    <div className="flex flex-col gap-5 p-2">
      <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
        <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
          <User size={28} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800">
            {client.firstName} {client.lastName}
          </h3>
          <p className="text-sm text-slate-500 font-mono">
            ID: {String(client.id).padStart(4, "0")}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 text-slate-700">
          <Mail size={18} className="text-slate-400" />
          <span>{client.email || "No email provided"}</span>
        </div>

        <div className="flex items-center gap-3 text-slate-700">
          <CheckCircle size={18} className="text-slate-400" />
          <span className="capitalize">
            Status:{" "}
            <strong className="font-semibold">{client.clientStatus}</strong>
          </span>
        </div>

        {client.unitId ? (
          <div className="flex items-start gap-3 text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2">
            <Home size={18} className="text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium text-slate-900">
                Assigned Unit: Room {client.unit?.roomNo}
              </p>
              <p className="text-sm text-slate-500">{client.unit?.unitType}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-slate-500 italic">
            <Home size={18} className="text-slate-300" />
            <span>No unit currently assigned.</span>
          </div>
        )}

        {client.createdAt && (
          <div className="flex items-center gap-3 text-slate-500 text-sm mt-4 pt-4 border-t border-slate-100">
            <Calendar size={16} />
            <span>
              Added on {new Date(client.createdAt).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
