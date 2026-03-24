// ─────────────────────────────────────────────────────────────────────────────
// KpiCard.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { Loader2, type LucideIcon } from "lucide-react";

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  sub?: string;
  /** Tailwind classes for the icon wrapper, e.g. "bg-blue-50 text-blue-600" */
  accentClasses: string;
  isLoading: boolean;
}

export function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  accentClasses,
  isLoading,
}: KpiCardProps) {
  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      {/* Subtle decorative corner gradient */}
      <div className="pointer-events-none absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-[0.06] bg-current" />

      {/* Icon */}
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accentClasses}`}
      >
        <Icon size={20} strokeWidth={1.8} />
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 truncate">
          {label}
        </p>
        <div className="h-9 flex items-center">
          {isLoading ? (
            <Loader2 size={20} className="animate-spin text-slate-200" />
          ) : (
            <span className="text-[2rem] font-bold text-slate-900 tabular-nums leading-none tracking-tight">
              {value}
            </span>
          )}
        </div>
        {sub && !isLoading && (
          <p className="text-xs text-slate-400 mt-1.5 truncate">{sub}</p>
        )}
      </div>
    </div>
  );
}
