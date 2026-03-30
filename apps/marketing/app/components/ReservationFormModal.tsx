"use client";

// ─────────────────────────────────────────────────────────────────────────────
// apps/marketing/components/ReservationFormModal.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { X, Loader2, CheckCircle2, Copy, Check } from "lucide-react";
import type { Unit } from "../lib/floorData";

interface Props {
  unit: Unit;
  onClose: () => void;
  onSuccess: () => void; // FIXED: Added onSuccess to the TypeScript interface
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  contact: string;
}

interface ReservationResult {
  token: string;
  expiresAt: string;
  unit: { roomNo?: string; unitType?: string; floor?: number };
}

const FONT_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Lato:wght@300;400;700&display=swap');
`;

export default function ReservationFormModal({
  unit,
  onClose,
  onSuccess,
}: Props) {
  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    contact: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [result, setResult] = useState<ReservationResult | null>(null);
  const [copied, setCopied] = useState(false);

  const validate = (): boolean => {
    const e: Partial<FormData> = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";
    if (!form.email.trim()) {
      e.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Please enter a valid email";
    }
    if (!form.contact.trim()) e.contact = "Contact number is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setApiError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reservations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            unitId: Number(unit.id),
            customerEmail: form.email,
            customerFirstName: form.firstName,
            customerLastName: form.lastName,
            customerContact: form.contact,
          }),
        },
      );

      const data = await res.json();
      if (!res.ok) {
        setApiError(data.message ?? "Something went wrong. Please try again.");
        return;
      }

      setResult(data);
    } catch {
      setApiError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyToken = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatExpiry = (iso: string) => {
    return new Date(iso).toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const inputClass = (field: keyof FormData) =>
    `w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all ${
      errors[field]
        ? "border-red-300 bg-red-50"
        : "border-[#E8E4DA] bg-[#FAF9F7] focus:border-[#B8975A] focus:bg-white"
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,8,4,0.7)", backdropFilter: "blur(6px)" }}
      onClick={!result ? onClose : undefined}
    >
      <style>{FONT_STYLE}</style>

      <div
        className="relative w-full max-w-md shadow-2xl overflow-hidden"
        style={{
          background: "#FDFBF8",
          borderRadius: "16px",
          borderTop: "4px solid #B8975A",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button (only if not successful yet) */}
        {!result && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#F0EDE6] transition-colors z-10"
            style={{ color: "#9A9090" }}
          >
            <X size={18} />
          </button>
        )}

        {/* ── SUCCESS STATE ── */}
        {result ? (
          <div className="p-8 text-center">
            <CheckCircle2
              size={52}
              className="mx-auto mb-5"
              style={{ color: "#B8975A" }}
              strokeWidth={1.5}
            />
            <p
              className="text-[10px] tracking-[0.35em] uppercase mb-2"
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                color: "#B8975A",
              }}
            >
              Request Received
            </p>
            <h2
              className="text-3xl font-light text-slate-900 mb-1"
              style={{ fontFamily: "'Cormorant Garamond',serif" }}
            >
              {unit.roomNumber ? `Room ${unit.roomNumber}` : unit.type}
            </h2>
            <p
              className="text-base text-slate-500 font-light mb-6"
              style={{ fontFamily: "'Cormorant Garamond',serif" }}
            >
              is now on hold for you
            </p>

            {/* Token */}
            <div
              className="rounded-xl p-4 mb-4 text-left"
              style={{ background: "#FAF9F7", border: "1px solid #E8E4DA" }}
            >
              <p
                className="text-[10px] tracking-[0.25em] uppercase mb-2"
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  color: "#B8975A",
                }}
              >
                Your Reservation Reference
              </p>
              <div className="flex items-center gap-2">
                <p className="flex-1 text-xs font-mono font-bold text-slate-800 break-all leading-relaxed">
                  {result.token}
                </p>
                <button
                  onClick={copyToken}
                  className="shrink-0 p-2 rounded-lg transition-colors"
                  style={{
                    background: copied ? "#B8975A" : "#F0EDE6",
                    color: copied ? "#fff" : "#B8975A",
                  }}
                  title="Copy to clipboard"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
              <p
                className="text-[11px] text-slate-400 mt-2"
                style={{ fontFamily: "Lato,sans-serif" }}
              >
                Save this — you will need it to upload your payment proof.
              </p>
            </div>

            {/* Deadline */}
            <div
              className="rounded-xl p-3 mb-6 text-sm text-left"
              style={{
                background: "#FFF8EC",
                border: "1px solid #F0D99A",
                color: "#8B6914",
              }}
            >
              <p
                className="font-semibold mb-0.5"
                style={{ fontFamily: "Lato,sans-serif" }}
              >
                ⏰ Payment Deadline
              </p>
              <p
                className="text-xs leading-relaxed"
                style={{ fontFamily: "Lato,sans-serif" }}
              >
                {formatExpiry(result.expiresAt)} (PH Time)
              </p>
            </div>

            <p
              className="text-xs text-slate-400 mb-5 leading-relaxed text-left"
              style={{ fontFamily: "Lato,sans-serif" }}
            >
              A confirmation email with full payment instructions has been sent
              to <strong className="text-slate-600">{form.email}</strong>.
              Please check your inbox (and spam folder).
            </p>

            <a
              href="/status"
              className="block w-full py-3.5 text-center rounded-xl text-white text-xs font-bold tracking-[0.25em] uppercase transition-opacity hover:opacity-90 mb-3"
              style={{
                background: "#B8975A",
                fontFamily: "'Cormorant Garamond',serif",
              }}
            >
              Go to Status Page
            </a>
            <button
              onClick={onSuccess} // FIXED: Now triggers onSuccess from props
              className="block w-full py-3 text-center rounded-xl text-xs font-medium transition-colors"
              style={{
                color: "#9A9090",
                background: "#F0EDE6",
                fontFamily: "Lato,sans-serif",
              }}
            >
              Return to Floor Plan
            </button>
          </div>
        ) : (
          /* ── FORM STATE ── */
          <div className="p-8">
            {/* Header */}
            <p
              className="text-[10px] tracking-[0.3em] uppercase mb-1"
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                color: "#B8975A",
              }}
            >
              Secure Your Unit
            </p>
            <h2
              className="text-2xl font-light text-slate-900 mb-1"
              style={{ fontFamily: "'Cormorant Garamond',serif" }}
            >
              {unit.roomNumber ? `Room ${unit.roomNumber}` : unit.type}{" "}
              {unit.floor ? `· Floor ${unit.floor}` : ""}
            </h2>
            <p
              className="text-xs text-slate-400 mb-6"
              style={{ fontFamily: "Lato,sans-serif" }}
            >
              Enter your details to hold this unit for 48 hours.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs text-slate-500 mb-1.5"
                    style={{ fontFamily: "Lato,sans-serif" }}
                  >
                    First Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) =>
                      setForm({ ...form, firstName: e.target.value })
                    }
                    className={inputClass("firstName")}
                    style={{ fontFamily: "Lato,sans-serif" }}
                    placeholder="Juan"
                  />
                  {errors.firstName && (
                    <p
                      className="text-xs text-rose-500 mt-1"
                      style={{ fontFamily: "Lato,sans-serif" }}
                    >
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    className="block text-xs text-slate-500 mb-1.5"
                    style={{ fontFamily: "Lato,sans-serif" }}
                  >
                    Last Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) =>
                      setForm({ ...form, lastName: e.target.value })
                    }
                    className={inputClass("lastName")}
                    style={{ fontFamily: "Lato,sans-serif" }}
                    placeholder="dela Cruz"
                  />
                  {errors.lastName && (
                    <p
                      className="text-xs text-rose-500 mt-1"
                      style={{ fontFamily: "Lato,sans-serif" }}
                    >
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  className="block text-xs text-slate-500 mb-1.5"
                  style={{ fontFamily: "Lato,sans-serif" }}
                >
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputClass("email")}
                  style={{ fontFamily: "Lato,sans-serif" }}
                  placeholder="juan@gmail.com"
                />
                {errors.email && (
                  <p
                    className="text-xs text-rose-500 mt-1"
                    style={{ fontFamily: "Lato,sans-serif" }}
                  >
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="block text-xs text-slate-500 mb-1.5"
                  style={{ fontFamily: "Lato,sans-serif" }}
                >
                  Contact Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  value={form.contact}
                  onChange={(e) =>
                    setForm({ ...form, contact: e.target.value })
                  }
                  className={inputClass("contact")}
                  style={{ fontFamily: "Lato,sans-serif" }}
                  placeholder="09XX XXX XXXX"
                />
                {errors.contact && (
                  <p
                    className="text-xs text-rose-500 mt-1"
                    style={{ fontFamily: "Lato,sans-serif" }}
                  >
                    {errors.contact}
                  </p>
                )}
              </div>

              {/* Disclaimer */}
              <div
                className="mt-5 rounded-xl p-4 text-xs leading-relaxed"
                style={{
                  background: "#FAF9F7",
                  border: "1px solid #E8E4DA",
                  color: "#9A9090",
                  fontFamily: "Lato,sans-serif",
                }}
              >
                By submitting, you agree to hold this unit for{" "}
                <strong className="text-slate-600">48 hours</strong>. A{" "}
                <strong className="text-slate-600">₱30,000</strong> reservation
                fee is required within this window. Instructions will be sent to
                your email.
              </div>

              {/* API Error */}
              {apiError && (
                <div
                  className="mt-4 rounded-xl p-3 text-xs"
                  style={{
                    background: "#FEF2F2",
                    border: "1px solid #FECACA",
                    color: "#DC2626",
                    fontFamily: "Lato,sans-serif",
                  }}
                >
                  {apiError}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="mt-5 w-full py-3.5 rounded-xl text-white text-xs font-bold tracking-[0.25em] uppercase transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{
                  background: "#1A140A",
                  fontFamily: "'Cormorant Garamond',serif",
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Secure This Unit"
                )}
              </button>

              <p
                className="text-center text-[11px] text-slate-400 mt-3"
                style={{ fontFamily: "Lato,sans-serif" }}
              >
                No payment is charged at this step.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
