type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export type SendEmailResult =
  | { ok: true; id?: string }
  | { ok: false; skipped?: boolean; error: string };

function siteUrl() {
  return (
    process.env.AUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://zerospenders.com"
  ).replace(/\/$/, "");
}

export function getSiteUrl() {
  return siteUrl();
}

export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

/** Send transactional email via Resend. No-ops with skipped if not configured. */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    return {
      ok: false,
      skipped: true,
      error: "RESEND_API_KEY or EMAIL_FROM not configured",
    };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });

    if (result.error) {
      return { ok: false, error: result.error.message };
    }

    return { ok: true, id: result.data?.id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Email send failed",
    };
  }
}

export function buildNewOffersDigestEmail(input: {
  name: string;
  buckets: { label: string; count: number }[];
  total: number;
}) {
  const firstName = input.name.split(" ")[0] || "there";
  const summary = input.buckets.map((b) => `${b.label} (${b.count})`).join(", ");
  const seeNewUrl = `${siteUrl()}/today`;
  const liveUrl = `${siteUrl()}/live`;

  const subject =
    input.total === 1
      ? `Hello ${firstName}, we found 1 new FREE offer for you`
      : `Hello ${firstName}, we found ${input.total} new FREE offers for you`;

  const text = [
    `Hello ${firstName},`,
    "",
    `We discovered new FREE offers matching your interests:`,
    summary,
    "",
    `See what's new: ${seeNewUrl}`,
    `Or browse the live board: ${liveUrl}`,
    "",
    "— ZeroSpenders",
  ].join("\n");

  const rows = input.buckets
    .map(
      (b) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #1e293b;color:#e2e8f0;">${escapeHtml(b.label)}</td><td style="padding:8px 0;border-bottom:1px solid #1e293b;text-align:right;color:#34d399;font-weight:700;">${b.count}</td></tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#07090c;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <p style="margin:0 0 8px;color:#34d399;font-size:12px;letter-spacing:0.16em;font-weight:700;">ZEROSPENDERS</p>
    <h1 style="margin:0 0 16px;color:#fff;font-size:24px;">Hello ${escapeHtml(firstName)},</h1>
    <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;line-height:1.5;">
      We discovered <strong style="color:#fff;">${input.total}</strong> new FREE offer${input.total === 1 ? "" : "s"} matching your interests.
    </p>
    <table style="width:100%;border-collapse:collapse;margin:0 0 24px;">${rows}</table>
    <a href="${seeNewUrl}" style="display:inline-block;background:#34d399;color:#04140f;text-decoration:none;font-weight:700;font-size:14px;padding:12px 20px;border-radius:8px;">
      Click here to see what's new →
    </a>
    <p style="margin:28px 0 0;color:#64748b;font-size:12px;">
      You're receiving this because you joined ZeroSpenders and picked these interests.
      <a href="${liveUrl}" style="color:#34d399;">Browse the live board</a>
    </p>
  </div>
</body></html>`;

  return { subject, html, text };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
