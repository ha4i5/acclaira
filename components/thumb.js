"use client";
export const TEMPLATES = [
  { id: "breaking", name: "Breaking Red", tag: "BREAKING", tagBg: "#D6244F", panel: "rgba(20,16,46,0.55)", accent: "#D6244F", text: "#FFFFFF" },
  { id: "violet", name: "Acclaira Violet", tag: "NEWS", tagBg: "#43318F", panel: "rgba(67,49,143,0.60)", accent: "#3EC3AC", text: "#FFFFFF" },
  { id: "urdu", name: "Urdu Bold", tag: "تازہ ترین", tagBg: "#0E8A72", panel: "rgba(10,8,25,0.62)", accent: "#3EC3AC", text: "#FFFFFF" },
  { id: "yt", name: "YouTube Style", tag: "EXCLUSIVE", tagBg: "#FFD400", panel: "rgba(0,0,0,0.55)", accent: "#FFD400", text: "#FFFFFF", tagText: "#111" },
];
export const SIZES = [
  { id: "sq", name: "Post 1:1", w: 1080, h: 1080 },
  { id: "story", name: "Story 9:16", w: 1080, h: 1920 },
  { id: "yt", name: "YouTube 16:9", w: 1280, h: 720 },
];

function wrap(ctx, text, maxWidth) {
  const words = text.split(/\s+/); const lines = []; let cur = "";
  for (const w of words) {
    const t = cur ? cur + " " + w : w;
    if (ctx.measureText(t).width > maxWidth && cur) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 4);
}

export function drawThumb(canvas, headline, img, tpl, size, handle) {
  const { w: W, h: H } = size;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  const U = Math.min(W, H) / 1080;
  if (img) {
    const r = Math.max(W / img.width, H / img.height);
    ctx.drawImage(img, (W - img.width * r) / 2, (H - img.height * r) / 2, img.width * r, img.height * r);
  } else {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#43318F"); g.addColorStop(1, "#14102E");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(255,255,255,0.10)"; ctx.lineWidth = 26 * U; ctx.lineCap = "round";
    const cx = W / 2, cy = H / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 290 * U); ctx.lineTo(cx - 310 * U, cy + 290 * U);
    ctx.moveTo(cx, cy - 290 * U); ctx.lineTo(cx + 190 * U, cy + 290 * U);
    ctx.moveTo(cx - 200 * U, cy + 100 * U); ctx.lineTo(cx + 120 * U, cy + 100 * U);
    ctx.stroke();
  }
  const scrim = ctx.createLinearGradient(0, H * 0.42, 0, H);
  scrim.addColorStop(0, "rgba(0,0,0,0)"); scrim.addColorStop(1, tpl.panel.replace(/[\d.]+\)$/, "0.92)"));
  ctx.fillStyle = scrim; ctx.fillRect(0, 0, W, H);
  ctx.font = `700 ${40 * U}px Poppins, sans-serif`;
  const tagW = ctx.measureText(tpl.tag).width + 56 * U;
  ctx.fillStyle = tpl.tagBg; ctx.fillRect(64 * U, 64 * U, tagW, 78 * U);
  ctx.fillStyle = tpl.tagText || "#fff"; ctx.textBaseline = "middle";
  ctx.fillText(tpl.tag, 92 * U, 64 * U + 41 * U);
  const fs = (W > H ? 60 : 72) * U;
  ctx.font = `700 ${fs}px Poppins, sans-serif`; ctx.fillStyle = tpl.text; ctx.textBaseline = "alphabetic";
  const lines = wrap(ctx, headline || "Your headline appears here", W - 128 * U);
  const lineH = fs * 1.22;
  let y = H - 96 * U - (lines.length - 1) * lineH - 60 * U;
  lines.forEach((l) => { ctx.fillText(l, 64 * U, y); y += lineH; });
  ctx.fillStyle = tpl.accent; ctx.fillRect(64 * U, H - 118 * U, 190 * U, 12 * U);
  ctx.font = `600 ${34 * U}px Poppins, sans-serif`; ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText(handle, 64 * U, H - 44 * U);
  const sc = 0.42 * U, ox = W - 150 * U, oy = 60 * U;
  ctx.strokeStyle = "#fff"; ctx.lineWidth = 9 * U; ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(ox + 120 * sc, oy + 22 * sc); ctx.lineTo(ox + 22 * sc, oy + 202 * sc);
  ctx.moveTo(ox + 120 * sc, oy + 22 * sc); ctx.lineTo(ox + 178 * sc, oy + 202 * sc);
  ctx.moveTo(ox + 56 * sc, oy + 142 * sc); ctx.lineTo(ox + 152 * sc, oy + 142 * sc);
  ctx.stroke();
  ctx.fillStyle = "#3EC3AC";
  ctx.beginPath(); ctx.moveTo(ox + 30 * sc, oy + 182 * sc); ctx.lineTo(ox + 202 * sc, oy + 105 * sc); ctx.lineTo(ox + 208 * sc, oy + 119 * sc); ctx.lineTo(ox + 36 * sc, oy + 196 * sc); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(ox + 200 * sc, oy + 92 * sc); ctx.lineTo(ox + 242 * sc, oy + 110 * sc); ctx.lineTo(ox + 204 * sc, oy + 131 * sc); ctx.closePath(); ctx.fill();
}
