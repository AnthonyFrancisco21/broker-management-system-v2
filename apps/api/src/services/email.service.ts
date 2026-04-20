// ─────────────────────────────────────────────────────────────────────────────
// apps/api/src/services/email.service.ts
// ─────────────────────────────────────────────────────────────────────────────

import nodemailer from "nodemailer";

function createTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS?.replace(/\s/g, "");

  if (!user || !pass) {
    throw new Error(
      `SMTP credentials missing. Check SMTP_USER and SMTP_PASS in your .env file.\n` +
        `  SMTP_USER = ${user ?? "(undefined)"}\n` +
        `  SMTP_PASS = ${pass ? "(set)" : "(undefined)"}`,
    );
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
  });
}

export const verifyEmailTransporter = () => {
  try {
    const transporter = createTransporter();
    transporter.verify((error) => {
      if (error) {
        console.error("[Email] SMTP error:", error.message);
      } else {
        console.log("[Email] SMTP ready ✓");
      }
    });
  } catch (err: any) {
    console.error("[Email] Cannot create transporter:", err.message);
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPhDate(date: Date): string {
  return date.toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPeso(value: any): string {
  if (!value) return "";
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#FAF9F7;font-family:'Helvetica Neue',Arial,sans-serif;color:#333;">
<div style="max-width:580px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E8E4DA;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
  ${content}
  <div style="background:#FAF9F7;border-top:1px solid #E8E4DA;padding:18px 32px;text-align:center;">
    <p style="margin:0;font-size:11px;color:#B8B0A8;">© ${new Date().getFullYear()} August Residences. All rights reserved.</p>
  </div>
</div>
</body>
</html>`;
}

// ─── 1. Reservation Created (on hold) ────────────────────────────────────────

export const sendReservationConfirmationEmail = async (reservation: {
  token: string;
  customerEmail: string;
  customerFirstName?: string | null;
  reservedAt: Date;
  expiresAt: Date;
  unit?: {
    roomNo?: string | null;
    unitType?: string | null;
    floor?: number | null;
    price?: any;
  } | null;
}) => {
  const transporter = createTransporter();
  const marketingUrl = process.env.MARKETING_URL ?? "http://localhost:3002";
  const statusUrl = `${marketingUrl}/status`;

  const firstName = reservation.customerFirstName ?? "Valued Client";
  const unitLabel =
    [
      reservation.unit?.unitType,
      reservation.unit?.roomNo ? `Room ${reservation.unit.roomNo}` : null,
    ]
      .filter(Boolean)
      .join(" · ") || "Your Selected Unit";
  const floorLabel = reservation.unit?.floor
    ? ` on <strong>Floor ${reservation.unit.floor}</strong>`
    : "";
  const deadline = formatPhDate(reservation.expiresAt);

  const bankDetails = [
    { label: "Bank", value: process.env.BANK_NAME ?? "[Bank Name]" },
    {
      label: "Account Name",
      value: process.env.BANK_ACCOUNT_NAME ?? "[Account Name]",
    },
    {
      label: "Account No.",
      value: process.env.BANK_ACCOUNT_NUMBER ?? "[Account Number]",
    },
  ];

  const bankRows = bankDetails
    .map(
      ({ label, value }) => `
      <tr>
        <td style="padding:4px 20px 4px 0;color:#9A9090;white-space:nowrap;font-size:13px;">${label}</td>
        <td style="padding:4px 0;font-weight:600;font-size:13px;color:#1A140A;">${value}</td>
      </tr>`,
    )
    .join("");

  const info = await transporter.sendMail({
    from: `"August Residences" <${process.env.SMTP_FROM ?? process.env.SMTP_USER}>`,
    to: reservation.customerEmail,
    subject: `Unit On Hold — Ref: ${reservation.token.slice(0, 8).toUpperCase()}`,
    html: emailWrapper(`
      <div style="background:#1A140A;padding:36px 32px;text-align:center;">
        <p style="margin:0 0 8px;color:#B8975A;font-size:10px;letter-spacing:0.35em;text-transform:uppercase;">August Residences</p>
        <h1 style="margin:0;color:#FFFFFF;font-size:26px;font-weight:300;letter-spacing:0.04em;">Your Unit is On Hold</h1>
      </div>
      <div style="padding:36px 32px;">
        <p style="font-size:15px;line-height:1.7;margin:0 0 6px;">Dear <strong>${firstName}</strong>,</p>
        <p style="font-size:15px;line-height:1.7;margin:0 0 28px;color:#555;">
          Thank you for your interest. <strong>${unitLabel}</strong>${floorLabel} has been placed on hold in your name.
        </p>

        <div style="background:#FAF9F7;border:1px solid #E8E4DA;border-radius:10px;padding:22px;margin-bottom:24px;text-align:center;">
          <p style="margin:0 0 10px;font-size:10px;text-transform:uppercase;letter-spacing:0.25em;color:#B8975A;">Your Reservation Reference</p>
          <p style="margin:0;font-family:'Courier New',monospace;font-size:14px;font-weight:700;color:#1A140A;word-break:break-all;letter-spacing:0.05em;">${reservation.token}</p>
          <p style="margin:10px 0 0;font-size:12px;color:#9A9090;">You will need this to check your status and upload payment proof.</p>
        </div>

        <div style="background:#FFF8EC;border:1px solid #F0D99A;border-radius:10px;padding:18px;margin-bottom:28px;">
          <p style="margin:0;font-size:13px;color:#8B6914;line-height:1.6;">
            ⏰ <strong>Payment Deadline:</strong> ${deadline} (Philippine Time)<br/>
            After this window your hold will lapse if no proof is submitted.
          </p>
        </div>

        <div style="border-left:3px solid #B8975A;padding-left:18px;margin-bottom:22px;">
          <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#1A140A;text-transform:uppercase;letter-spacing:0.12em;">Step 1 — Pay the Reservation Fee</p>
          <p style="margin:0 0 12px;font-size:14px;color:#555;line-height:1.6;">Transfer <strong>₱30,000</strong> to:</p>
          <table style="border-collapse:collapse;">${bankRows}</table>
        </div>

        <div style="border-left:3px solid #B8975A;padding-left:18px;margin-bottom:32px;">
          <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#1A140A;text-transform:uppercase;letter-spacing:0.12em;">Step 2 — Upload Your Payment Proof</p>
          <p style="margin:0 0 16px;font-size:14px;color:#555;line-height:1.6;">Take a screenshot of your transfer confirmation. Then visit the link below, enter your email and reservation reference, and upload the file.</p>
          <a href="${statusUrl}" style="display:inline-block;background:#B8975A;color:#fff;padding:13px 28px;border-radius:8px;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;">Check Status &amp; Upload →</a>
        </div>

        <p style="font-size:13px;color:#9A9090;line-height:1.6;margin:0;">
          Questions? Reply to this email and we will assist you.
        </p>
      </div>`),
  });

  console.log("[Email] Reservation on-hold sent — messageId:", info.messageId);
};

// ─── 2. Reservation Confirmed (payment approved) ─────────────────────────────

export const sendReservationApprovedEmail = async (data: {
  customerEmail: string;
  customerFirstName?: string | null;
  customerLastName?: string | null;
  reservedAt: Date;
  verifiedAt: Date;
  notes?: string | null;
  unit?: {
    roomNo?: string | null;
    unitType?: string | null;
    floor?: number | null;
    price?: any;
  } | null;
}) => {
  const transporter = createTransporter();

  const firstName = data.customerFirstName ?? "Valued Client";
  const fullName =
    [data.customerFirstName, data.customerLastName].filter(Boolean).join(" ") ||
    "Valued Client";
  const unitLabel =
    [data.unit?.unitType, data.unit?.roomNo ? `Room ${data.unit.roomNo}` : null]
      .filter(Boolean)
      .join(" · ") || "Your Selected Unit";
  const floorLabel = data.unit?.floor ? `Floor ${data.unit.floor}` : "";
  const priceLabel = data.unit?.price ? formatPeso(data.unit.price) : "";
  const confirmedDate = formatPhDate(data.verifiedAt);

  const info = await transporter.sendMail({
    from: `"August Residences" <${process.env.SMTP_FROM ?? process.env.SMTP_USER}>`,
    to: data.customerEmail,
    subject: `🎉 Reservation Confirmed — ${unitLabel}`,
    html: emailWrapper(`
      <div style="background:#1A140A;padding:36px 32px;text-align:center;">
        <p style="margin:0 0 8px;color:#B8975A;font-size:10px;letter-spacing:0.35em;text-transform:uppercase;">August Residences</p>
        <h1 style="margin:0;color:#FFFFFF;font-size:26px;font-weight:300;letter-spacing:0.04em;">Reservation Confirmed</h1>
      </div>
      <div style="padding:36px 32px;">
        <p style="font-size:15px;line-height:1.7;margin:0 0 6px;">Dear <strong>${firstName}</strong>,</p>
        <p style="font-size:15px;line-height:1.7;margin:0 0 28px;color:#555;">
          Congratulations! Your reservation fee has been verified and your unit is now officially reserved under your name.
        </p>

        <!-- Success banner -->
        <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;padding:24px;margin-bottom:28px;text-align:center;">
          <p style="margin:0 0 6px;font-size:28px;">✅</p>
          <p style="margin:0 0 4px;font-size:18px;font-weight:600;color:#166534;">Successfully Reserved</p>
          <p style="margin:0;font-size:14px;color:#166534;opacity:0.8;">Payment verified and unit locked in your name</p>
        </div>

        <!-- Unit details -->
        <div style="background:#FAF9F7;border:1px solid #E8E4DA;border-radius:10px;padding:22px;margin-bottom:24px;">
          <p style="margin:0 0 14px;font-size:10px;text-transform:uppercase;letter-spacing:0.25em;color:#B8975A;">Your Reserved Unit</p>
          <table style="border-collapse:collapse;width:100%;">
            <tr>
              <td style="padding:4px 0;color:#9A9090;font-size:13px;width:40%;">Unit</td>
              <td style="padding:4px 0;font-weight:600;font-size:13px;color:#1A140A;">${unitLabel}</td>
            </tr>
            ${floorLabel ? `<tr><td style="padding:4px 0;color:#9A9090;font-size:13px;">Floor</td><td style="padding:4px 0;font-weight:600;font-size:13px;color:#1A140A;">${floorLabel}</td></tr>` : ""}
            ${priceLabel ? `<tr><td style="padding:4px 0;color:#9A9090;font-size:13px;">Unit Price</td><td style="padding:4px 0;font-weight:600;font-size:13px;color:#1A140A;">${priceLabel}</td></tr>` : ""}
            <tr>
              <td style="padding:4px 0;color:#9A9090;font-size:13px;">Reserved By</td>
              <td style="padding:4px 0;font-weight:600;font-size:13px;color:#1A140A;">${fullName}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;color:#9A9090;font-size:13px;">Confirmed On</td>
              <td style="padding:4px 0;font-weight:600;font-size:13px;color:#1A140A;">${confirmedDate} (PH Time)</td>
            </tr>
          </table>
        </div>

        ${
          data.notes
            ? `
        <div style="background:#FAF9F7;border-left:3px solid #B8975A;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:24px;">
          <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#B8975A;">Note from our team</p>
          <p style="margin:0;font-size:14px;color:#555;line-height:1.6;">${data.notes}</p>
        </div>`
            : ""
        }

        <p style="font-size:14px;color:#555;line-height:1.7;margin:0 0 16px;">
          Our team will be reaching out to you shortly to discuss the next steps in the reservation process, including documentation and payment schedule.
        </p>
        <p style="font-size:13px;color:#9A9090;line-height:1.6;margin:0;">
          Thank you for choosing August Residences. We look forward to welcoming you. Questions? Reply to this email.
        </p>
      </div>`),
  });

  console.log("[Email] Reservation approved sent — messageId:", info.messageId);
};

// ─── 3. Reservation Rejected ──────────────────────────────────────────────────

export const sendReservationRejectedEmail = async (data: {
  customerEmail: string;
  customerFirstName?: string | null;
  notes?: string | null;
  unit?: {
    roomNo?: string | null;
    unitType?: string | null;
    floor?: number | null;
  } | null;
}) => {
  const transporter = createTransporter();
  const marketingUrl = process.env.MARKETING_URL ?? "http://localhost:3002";

  const firstName = data.customerFirstName ?? "Valued Client";
  const unitLabel =
    [data.unit?.unitType, data.unit?.roomNo ? `Room ${data.unit.roomNo}` : null]
      .filter(Boolean)
      .join(" · ") || "your selected unit";
  const floorLabel = data.unit?.floor ? ` (Floor ${data.unit.floor})` : "";

  const info = await transporter.sendMail({
    from: `"August Residences" <${process.env.SMTP_FROM ?? process.env.SMTP_USER}>`,
    to: data.customerEmail,
    subject: `Update on Your Reservation — ${unitLabel}`,
    html: emailWrapper(`
      <div style="background:#1A140A;padding:36px 32px;text-align:center;">
        <p style="margin:0 0 8px;color:#B8975A;font-size:10px;letter-spacing:0.35em;text-transform:uppercase;">August Residences</p>
        <h1 style="margin:0;color:#FFFFFF;font-size:26px;font-weight:300;letter-spacing:0.04em;">Reservation Update</h1>
      </div>
      <div style="padding:36px 32px;">
        <p style="font-size:15px;line-height:1.7;margin:0 0 6px;">Dear <strong>${firstName}</strong>,</p>
        <p style="font-size:15px;line-height:1.7;margin:0 0 28px;color:#555;">
          We regret to inform you that we were unable to confirm your reservation for <strong>${unitLabel}${floorLabel}</strong> at this time.
        </p>

        <!-- Status banner -->
        <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;padding:20px;margin-bottom:28px;text-align:center;">
          <p style="margin:0 0 6px;font-size:24px;">❌</p>
          <p style="margin:0 0 4px;font-size:16px;font-weight:600;color:#DC2626;">Reservation Not Confirmed</p>
          <p style="margin:0;font-size:13px;color:#B91C1C;opacity:0.9;">The unit has been released back to available inventory</p>
        </div>

        ${
          data.notes
            ? `
        <div style="background:#FAF9F7;border-left:3px solid #DC2626;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:24px;">
          <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#DC2626;">Reason</p>
          <p style="margin:0;font-size:14px;color:#555;line-height:1.6;">${data.notes}</p>
        </div>`
            : `
        <div style="background:#FAF9F7;border:1px solid #E8E4DA;border-radius:10px;padding:16px;margin-bottom:24px;">
          <p style="margin:0;font-size:13px;color:#9A9090;line-height:1.6;">
            If you have questions about this decision or believe this is an error, please reply to this email and our team will be happy to assist.
          </p>
        </div>`
        }

        <p style="font-size:14px;color:#555;line-height:1.7;margin:0 0 20px;">
          You are welcome to visit our reservation portal and choose another available unit. Our team is ready to help you find the right home.
        </p>

        <a href="${marketingUrl}" style="display:inline-block;background:#1A140A;color:#fff;padding:13px 28px;border-radius:8px;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:28px;">Browse Available Units →</a>

        <p style="font-size:13px;color:#9A9090;line-height:1.6;margin:0;">
          We appreciate your interest in August Residences and hope to assist you again soon.
        </p>
      </div>`),
  });

  console.log("[Email] Reservation rejected sent — messageId:", info.messageId);
};
