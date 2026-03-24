// ─────────────────────────────────────────────────────────────────────────────
// SectionCard.tsx
// Shared card shell + section header used by every dashboard widget.
// ─────────────────────────────────────────────────────────────────────────────

import { ChevronRight, Loader2 } from "lucide-react";

// ─── SectionHeader ────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
  sub?: string;
  href?: string;
  linkLabel?: string;
}

export function SectionHeader({
  title,
  sub,
  href,
  linkLabel = "View all",
}: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h2 className="text-sm font-semibold text-slate-800 leading-tight">
          {title}
        </h2>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      {href && (
        <a
          href={href}
          className="flex items-center gap-0.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors shrink-0 ml-4"
        >
          {linkLabel}
          <ChevronRight size={13} />
        </a>
      )}
    </div>
  );
}

// ─── SectionCard ──────────────────────────────────────────────────────────────

interface SectionCardProps {
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  loadingHeight?: string;
}

export function SectionCard({
  children,
  className = "",
  isLoading = false,
  loadingHeight = "h-48",
}: SectionCardProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5 ${className}`}
    >
      {isLoading ? (
        <div className={`flex items-center justify-center ${loadingHeight}`}>
          <Loader2 size={22} className="animate-spin text-slate-200" />
        </div>
      ) : (
        children
      )}
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon: React.ReactNode;
  message: string;
  height?: string;
}

export function EmptyState({
  icon,
  message,
  height = "h-36",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 ${height} text-slate-300`}
    >
      <div className="text-slate-200">{icon}</div>
      <p className="text-sm text-slate-300">{message}</p>
    </div>
  );
}
