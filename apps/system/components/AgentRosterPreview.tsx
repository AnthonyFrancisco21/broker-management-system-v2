// ─────────────────────────────────────────────────────────────────────────────
// components/AgentRosterPreview.tsx
//
// Compact agent roster for the dashboard — shows name, position, contact,
// and whether they have a license on file. Preview only (max 6 rows).
// No connection to clients — agents are a separate management concern.
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { Users, Phone, BadgeCheck, ChevronRight } from "lucide-react";
import type { Agent } from "../lib/dashboard.types";

const MAX_PREVIEW = 6;

// ─── Avatar palette ───────────────────────────────────────────────────────────

const PALETTE = [
  "from-sky-100 to-sky-200 text-sky-700",
  "from-violet-100 to-violet-200 text-violet-700",
  "from-emerald-100 to-emerald-200 text-emerald-700",
  "from-amber-100 to-amber-200 text-amber-700",
  "from-rose-100 to-rose-200 text-rose-700",
  "from-teal-100 to-teal-200 text-teal-700",
];

function avatarClass(id: number): string {
  return PALETTE[id % PALETTE.length];
}

function initials(agent: Agent): string {
  return (
    [agent.firstName[0], agent.lastName[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "?"
  );
}

function fullName(agent: Agent): string {
  return (
    [agent.firstName, agent.lastName].filter(Boolean).join(" ") ||
    "Unnamed Agent"
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface AgentRosterPreviewProps {
  agents: Agent[];
}

export function AgentRosterPreview({ agents }: AgentRosterPreviewProps) {
  if (agents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 h-28 text-slate-300">
        <Users size={26} />
        <p className="text-sm">No agents on record</p>
      </div>
    );
  }

  const preview = agents.slice(0, MAX_PREVIEW);
  const overflow = agents.length - MAX_PREVIEW;

  return (
    <div className="space-y-1">
      {preview.map((agent) => (
        <div
          key={agent.id}
          className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
        >
          {/* Avatar */}
          <div
            className={`w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center text-xs font-bold shrink-0 select-none ${avatarClass(agent.id)}`}
          >
            {initials(agent)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-sm font-medium text-slate-700 leading-tight truncate">
                {fullName(agent)}
              </p>
              {agent.hasLicense && (
                <BadgeCheck
                  size={13}
                  className="text-emerald-500 shrink-0"
                  aria-label="Licensed"
                />
              )}
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {agent.position || "—"}
            </p>
          </div>

          {/* Contact */}
          {agent.primaryContact && (
            <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
              <Phone size={11} />
              <span className="tabular-nums">{agent.primaryContact}</span>
            </div>
          )}
        </div>
      ))}

      {/* Overflow indicator */}
      {overflow > 0 && (
        <a
          href="/dashboard/manager/brokers"
          className="flex items-center justify-center gap-1 py-2 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          +{overflow} more agent{overflow > 1 ? "s" : ""} — view all
          <ChevronRight size={13} />
        </a>
      )}
    </div>
  );
}
