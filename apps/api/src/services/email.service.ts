// ─────────────────────────────────────────────────────────────────────────────
// apps/api/src/services/email.service.ts
// ─────────────────────────────────────────────────────────────────────────────

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === "true", // false for port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Increase timeout for slow connections
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
});

// ── Verify transporter on startup so you know immediately if SMTP is broken ──
transporter.verify((error) => {
  if (error) {
    console.error(
      "[Email] SMTP configuration error — emails will NOT be sent:",
      error.message,
    );
  } else {
    console.log("[Email] SMTP connection verified. Ready to send.");
  }
});

// ─── Formatters ───────────────────────────────────────────────────────────────

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

// ─── Reservation Confirmation Email ──────────────────────────────────────────

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
    ? `Floor ${reservation.unit.floor}`
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
    from: `"Residences at the Tower" <${process.env.SMTP_FROM ?? process.env.SMTP_USER}>`,
    to: reservation.customerEmail,
    subject: `Unit On Hold — Ref: ${reservation.token.slice(0, 8).toUpperCase()}`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#FAF9F7;font-family:'Helvetica Neue',Arial,sans-serif;color:#333;">
<div style="max-width:580px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E8E4DA;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

  <!-- Header -->
  <div style="background:#1A140A;padding:36px 32px;text-align:center;">
    <p style="margin:0 0 8px;color:#B8975A;font-size:10px;letter-spacing:0.35em;text-transform:uppercase;">Residences at the Tower</p>
    <h1 style="margin:0;color:#FFFFFF;font-size:26px;font-weight:300;letter-spacing:0.04em;">Your Unit is On Hold</h1>
  </div>

  <!-- Body -->
  <div style="padding:36px 32px;">
    <p style="font-size:15px;line-height:1.7;margin:0 0 6px;">Dear <strong>${firstName}</strong>,</p>
    <p style="font-size:15px;line-height:1.7;margin:0 0 28px;color:#555;">
      Thank you for your interest. <strong>${unitLabel}</strong>${floorLabel ? ` on <strong>${floorLabel}</strong>` : ""} has been placed on hold in your name.
    </p>

    <!-- Reference Box -->
    <div style="background:#FAF9F7;border:1px solid #E8E4DA;border-radius:10px;padding:22px;margin-bottom:24px;text-align:center;">
      <p style="margin:0 0 10px;font-size:10px;text-transform:uppercase;letter-spacing:0.25em;color:#B8975A;">Your Reservation Reference</p>
      <p style="margin:0;font-family:'Courier New',monospace;font-size:14px;font-weight:700;color:#1A140A;word-break:break-all;letter-spacing:0.05em;">${reservation.token}</p>
      <p style="margin:10px 0 0;font-size:12px;color:#9A9090;">You will need this to check your status and upload payment proof.</p>
    </div>

    <!-- Deadline -->
    <div style="background:#FFF8EC;border:1px solid #F0D99A;border-radius:10px;padding:18px;margin-bottom:28px;">
      <p style="margin:0;font-size:13px;color:#8B6914;line-height:1.6;">
        ⏰ <strong>Payment Deadline:</strong> ${deadline} (Philippine Time)<br/>
        After this window your hold will lapse if no proof is submitted.
      </p>
    </div>

    <!-- Step 1 -->
    <div style="border-left:3px solid #B8975A;padding-left:18px;margin-bottom:22px;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#1A140A;text-transform:uppercase;letter-spacing:0.12em;">Step 1 — Pay the Reservation Fee</p>
      <p style="margin:0 0 12px;font-size:14px;color:#555;line-height:1.6;">Transfer <strong>₱30,000</strong> to:</p>
      <table style="border-collapse:collapse;">${bankRows}</table>
    </div>

    <!-- Step 2 -->
    <div style="border-left:3px solid #B8975A;padding-left:18px;margin-bottom:32px;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#1A140A;text-transform:uppercase;letter-spacing:0.12em;">Step 2 — Upload Your Payment Proof</p>
      <p style="margin:0 0 16px;font-size:14px;color:#555;line-height:1.6;">Take a screenshot of your transfer confirmation. Then click the button below, enter your email and reservation reference, and upload the file.</p>
      <a href="${statusUrl}" style="display:inline-block;background:#B8975A;color:#fff;padding:13px 28px;border-radius:8px;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;">Check Status &amp; Upload →</a>
    </div>

    <p style="font-size:13px;color:#9A9090;line-height:1.6;margin:0;">
      Questions? Reply to this email and we will assist you.
    </p>
  </div>

  <!-- Footer -->
  <div style="background:#FAF9F7;border-top:1px solid #E8E4DA;padding:18px 32px;text-align:center;">
    <p style="margin:0;font-size:11px;color:#B8B0A8;">© ${new Date().getFullYear()} Residences at the Tower. All rights reserved.</p>
  </div>

</div>
</body>
</html>`,
  });

  console.log("[Email] Confirmation sent — messageId:", info.messageId);
};
