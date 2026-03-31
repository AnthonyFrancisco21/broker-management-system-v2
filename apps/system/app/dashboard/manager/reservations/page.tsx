"use client";

// ─────────────────────────────────────────────────────────────────────────────
// apps/system/app/dashboard/manager/reservation/page.tsx
//
// Shows all reservations across all managers.
// Actions: View Details (with payment proof), Accept, Reject.
// Real-time countdown for pending reservations.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  TimerOff,
  FileText,
  RefreshCw,
  X,
  AlertTriangle,
  Building2,
  Loader2,
  Check,
} from "lucide-react";
import RoleGuard from "../../../../components/RoleGuard";
import DashboardLayout from "../../../../components/DashboardLayout";
import Modal from "../../../../components/Modal";
import { managerNavItems } from "../../../../lib/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

type ReservationStatus =
  | "pending"
  | "paymentSubmitted"
  | "confirmed"
  | "expired"
  | "cancelled";

interface ReservationRow {
  id: number;
  token: string;
  customerEmail: string;
  customerFirstName?: string | null;
  customerLastName?: string | null;
  customerContact?: string | null;
  status: ReservationStatus;
  reservedAt: string;
  expiresAt: string;
  paymentSubmittedAt?: string | null;
  paymentProofPath?: string | null;
  verifiedAt?: string | null;
  verificationNotes?: string | null;
  unit?: {
    id: number;
    roomNo?: string | null;
    unitType?: string | null;
    floor?: number | null;
    price?: string | number | null;
  } | null;
  client?: {
    id: number;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  } | null;
  verifiedBy?: {
    firstName?: string | null;
    lastName?: string | null;
  } | null;
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ReservationStatus,
  { label: string; textClass: string; bgClass: string; icon: any }
> = {
  pending: {
    label: "On Hold",
    textClass: "text-amber-700",
    bgClass: "bg-amber-50",
    icon: Clock,
  },
  paymentSubmitted: {
    label: "Proof Submitted",
    textClass: "text-blue-700",
    bgClass: "bg-blue-50",
    icon: FileText,
  },
  confirmed: {
    label: "Confirmed",
    textClass: "text-emerald-700",
    bgClass: "bg-emerald-50",
    icon: CheckCircle2,
  },
  expired: {
    label: "Expired",
    textClass: "text-slate-500",
    bgClass: "bg-slate-100",
    icon: TimerOff,
  },
  cancelled: {
    label: "Rejected",
    textClass: "text-rose-700",
    bgClass: "bg-rose-50",
    icon: XCircle,
  },
};

function StatusBadge({ status }: { status: ReservationStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.textClass} ${cfg.bgClass}`}
    >
      <Icon size={11} strokeWidth={2} />
      {cfg.label}
    </span>
  );
}

// ─── Countdown cell ───────────────────────────────────────────────────────────

function CountdownCell({ expiresAt }: { expiresAt: string }) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const tick = () =>
      setRemaining(Math.max(0, new Date(expiresAt).getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (remaining === 0) {
    return (
      <span className="flex items-center gap-1 text-xs text-slate-400">
        <TimerOff size={12} />
        Expired
      </span>
    );
  }

  const h = Math.floor(remaining / 3_600_000);
  const m = Math.floor((remaining % 3_600_000) / 60_000);
  const s = Math.floor((remaining % 60_000) / 1_000);
  const pad = (n: number) => String(n).padStart(2, "0");
  const urgent = h === 0 && m < 30;

  return (
    <span
      className={`font-mono text-xs font-semibold tabular-nums ${
        urgent ? "text-rose-600" : "text-amber-600"
      }`}
    >
      {pad(h)}:{pad(m)}:{pad(s)}
    </span>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPeso(value: string | number | null | undefined): string {
  if (!value) return "—";
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function customerName(r: ReservationRow): string {
  return (
    [r.customerFirstName, r.customerLastName].filter(Boolean).join(" ") ||
    "Unnamed"
  );
}

function unitLabel(r: ReservationRow): string {
  if (!r.unit) return "—";
  return (
    [r.unit.unitType, r.unit.roomNo ? `Room ${r.unit.roomNo}` : null]
      .filter(Boolean)
      .join(" · ") || `Unit #${r.unit.id}`
  );
}

function getAuthHeaders() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token) return null;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function ReservationDetailModal({
  reservation,
  onClose,
  onConfirm,
  onReject,
  actionLoading,
}: {
  reservation: ReservationRow;
  onClose: () => void;
  onConfirm: (id: number, notes: string) => void;
  onReject: (id: number, notes: string) => void;
  actionLoading: boolean;
}) {
  const [notes, setNotes] = useState("");
  const [showProof, setShowProof] = useState(false);
  const proofUrl = reservation.paymentProofPath
    ? `${process.env.NEXT_PUBLIC_API_URL}/${reservation.paymentProofPath}`
    : null;

  const isPdf = proofUrl?.toLowerCase().endsWith(".pdf");
  const canAct =
    reservation.status === "paymentSubmitted" ||
    reservation.status === "pending" ||
    reservation.status === "expired";

  return (
    <div className="space-y-5">
      {/* Unit + customer */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-xs text-slate-400 mb-0.5">Unit</p>
          <p className="text-sm font-semibold text-slate-800">
            {unitLabel(reservation)}
          </p>
          {reservation.unit?.floor && (
            <p className="text-xs text-slate-500">
              Floor {reservation.unit.floor}
            </p>
          )}
          {reservation.unit?.price && (
            <p className="text-xs text-slate-500">
              {formatPeso(reservation.unit.price)}
            </p>
          )}
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-xs text-slate-400 mb-0.5">Customer</p>
          <p className="text-sm font-semibold text-slate-800">
            {customerName(reservation)}
          </p>
          <p className="text-xs text-slate-500 break-all">
            {reservation.customerEmail}
          </p>
          {reservation.customerContact && (
            <p className="text-xs text-slate-500">
              {reservation.customerContact}
            </p>
          )}
        </div>
      </div>

      {/* Dates */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Reserved</span>
          <span className="text-slate-700">
            {formatDate(reservation.reservedAt)}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Payment deadline</span>
          <span className="text-slate-700">
            {formatDate(reservation.expiresAt)}
          </span>
        </div>
        {reservation.paymentSubmittedAt && (
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Proof submitted</span>
            <span className="text-slate-700">
              {formatDate(reservation.paymentSubmittedAt)}
            </span>
          </div>
        )}
        {reservation.verifiedAt && reservation.verifiedBy && (
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Actioned by</span>
            <span className="text-slate-700">
              {[
                reservation.verifiedBy.firstName,
                reservation.verifiedBy.lastName,
              ]
                .filter(Boolean)
                .join(" ")}{" "}
              · {formatDate(reservation.verifiedAt)}
            </span>
          </div>
        )}
        {reservation.verificationNotes && (
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Notes</span>
            <span className="text-slate-700 text-right max-w-[60%]">
              {reservation.verificationNotes}
            </span>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400">Status</span>
        <StatusBadge status={reservation.status} />
        {reservation.status === "pending" && (
          <span className="ml-auto">
            <CountdownCell expiresAt={reservation.expiresAt} />
          </span>
        )}
      </div>

      {/* Payment proof */}
      {proofUrl ? (
        <div>
          <p className="text-xs font-semibold text-slate-600 mb-2">
            Payment Proof
          </p>
          {isPdf ? (
            <a
              href={proofUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-xs text-blue-600 hover:underline"
            >
              <FileText size={14} />
              View PDF proof
            </a>
          ) : (
            <div>
              <img
                src={proofUrl}
                alt="Payment proof"
                className="w-full max-h-64 object-contain rounded-lg border border-slate-200 cursor-zoom-in"
                onClick={() => setShowProof(true)}
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Click to enlarge
              </p>
            </div>
          )}
        </div>
      ) : (
        reservation.status === "pending" && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-100 text-xs text-amber-700">
            <AlertTriangle size={13} />
            No payment proof uploaded yet.
          </div>
        )
      )}

      {/* Manager action area */}
      {canAct &&
        reservation.status !== "confirmed" &&
        reservation.status !== "cancelled" && (
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <p className="text-xs font-semibold text-slate-600">
              Manager Action
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes (reason for rejection, remarks, etc.)"
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-400 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => onConfirm(reservation.id, notes)}
                disabled={actionLoading || !reservation.paymentProofPath}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: "#16a34a" }}
                title={
                  !reservation.paymentProofPath
                    ? "Cannot confirm — no proof uploaded yet"
                    : ""
                }
              >
                {actionLoading ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Check size={13} />
                )}
                Confirm Reservation
              </button>
              <button
                onClick={() => onReject(reservation.id, notes)}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: "#dc2626" }}
              >
                {actionLoading ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <XCircle size={13} />
                )}
                Reject &amp; Release Unit
              </button>
            </div>
            {!reservation.paymentProofPath && (
              <p className="text-[10px] text-slate-400">
                ⚠ Confirm is disabled until the customer uploads payment proof.
                You can still reject to release the unit.
              </p>
            )}
          </div>
        )}

      {/* Full-screen proof lightbox */}
      {showProof && proofUrl && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80"
          onClick={() => setShowProof(false)}
        >
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            onClick={() => setShowProof(false)}
          >
            <X size={20} />
          </button>
          <img
            src={proofUrl}
            alt="Payment proof"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const STATUS_ORDER: Record<ReservationStatus, number> = {
  paymentSubmitted: 0, // needs action first
  pending: 1,
  expired: 2,
  confirmed: 3,
  cancelled: 4,
};

export default function ReservationPage() {
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReservation, setSelectedReservation] =
    useState<ReservationRow | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState<ReservationStatus | "all">("all");

  const loadReservations = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reservations`,
        { headers },
      );
      if (res.status === 401) {
        setError("Unauthorized");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch reservations");

      const data: ReservationRow[] = await res.json();
      // Sort by priority: paymentSubmitted first, then pending, etc.
      data.sort(
        (a, b) =>
          (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9) ||
          new Date(b.reservedAt).getTime() - new Date(a.reservedAt).getTime(),
      );
      setReservations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const handleConfirm = async (id: number, notes: string) => {
    const headers = getAuthHeaders();
    if (!headers) return;
    setActionLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reservations/${id}/confirm`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ notes }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        alert(data.message ?? "Failed to confirm.");
        return;
      }
      setSelectedReservation(null);
      await loadReservations();
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: number, notes: string) => {
    const headers = getAuthHeaders();
    if (!headers) return;
    if (
      !window.confirm(
        "Reject this reservation? The unit will be released back to available.",
      )
    )
      return;

    setActionLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reservations/${id}/reject`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ notes }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        alert(data.message ?? "Failed to reject.");
        return;
      }
      setSelectedReservation(null);
      await loadReservations();
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // Filter
  const filtered =
    filter === "all"
      ? reservations
      : reservations.filter((r) => r.status === filter);

  // Counts for filter tabs
  const counts = reservations.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const tabs: { key: ReservationStatus | "all"; label: string }[] = [
    { key: "all", label: "All" },
    { key: "paymentSubmitted", label: "Needs Review" },
    { key: "pending", label: "On Hold" },
    { key: "expired", label: "Expired" },
    { key: "confirmed", label: "Confirmed" },
    { key: "cancelled", label: "Rejected" },
  ];

  return (
    <RoleGuard allowedRoles={["ADMIN", "MANAGER"]}>
      <DashboardLayout navItems={managerNavItems} roleTitle="Manager Dashboard">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Reservations
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                All unit reservation requests — visible to all managers
              </p>
            </div>
            <button
              onClick={loadReservations}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-40"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* Detail Modal */}
          <Modal
            isOpen={!!selectedReservation}
            onClose={() => setSelectedReservation(null)}
            title="Reservation Details"
            maxWidth="max-w-lg"
          >
            {selectedReservation && (
              <ReservationDetailModal
                reservation={selectedReservation}
                onClose={() => setSelectedReservation(null)}
                onConfirm={handleConfirm}
                onReject={handleReject}
                actionLoading={actionLoading}
              />
            )}
          </Modal>

          {/* Filter tabs */}
          <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
            {tabs.map(({ key, label }) => {
              const count =
                key === "all" ? reservations.length : (counts[key] ?? 0);
              const isActive = filter === key;
              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {label}
                  {count > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
            {loading ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-sm font-medium">Loading reservations...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex-1 p-8 text-center">
                <p className="text-red-500 font-medium">{error}</p>
              </div>
            ) : (
              <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-280px)] w-full">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm shadow-sm">
                    <tr className="text-slate-600 border-b border-slate-200">
                      <th className="py-4 px-5 font-semibold">Customer</th>
                      <th className="py-4 px-5 font-semibold">Unit</th>
                      <th className="py-4 px-5 font-semibold">Status</th>
                      <th className="py-4 px-5 font-semibold">Reserved</th>
                      <th className="py-4 px-5 font-semibold">Countdown</th>
                      <th className="py-4 px-5 font-semibold">Proof</th>
                      <th className="py-4 px-5 font-semibold text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-12 px-5 text-center text-slate-500"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Building2 size={32} className="text-slate-300" />
                            <p className="text-sm font-medium">
                              No reservations found
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filtered.map((r) => (
                        <tr
                          key={r.id}
                          className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                          onClick={() => setSelectedReservation(r)}
                        >
                          {/* Customer */}
                          <td className="py-3 px-5">
                            <p className="font-medium text-slate-900">
                              {customerName(r)}
                            </p>
                            <p className="text-xs text-slate-400 break-all max-w-[180px] truncate">
                              {r.customerEmail}
                            </p>
                            {r.customerContact && (
                              <p className="text-xs text-slate-400">
                                {r.customerContact}
                              </p>
                            )}
                          </td>

                          {/* Unit */}
                          <td className="py-3 px-5">
                            <p className="font-medium text-slate-800">
                              {unitLabel(r)}
                            </p>
                            {r.unit?.floor && (
                              <p className="text-xs text-slate-400">
                                Floor {r.unit.floor}
                              </p>
                            )}
                            {r.unit?.price && (
                              <p className="text-xs text-slate-400">
                                {formatPeso(r.unit.price)}
                              </p>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-5">
                            <StatusBadge status={r.status} />
                          </td>

                          {/* Reserved date */}
                          <td className="py-3 px-5 text-xs text-slate-500">
                            {formatDate(r.reservedAt)}
                          </td>

                          {/* Countdown (only for pending) */}
                          <td className="py-3 px-5">
                            {r.status === "pending" ? (
                              <CountdownCell expiresAt={r.expiresAt} />
                            ) : (
                              <span className="text-xs text-slate-300">—</span>
                            )}
                          </td>

                          {/* Proof indicator */}
                          <td className="py-3 px-5">
                            {r.paymentProofPath ? (
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                <CheckCircle2 size={12} />
                                Uploaded
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">
                                None
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-5">
                            <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              {/* Quick confirm — only if proof exists */}
                              {r.status === "paymentSubmitted" && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleConfirm(r.id, "");
                                    }}
                                    disabled={actionLoading}
                                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all"
                                    title="Confirm reservation"
                                  >
                                    <Check size={16} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleReject(r.id, "");
                                    }}
                                    disabled={actionLoading}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all"
                                    title="Reject reservation"
                                  >
                                    <XCircle size={16} />
                                  </button>
                                </>
                              )}
                              {/* View details */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedReservation(r);
                                }}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                                title="View details"
                              >
                                <Eye size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
