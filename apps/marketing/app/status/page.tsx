"use client";

// ─────────────────────────────────────────────────────────────────────────────
// apps/marketing/app/status/page.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import {
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  Upload,
  AlertTriangle,
  ArrowLeft,
  FileText,
  TimerOff,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ReservationStatus =
  | "pending"
  | "paymentSubmitted"
  | "confirmed"
  | "expired"
  | "cancelled";

interface ReservationData {
  token: string;
  status: ReservationStatus;
  customerFirstName?: string | null;
  customerLastName?: string | null;
  customerEmail: string;
  reservedAt: string;
  expiresAt: string;
  paymentSubmittedAt?: string | null;
  unit?: {
    roomNo?: string | null;
    unitType?: string | null;
    floor?: number | null;
    price?: string | number | null;
    size?: string | null;
  } | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPeso(value: string | number | null | undefined): string {
  if (!value) return "—";
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Countdown ────────────────────────────────────────────────────────────────

function useCountdown(expiresAt: string | null) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      setRemaining(Math.max(0, new Date(expiresAt).getTime() - Date.now()));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const hours = Math.floor(remaining / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1_000);
  return { hours, minutes, seconds, isExpired: remaining === 0 };
}

function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const { hours, minutes, seconds, isExpired } = useCountdown(expiresAt);
  const pad = (n: number) => String(n).padStart(2, "0");
  const urgent = !isExpired && hours === 0 && minutes < 30;

  if (isExpired) {
    return (
      <div
        className="flex items-center gap-2 justify-center px-4 py-3 rounded-xl text-sm font-medium"
        style={{
          background: "#FEF2F2",
          color: "#DC2626",
          border: "1px solid #FECACA",
        }}
      >
        <TimerOff size={16} />
        Payment window has closed
      </div>
    );
  }

  return (
    <div
      className="rounded-xl px-4 py-4 text-center"
      style={{
        background: urgent ? "#FFF8EC" : "#FAF9F7",
        border: `1px solid ${urgent ? "#F0D99A" : "#E8E4DA"}`,
      }}
    >
      <p
        className="text-[10px] tracking-[0.25em] uppercase mb-3"
        style={{
          fontFamily: "'Cormorant Garamond',serif",
          color: urgent ? "#8B6914" : "#B8975A",
        }}
      >
        Time Remaining to Submit Payment
      </p>
      <div className="flex items-center justify-center gap-3">
        {[
          { val: pad(hours), label: "Hours" },
          { val: pad(minutes), label: "Min" },
          { val: pad(seconds), label: "Sec" },
        ].map(({ val, label }, i) => (
          <div key={label} className="flex items-center gap-3">
            <div className="text-center">
              <p
                className="text-4xl font-bold tabular-nums leading-none"
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  color: urgent ? "#8B6914" : "#1A140A",
                }}
              >
                {val}
              </p>
              <p
                className="text-[10px] tracking-widest uppercase mt-1"
                style={{ color: "#9A9090", fontFamily: "Lato,sans-serif" }}
              >
                {label}
              </p>
            </div>
            {i < 2 && (
              <span
                className="text-2xl font-light"
                style={{ color: "#B8975A" }}
              >
                :
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ReservationStatus,
  { icon: any; label: string; color: string; bg: string }
> = {
  pending: {
    icon: Clock,
    label: "On Hold — Awaiting Payment",
    color: "#8B6914",
    bg: "#FFF8EC",
  },
  paymentSubmitted: {
    icon: FileText,
    label: "Payment Submitted — Under Review",
    color: "#1D4ED8",
    bg: "#EFF6FF",
  },
  confirmed: {
    icon: CheckCircle2,
    label: "Reservation Confirmed",
    color: "#166534",
    bg: "#F0FDF4",
  },
  expired: {
    icon: TimerOff,
    label: "Hold Expired",
    color: "#9A9090",
    bg: "#FAF9F7",
  },
  cancelled: {
    icon: XCircle,
    label: "Reservation Cancelled",
    color: "#DC2626",
    bg: "#FEF2F2",
  },
};

function StatusBadge({ status }: { status: ReservationStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <Icon size={13} strokeWidth={1.8} />
      {cfg.label}
    </span>
  );
}

// ─── Payment Upload Form ──────────────────────────────────────────────────────

function PaymentUploadForm({
  email,
  token,
  onSuccess,
}: {
  email: string;
  token: string;
  onSuccess: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select your payment proof file.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("token", token);
      formData.append("proof", file);

      // POST /api/reservations/payment
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reservations/payment`,
        { method: "POST", body: formData },
      );

      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Upload failed.");
        return;
      }

      onSuccess();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <p
        className="text-[10px] tracking-[0.25em] uppercase mb-4"
        style={{ fontFamily: "'Cormorant Garamond',serif", color: "#B8975A" }}
      >
        Upload Payment Proof
      </p>

      <div
        className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-[#B8975A] transition-colors mb-4"
        style={{
          borderColor: file ? "#B8975A" : "#D8D4CA",
          background: "#FFFFFF",
        }}
        onClick={() => fileRef.current?.click()}
      >
        {file ? (
          <div
            className="flex items-center justify-center gap-2 text-sm"
            style={{ color: "#B8975A" }}
          >
            <FileText size={18} />
            <span className="font-medium truncate max-w-[220px]">
              {file.name}
            </span>
          </div>
        ) : (
          <>
            <Upload
              size={24}
              className="mx-auto mb-2"
              style={{ color: "#D8D4CA" }}
            />
            <p
              className="text-sm text-slate-500"
              style={{ fontFamily: "Lato,sans-serif" }}
            >
              Click to select your file
            </p>
            <p
              className="text-xs text-slate-400 mt-1"
              style={{ fontFamily: "Lato,sans-serif" }}
            >
              JPG, PNG, WEBP, or PDF · Max 5 MB
            </p>
          </>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      {error && (
        <div
          className="mb-4 rounded-xl p-3 text-xs flex items-start gap-2"
          style={{
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            color: "#DC2626",
            fontFamily: "Lato,sans-serif",
          }}
        >
          <AlertTriangle size={13} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting || !file}
        className="w-full py-3.5 rounded-xl text-white text-xs font-bold tracking-[0.25em] uppercase transition-all hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
        style={{
          background: "#B8975A",
          fontFamily: "'Cormorant Garamond',serif",
        }}
      >
        {submitting ? (
          <>
            <Loader2 size={14} className="animate-spin" /> Submitting...
          </>
        ) : (
          "Submit Payment Proof"
        )}
      </button>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function StatusPage() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [looking, setLooking] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [reservation, setReservation] = useState<ReservationData | null>(null);
  const [uploadDone, setUploadDone] = useState(false);

  // Pre-fill token from URL query param: /status?ref=<token>
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) setToken(ref);
  }, []);

  const { isExpired: windowExpired } = useCountdown(
    reservation?.status === "pending" ? reservation.expiresAt : null,
  );

  const handleLookup = async () => {
    if (!email.trim() || !token.trim()) {
      setLookupError("Please enter both your email and reservation reference.");
      return;
    }
    setLooking(true);
    setLookupError(null);

    try {
      // FIXED: POST to /api/reservations/lookup with JSON body
      // (was incorrectly calling /api/public/reservations/status via GET)
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reservations/lookup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), token: token.trim() }),
        },
      );

      const data = await res.json();
      if (!res.ok) {
        setLookupError(data.message ?? "Not found. Please check your details.");
        return;
      }

      setReservation(data);
    } catch {
      setLookupError("Network error. Please try again.");
    } finally {
      setLooking(false);
    }
  };

  const unitLabel = reservation?.unit
    ? [
        reservation.unit.unitType,
        reservation.unit.roomNo ? `Room ${reservation.unit.roomNo}` : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : "Your Unit";

  return (
    <div className="min-h-screen" style={{ background: "#FAF9F7" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Lato:wght@300;400;700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) both; }
        input:focus { outline: none; }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav
        className="sticky top-0 z-30 h-16 flex items-center justify-between px-6 md:px-10 border-b"
        style={{
          background: "rgba(250,249,247,0.97)",
          backdropFilter: "blur(8px)",
          borderColor: "#E8E4DA",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-0.5 h-7 rounded-full"
            style={{ background: "#B8975A" }}
          />
          <div>
            <p
              className="text-[9px] tracking-[0.3em] uppercase leading-none mb-0.5"
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                color: "#B8975A",
              }}
            >
              Property
            </p>
            <p
              className="text-[15px] font-semibold text-slate-900 leading-tight"
              style={{ fontFamily: "'Cormorant Garamond',serif" }}
            >
              Residences at the Tower
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: "Overview", href: "#", active: false },
            { label: "Amenities", href: "#", active: false },
            { label: "Reservation", href: "/", active: false },
            { label: "Check Status", href: "/status", active: true },
          ].map(({ label, href, active }) => (
            <a
              key={label}
              href={href}
              className="text-[11px] tracking-[0.18em] uppercase pb-0.5 border-b transition-colors"
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                color: active ? "#B8975A" : "#9A9090",
                borderColor: active ? "#B8975A" : "transparent",
              }}
            >
              {label}
            </a>
          ))}
        </div>
      </nav>

      {/* ── PAGE HEADER ── */}
      <section
        className="border-b px-6 py-10 text-center"
        style={{ background: "#FFFFFF", borderColor: "#E8E4DA" }}
      >
        <p
          className="text-[10px] tracking-[0.45em] uppercase mb-3"
          style={{ fontFamily: "'Cormorant Garamond',serif", color: "#B8975A" }}
        >
          — Reservation Status —
        </p>
        <h1
          className="text-3xl md:text-4xl font-light text-slate-900 leading-tight mb-2"
          style={{ fontFamily: "'Cormorant Garamond',serif" }}
        >
          Track Your{" "}
          <em className="italic font-normal" style={{ color: "#B8975A" }}>
            Reservation
          </em>
        </h1>
        <p
          className="text-[13px] text-slate-400 max-w-sm mx-auto leading-relaxed"
          style={{ fontFamily: "Lato,sans-serif" }}
        >
          Enter your email and the reservation reference from your confirmation
          email.
        </p>
      </section>

      {/* ── CONTENT ── */}
      <div className="max-w-lg mx-auto px-4 py-10">
        {!reservation ? (
          /* ── LOOKUP FORM ── */
          <div className="fade-up">
            <div
              className="rounded-2xl p-8 shadow-sm"
              style={{ background: "#FFFFFF", border: "1px solid #E8E4DA" }}
            >
              <p
                className="text-[10px] tracking-[0.3em] uppercase mb-6"
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  color: "#B8975A",
                }}
              >
                Find Your Reservation
              </p>

              <div className="space-y-4">
                <div>
                  <label
                    className="block text-xs text-slate-500 mb-1.5"
                    style={{ fontFamily: "Lato,sans-serif" }}
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                    placeholder="The email you used to reserve"
                    className="w-full px-4 py-3 rounded-lg border border-[#E8E4DA] bg-[#FAF9F7] text-sm focus:border-[#B8975A] focus:bg-white transition-all"
                    style={{ fontFamily: "Lato,sans-serif" }}
                  />
                </div>
                <div>
                  <label
                    className="block text-xs text-slate-500 mb-1.5"
                    style={{ fontFamily: "Lato,sans-serif" }}
                  >
                    Reservation Reference
                  </label>
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                    placeholder="The long code from your confirmation email"
                    className="w-full px-4 py-3 rounded-lg border border-[#E8E4DA] bg-[#FAF9F7] text-sm font-mono focus:border-[#B8975A] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {lookupError && (
                <div
                  className="mt-4 rounded-xl p-3 text-xs flex items-start gap-2"
                  style={{
                    background: "#FEF2F2",
                    border: "1px solid #FECACA",
                    color: "#DC2626",
                    fontFamily: "Lato,sans-serif",
                  }}
                >
                  <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                  {lookupError}
                </div>
              )}

              <button
                onClick={handleLookup}
                disabled={looking}
                className="mt-6 w-full py-3.5 rounded-xl text-white text-xs font-bold tracking-[0.25em] uppercase transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{
                  background: "#1A140A",
                  fontFamily: "'Cormorant Garamond',serif",
                }}
              >
                {looking ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Searching...
                  </>
                ) : (
                  "Check My Reservation"
                )}
              </button>
            </div>

            <div className="mt-5 text-center">
              <a
                href="/"
                className="inline-flex items-center gap-1.5 text-xs transition-opacity hover:opacity-70"
                style={{ fontFamily: "Lato,sans-serif", color: "#9A9090" }}
              >
                <ArrowLeft size={13} />
                Back to Reservation Portal
              </a>
            </div>
          </div>
        ) : (
          /* ── STATUS DISPLAY ── */
          <div className="fade-up space-y-4">
            {/* Unit summary card */}
            <div
              className="rounded-2xl p-6 shadow-sm"
              style={{
                background: "#FFFFFF",
                border: "1px solid #E8E4DA",
                borderTop: "4px solid #B8975A",
              }}
            >
              <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                <div>
                  {reservation.unit?.floor && (
                    <p
                      className="text-[10px] tracking-[0.3em] uppercase mb-1"
                      style={{
                        fontFamily: "'Cormorant Garamond',serif",
                        color: "#B8975A",
                      }}
                    >
                      Floor {reservation.unit.floor}
                    </p>
                  )}
                  <h2
                    className="text-2xl font-light text-slate-900"
                    style={{ fontFamily: "'Cormorant Garamond',serif" }}
                  >
                    {unitLabel}
                  </h2>
                  {reservation.unit?.price && (
                    <p
                      className="text-sm text-slate-400 mt-0.5"
                      style={{ fontFamily: "Lato,sans-serif" }}
                    >
                      {formatPeso(reservation.unit.price)}
                      {reservation.unit.size
                        ? ` · ${reservation.unit.size}`
                        : ""}
                    </p>
                  )}
                </div>
                <StatusBadge status={reservation.status} />
              </div>

              <div
                className="rounded-xl p-4 space-y-2"
                style={{ background: "#FAF9F7", border: "1px solid #E8E4DA" }}
              >
                <div
                  className="flex items-center justify-between text-xs"
                  style={{ fontFamily: "Lato,sans-serif" }}
                >
                  <span className="text-slate-400">Reserved by</span>
                  <span className="text-slate-700 font-medium">
                    {[
                      reservation.customerFirstName,
                      reservation.customerLastName,
                    ]
                      .filter(Boolean)
                      .join(" ") || "—"}
                  </span>
                </div>
                <div
                  className="flex items-center justify-between text-xs"
                  style={{ fontFamily: "Lato,sans-serif" }}
                >
                  <span className="text-slate-400">Reserved on</span>
                  <span className="text-slate-700">
                    {formatDate(reservation.reservedAt)}
                  </span>
                </div>
                {reservation.paymentSubmittedAt && (
                  <div
                    className="flex items-center justify-between text-xs"
                    style={{ fontFamily: "Lato,sans-serif" }}
                  >
                    <span className="text-slate-400">Proof submitted</span>
                    <span className="text-slate-700">
                      {formatDate(reservation.paymentSubmittedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* PENDING */}
            {reservation.status === "pending" && (
              <div
                className="rounded-2xl p-6 shadow-sm space-y-5"
                style={{ background: "#FFFFFF", border: "1px solid #E8E4DA" }}
              >
                <CountdownTimer expiresAt={reservation.expiresAt} />
                {!windowExpired && !uploadDone ? (
                  <PaymentUploadForm
                    email={reservation.customerEmail}
                    token={reservation.token}
                    onSuccess={() => {
                      setUploadDone(true);
                      setReservation({
                        ...reservation,
                        status: "paymentSubmitted",
                      });
                    }}
                  />
                ) : windowExpired ? (
                  <div
                    className="rounded-xl p-4 text-sm leading-relaxed"
                    style={{
                      background: "#FAF9F7",
                      border: "1px solid #E8E4DA",
                      color: "#9A9090",
                      fontFamily: "Lato,sans-serif",
                    }}
                  >
                    Your payment window has passed. Your hold is still active
                    and being reviewed. Please contact us if you have already
                    sent payment.
                  </div>
                ) : null}
              </div>
            )}

            {/* PAYMENT SUBMITTED */}
            {reservation.status === "paymentSubmitted" && (
              <div
                className="rounded-2xl p-6 shadow-sm"
                style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}
              >
                <div className="flex items-start gap-3">
                  <FileText
                    size={20}
                    className="shrink-0 mt-0.5"
                    style={{ color: "#1D4ED8" }}
                  />
                  <div>
                    <p
                      className="font-semibold text-sm mb-1"
                      style={{
                        color: "#1D4ED8",
                        fontFamily: "Lato,sans-serif",
                      }}
                    >
                      Payment Proof Received
                    </p>
                    <p
                      className="text-sm leading-relaxed"
                      style={{
                        color: "#1E40AF",
                        fontFamily: "Lato,sans-serif",
                      }}
                    >
                      We have received your payment proof and are reviewing it.
                      This typically takes up to 24 hours. The unit remains on
                      hold while we verify.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* CONFIRMED */}
            {reservation.status === "confirmed" && (
              <div
                className="rounded-2xl p-6 shadow-sm text-center"
                style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}
              >
                <CheckCircle2
                  size={40}
                  className="mx-auto mb-3"
                  style={{ color: "#16A34A" }}
                  strokeWidth={1.5}
                />
                <p
                  className="font-semibold text-base mb-1"
                  style={{
                    color: "#166534",
                    fontFamily: "'Cormorant Garamond',serif",
                  }}
                >
                  Reservation Confirmed!
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#166534", fontFamily: "Lato,sans-serif" }}
                >
                  Your payment has been verified and your unit is officially
                  reserved. Our team will be in touch with the next steps.
                </p>
              </div>
            )}

            {/* EXPIRED */}
            {reservation.status === "expired" && (
              <div
                className="rounded-2xl p-6 shadow-sm"
                style={{ background: "#FAF9F7", border: "1px solid #E8E4DA" }}
              >
                <div className="flex items-start gap-3">
                  <TimerOff
                    size={20}
                    className="shrink-0 mt-0.5"
                    style={{ color: "#9A9090" }}
                  />
                  <div>
                    <p
                      className="font-semibold text-sm mb-1"
                      style={{
                        color: "#4A4A4A",
                        fontFamily: "Lato,sans-serif",
                      }}
                    >
                      Payment Window Lapsed
                    </p>
                    <p
                      className="text-sm leading-relaxed"
                      style={{
                        color: "#9A9090",
                        fontFamily: "Lato,sans-serif",
                      }}
                    >
                      The 48-hour payment window has passed. Contact us if you
                      believe this is an error or if you have already sent
                      payment.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* CANCELLED */}
            {reservation.status === "cancelled" && (
              <div
                className="rounded-2xl p-6 shadow-sm"
                style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}
              >
                <div className="flex items-start gap-3">
                  <XCircle
                    size={20}
                    className="shrink-0 mt-0.5"
                    style={{ color: "#DC2626" }}
                  />
                  <div>
                    <p
                      className="font-semibold text-sm mb-1"
                      style={{
                        color: "#DC2626",
                        fontFamily: "Lato,sans-serif",
                      }}
                    >
                      Reservation Not Confirmed
                    </p>
                    <p
                      className="text-sm leading-relaxed"
                      style={{
                        color: "#B91C1C",
                        fontFamily: "Lato,sans-serif",
                      }}
                    >
                      Unfortunately your reservation could not be confirmed. The
                      unit has been released. You are welcome to choose another
                      available unit.
                    </p>
                  </div>
                </div>
                <a
                  href="/"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium"
                  style={{ color: "#DC2626", fontFamily: "Lato,sans-serif" }}
                >
                  <ArrowLeft size={13} />
                  Browse Available Units
                </a>
              </div>
            )}

            <button
              onClick={() => {
                setReservation(null);
                setUploadDone(false);
                setEmail("");
                setToken("");
              }}
              className="w-full py-3 text-center rounded-xl text-xs font-medium transition-colors"
              style={{
                color: "#9A9090",
                background: "#F0EDE6",
                border: "none",
                fontFamily: "Lato,sans-serif",
              }}
            >
              Look up a different reservation
            </button>
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <footer
        className="border-t mt-8 px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4"
        style={{ borderColor: "#E8E4DA", background: "#FFFFFF" }}
      >
        <p
          className="text-[12px] text-slate-400 tracking-wide"
          style={{ fontFamily: "Lato,sans-serif" }}
        >
          © {new Date().getFullYear()} Residences at the Tower. All rights
          reserved.
        </p>
        <a
          href="/"
          className="text-[12px] tracking-[0.2em] uppercase transition-opacity hover:opacity-70"
          style={{ fontFamily: "'Cormorant Garamond',serif", color: "#B8975A" }}
        >
          View Available Units →
        </a>
      </footer>
    </div>
  );
}
