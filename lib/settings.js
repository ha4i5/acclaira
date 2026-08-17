import db from "./db";
import { enc, dec } from "./crypto";

const SECRET_KEYS = /secret|password|token|key$/i;

export function getSettings(userId) {
  const rows = db.prepare("SELECT key,value,live FROM settings WHERE user_id=?").all(userId);
  const out = {};
  for (const r of rows) out[r.key] = { value: SECRET_KEYS.test(r.key) ? dec(r.value) : r.value, live: !!r.live };
  return out;
}

export function getSetting(userId, key) {
  const r = db.prepare("SELECT value,live FROM settings WHERE user_id=? AND key=?").get(userId, key);
  if (!r) return { value: "", live: false };
  return { value: SECRET_KEYS.test(key) ? dec(r.value) : r.value, live: !!r.live };
}

export function setSetting(userId, key, value, live) {
  const stored = SECRET_KEYS.test(key) ? enc(value || "") : (value || "");
  db.prepare(`INSERT INTO settings (user_id,key,value,live) VALUES (?,?,?,?)
    ON CONFLICT(user_id,key) DO UPDATE SET value=excluded.value, live=excluded.live`)
    .run(userId, key, stored, live ? 1 : 0);
}
