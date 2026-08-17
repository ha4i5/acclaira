import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dir = path.join(process.cwd(), "data");
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
const db = new Database(path.join(dir, "acclaira.db"));
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  plan TEXT DEFAULT 'free',
  credits INTEGER DEFAULT 15,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS settings (
  user_id INTEGER NOT NULL, key TEXT NOT NULL, value TEXT, live INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, key)
);
CREATE TABLE IF NOT EXISTS sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, url TEXT NOT NULL, type TEXT DEFAULT 'RSS'
);
CREATE TABLE IF NOT EXISTS history (
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL,
  module TEXT, title TEXT, status TEXT DEFAULT 'created', url TEXT, cost INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS packages (
  id TEXT PRIMARY KEY, name TEXT, price INTEGER, credits INTEGER, popular INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, msg TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount REAL DEFAULT 0,
  credits INTEGER DEFAULT 0,
  method TEXT DEFAULT 'manual',
  note TEXT,
  admin_id INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS config (key TEXT PRIMARY KEY, value TEXT);
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL,
  caption TEXT, first_comment TEXT, image_path TEXT,
  scheduled_at TEXT NOT NULL, status TEXT DEFAULT 'queued', result TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS drafts (
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL,
  title TEXT, link TEXT, source TEXT, status TEXT DEFAULT 'new',
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS brands (
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL,
  name TEXT, handle TEXT, accent TEXT DEFAULT '#3EC3AC', tag_bg TEXT DEFAULT '#D6244F', tag TEXT DEFAULT 'BREAKING'
);
`);

// migrations for existing DBs
try { db.exec("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active'"); } catch {}
try { db.exec("ALTER TABLE history ADD COLUMN cost INTEGER DEFAULT 0"); } catch {}
try { db.exec("ALTER TABLE users ADD COLUMN ref_code TEXT"); } catch {}
try { db.exec("ALTER TABLE users ADD COLUMN referred_by INTEGER"); } catch {}
try { db.exec("ALTER TABLE sources ADD COLUMN auto INTEGER DEFAULT 0"); } catch {}
try { db.exec("ALTER TABLE users ADD COLUMN reset_token TEXT"); } catch {}
try { db.exec("ALTER TABLE users ADD COLUMN reset_expires TEXT"); } catch {}

const seedP = db.prepare("SELECT COUNT(*) c FROM packages").get();
if (seedP.c === 0) {
  const ins = db.prepare("INSERT INTO packages (id,name,price,credits,popular) VALUES (?,?,?,?,?)");
  ins.run("starter", "Starter", 19, 60, 0);
  ins.run("pro", "Pro", 49, 250, 1);
  ins.run("agency", "Agency", 129, 900, 0);
}
const defaults = { cost_image: "1", cost_article: "2", cost_video: "3", free_credits: "15", ref_credits: "10", resend_api_key: "", from_email: "Acclaira <noreply@acclaira.com>" };
const insC = db.prepare("INSERT OR IGNORE INTO config (key,value) VALUES (?,?)");
for (const [k, v] of Object.entries(defaults)) insC.run(k, v);

export function getConfig(key, fallback = "") {
  const r = db.prepare("SELECT value FROM config WHERE key=?").get(key);
  return r ? r.value : fallback;
}
export function setConfig(key, value) {
  db.prepare("INSERT INTO config (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(key, String(value));
}
export default db;
