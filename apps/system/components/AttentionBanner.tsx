// ─────────────────────────────────────────────────────────────────────────────
// AttentionBanner.tsx
// Renders a row of attention items derived from deriveAttentionItems().
// ─────────────────────────────────────────────────────────────────────────────

import { AlertTriangle, Info, Zap } from "lucide-react";
import type { AttentionItem, AlertSeverity } from "../lib/dashboard.types";

const SEVERITY_STYLES: Record<
  AlertSeverity,
  { bg: string; text: string; border: string; Icon: typeof Info }
> = {
  urgent: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-100",
    Icon: Zap,
  },
  warning: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-100",
    Icon: AlertTriangle,
  },
  info: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-100",
    Icon: Info,
  },
};

interface AttentionBannerProps {
  items: AttentionItem[];
}

export function AttentionBanner({ items }: AttentionBannerProps) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-5">
      {items.map((item) => {
        const styles = SEVERITY_STYLES[item.severity];
        const { Icon } = styles;

        return (
          <a
            key={item.id}
            href={item.href}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-medium flex-1 border transition-opacity hover:opacity-80 ${styles.bg} ${styles.text} ${styles.border}`}
          >
            <Icon size={13} className="shrink-0" strokeWidth={2} />
            <span className="leading-snug">{item.message}</span>
          </a>
        );
      })}
    </div>
  );
}
