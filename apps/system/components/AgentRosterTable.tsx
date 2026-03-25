// ─────────────────────────────────────────────────────────────────────────────
// components/AgentRosterTable.tsx
//
// Full agent table for the Statistics page.
// Both managers see ALL agents here — this is not filtered per manager.
// Shows: name, position, contact, email, license status.
// No client data — agents and clients are separate concerns.
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { BadgeCheck, Users, Phone, Mail } from "lucide-react";
import type { AgentStatRow } from "../lib/useStatisticsData";

const AVATAR_COLORS = [
  "from-sky-100 to-sky-200 text-sky-700",
  "from-violet-100 to-violet-200 text-violet-700",
  "from-emerald-100 to-emerald-200 text-emerald-700",
  "from-amber-100 to-amber-200 text-amber-700",
  "from-rose-100 to-rose-200 text-rose-700",
  "from-teal-100 to-teal-200 text-teal-700",
];

function avatarColor(id: number): string {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (!parts[0]) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface AgentRosterTableProps {
  agents: AgentStatRow[];
}

export function AgentRosterTable({ agents }: AgentRosterTableProps) {
  if (agents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-slate-300 gap-2">
        <Users size={28} />
        <p className="text-sm">No agents on record</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full min-w-[520px]">
        <thead>
          <tr className="border-b border-slate-100">
            {["Agent", "Position", "Contact", "License"].map((col) => (
              <th
                key={col}
                className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider pb-3 pr-4 last:pr-0"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {agents.map((agent) => (
            <tr
              key={agent.id}
              className="hover:bg-slate-50/60 transition-colors"
            >
              {/* Name */}
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-[11px] font-bold shrink-0 ${avatarColor(agent.id)}`}
                  >
                    {initials(agent.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 leading-tight truncate max-w-[140px]">
                      {agent.name}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Mail size={10} className="text-slate-300 shrink-0" />
                      <p className="text-[11px] text-slate-400 truncate max-w-[130px]">
                        {agent.email}
                      </p>
                    </div>
                  </div>
                </div>
              </td>

              {/* Position */}
              <td className="py-3 pr-4">
                <span className="text-xs text-slate-600">{agent.position}</span>
              </td>

              {/* Contact */}
              <td className="py-3 pr-4">
                <div className="flex items-center gap-1.5">
                  <Phone size={11} className="text-slate-300 shrink-0" />
                  <span className="text-xs text-slate-600 tabular-nums">
                    {agent.contact}
                  </span>
                </div>
              </td>

              {/* License */}
              <td className="py-3">
                {agent.hasLicense ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5">
                    <BadgeCheck size={11} />
                    Licensed
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
