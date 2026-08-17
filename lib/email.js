import nodemailer from "nodemailer";

let transporter = null;
function getTransport() {
  if (!process.env.SMTP_HOST) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

export async function sendEmail(to, subject, html) {
  const t = getTransport();
  if (!t) return false;
  try {
    await t.sendMail({ from: process.env.SMTP_FROM || `"Acclaira" <${process.env.SMTP_USER}>`, to, subject, html });
    return true;
  } catch (e) { console.error("[email]", e.message); return false; }
}

export async function verifySmtp() {
  const t = getTransport();
  if (!t) throw new Error("SMTP is not configured — add SMTP_* values to .env and restart (pm2 restart acclaira).");
  await t.verify();
  return true;
}

const wrap = (inner) => `
<div style="background:#F7F6FB;padding:32px 16px">
  <div style="font-family:Arial,sans-serif;max-width:540px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #E7E4F2">
    <div style="background:#14102E;padding:18px 28px">
      <span style="font-weight:800;font-size:20px;color:#fff">acclaira</span>
      <span style="color:#3EC3AC;font-size:20px;font-weight:800">.</span>
    </div>
    <div style="padding:28px">${inner}</div>
    <div style="padding:16px 28px;border-top:1px solid #E7E4F2;color:#9A95BB;font-size:12px">
      Acclaira · One headline. Post. Article. Video. · <a href="https://acclaira.com" style="color:#43318F">acclaira.com</a>
    </div>
  </div>
</div>`;

export const tpl = (title, body, cta) => wrap(`
  <h2 style="color:#241F45;margin:0 0 10px;font-size:22px">${title}</h2>
  <p style="color:#4A4568;font-size:15px;line-height:1.65;margin:0 0 18px">${body}</p>
  ${cta ? `<a href="${cta.href}" style="display:inline-block;background:#43318F;color:#fff;font-weight:700;font-size:14px;padding:12px 22px;border-radius:12px;text-decoration:none">${cta.label}</a>` : ""}`);

export const invoiceTpl = ({ number, email, date, method, note, amount, credits }) => wrap(`
  <h2 style="color:#241F45;margin:0 0 4px;font-size:22px">Payment received 🎉</h2>
  <p style="color:#6E6A8A;font-size:13px;margin:0 0 20px">Invoice ${number} · ${date}</p>
  <table style="width:100%;border-collapse:collapse;font-size:14px">
    <tr><td style="padding:9px 0;color:#6E6A8A">Billed to</td><td style="padding:9px 0;color:#241F45;text-align:right">${email}</td></tr>
    <tr><td style="padding:9px 0;color:#6E6A8A;border-top:1px solid #E7E4F2">Item</td><td style="padding:9px 0;color:#241F45;text-align:right;border-top:1px solid #E7E4F2">${note || "Credit top-up"} (${credits} credits)</td></tr>
    <tr><td style="padding:9px 0;color:#6E6A8A;border-top:1px solid #E7E4F2">Payment method</td><td style="padding:9px 0;color:#241F45;text-align:right;border-top:1px solid #E7E4F2;text-transform:capitalize">${method}</td></tr>
    <tr><td style="padding:12px 0;color:#241F45;font-weight:800;border-top:2px solid #241F45;font-size:16px">Total paid</td><td style="padding:12px 0;color:#43318F;font-weight:800;text-align:right;border-top:2px solid #241F45;font-size:16px">$${amount}</td></tr>
  </table>
  <p style="color:#0E8A72;font-size:13px;margin:18px 0 0;background:#E6F7F3;padding:10px 14px;border-radius:10px">✓ ${credits} credits have been added to your account.</p>`);
