// Plain, table-based HTML email bodies — deliberately no external CSS/fonts
// (most email clients strip <style> blocks and web fonts anyway). Kept in
// one file so the brand look (orange accent, dark footer) stays consistent
// across every email the app sends.

const BRAND = "#ff6a00";

function shell(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f5f5f4;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4;padding:32px 0;">
      <tr>
        <td align="center">
          <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background:#141414;padding:20px 32px;">
                <span style="color:#ffffff;font-size:18px;font-weight:700;">Glide<span style="color:${BRAND};">in</span>bir</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:#1c1c1c;font-size:14px;line-height:1.6;">
                <h1 style="margin:0 0 16px;font-size:20px;color:#141414;">${title}</h1>
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:#fafaf9;color:#78716c;font-size:12px;">
                Glideinbir · Bir Billing, Himachal Pradesh · +91 98053 38877
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;margin-top:20px;padding:12px 24px;background:${BRAND};color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">${label}</a>`;
}

export function passwordResetEmail(params: { name: string; resetUrl: string }) {
  const html = shell(
    "Reset your password",
    `<p>Hi ${params.name},</p>
     <p>We received a request to reset your Glideinbir password. This link expires in 30 minutes.</p>
     ${button(params.resetUrl, "Reset password")}
     <p style="margin-top:24px;color:#78716c;">If you didn't ask for this, you can safely ignore this email — your password won't change.</p>`,
  );
  return { subject: "Reset your Glideinbir password", html };
}

export function bookingConfirmedEmail(params: {
  name: string;
  bookingNumber: string;
  totalAmount: string;
  bookingUrl: string;
}) {
  const html = shell(
    "Booking confirmed 🎉",
    `<p>Hi ${params.name},</p>
     <p>Your booking <strong>${params.bookingNumber}</strong> is confirmed — payment of <strong>${params.totalAmount}</strong> received.</p>
     ${button(params.bookingUrl, "View booking")}
     <p style="margin-top:24px;color:#78716c;">See you in Bir Billing! Call +91 98053 38877 for anything urgent.</p>`,
  );
  return { subject: `Booking confirmed — ${params.bookingNumber}`, html };
}

export function bookingReminderEmail(params: { name: string; bookingNumber: string; bookingUrl: string }) {
  const html = shell(
    "See you tomorrow! ⛰️",
    `<p>Hi ${params.name},</p>
     <p>Just a reminder — your booking <strong>${params.bookingNumber}</strong> is scheduled for tomorrow.</p>
     ${button(params.bookingUrl, "View booking details")}
     <p style="margin-top:24px;color:#78716c;">Questions or need to reschedule? Call +91 98053 38877.</p>`,
  );
  return { subject: `Reminder — your booking is tomorrow (${params.bookingNumber})`, html };
}

export function abandonedBookingEmail(params: { name: string; bookingNumber: string; bookingUrl: string }) {
  const html = shell(
    "You left something behind",
    `<p>Hi ${params.name},</p>
     <p>Your booking <strong>${params.bookingNumber}</strong> is still waiting on payment — your slot isn't
     held forever, so it's worth finishing up if you still want it.</p>
     ${button(params.bookingUrl, "Complete your booking")}
     <p style="margin-top:24px;color:#78716c;">Changed your mind, or ran into an issue paying? Call +91 98053 38877 and we'll sort it out.</p>`,
  );
  return { subject: `Still want ${params.bookingNumber}? Your booking is waiting`, html };
}

export function contactAdminNotificationEmail(params: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}) {
  const html = shell(
    "New contact form message",
    `<p><strong>${params.name}</strong> (${params.email}${params.phone ? `, ${params.phone}` : ""}) sent:</p>
     <p style="white-space:pre-wrap;background:#fafaf9;padding:16px;border-radius:8px;">${params.message}</p>`,
  );
  return { subject: `New message from ${params.name}`, html };
}

export function contactAutoReplyEmail(params: { name: string }) {
  const html = shell(
    "We got your message",
    `<p>Hi ${params.name},</p>
     <p>Thanks for reaching out — we'll get back to you shortly. For anything urgent, call us directly at <strong>+91 98053 38877</strong>.</p>`,
  );
  return { subject: "We received your message — Glideinbir", html };
}
