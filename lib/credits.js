import db, { getConfig } from "./db";
import { sendEmail, tpl } from "./email";

export const COST_KEYS = { image: "cost_image", article: "cost_article", video: "cost_video" };

export function getCost(type) {
  return parseInt(getConfig(COST_KEYS[type], "1"), 10) || 1;
}

export function charge(userId, type, title, module_) {
  const cost = getCost(type);
  const user = db.prepare("SELECT credits, status FROM users WHERE id=?").get(userId);
  if (!user) throw new Error("Account not found.");
  if (user.status === "suspended") throw new Error("Your account is suspended. Contact support.");
  if (user.credits < cost)
    throw new Error(`Not enough credits — this needs ${cost} and you have ${user.credits}. Upgrade in Billing.`);
  db.prepare("UPDATE users SET credits = credits - ? WHERE id=?").run(cost, userId);
  db.prepare("INSERT INTO history (user_id,module,title,status,cost) VALUES (?,?,?,?,?)")
    .run(userId, module_, title || "Untitled", "created", cost);
  const remaining = user.credits - cost;
  if (remaining <= 5) {
    const row = db.prepare("SELECT email FROM users WHERE id=?").get(userId);
    if (row) sendEmail(row.email, "You're low on Acclaira credits", tpl("Only " + remaining + " credits left", "Top up in Billing so your posting never stops."));
  }
  return { cost, remaining };
}

export function refund(userId, amount, historyNote) {
  db.prepare("UPDATE users SET credits = credits + ? WHERE id=?").run(amount, userId);
  db.prepare("UPDATE history SET status='failed', cost=0 WHERE id=(SELECT MAX(id) FROM history WHERE user_id=?)").run(userId);
}
