# Acclaira — AI Viral News Content Platform

One headline in → branded viral post, SEO WordPress article, and Urdu video script out.

## What works out of the box

| Feature | Status |
|---|---|
| Marketing site (landing, packages, contact, privacy, terms) | ✅ Live |
| User accounts (register/login, JWT sessions, bcrypt) | ✅ Live |
| Admin role (first user registering with ADMIN_EMAIL) | ✅ Live |
| Settings — all credentials, AES-256 encrypted, Off air / Go live per channel | ✅ Live |
| Module 1 — thumbnail generator (3 formats), AI captions/hashtags/keywords | ✅ Live (needs Claude or Gemini key) |
| Module 1 — real posting to Facebook Page + first comment | ✅ Live (needs Meta Page token, channel Live) |
| Module 2 — AI SEO article + 16:9 feature image | ✅ Live (needs AI key) |
| Module 2 — real publish to WordPress with feature image, returns live URL | ✅ Live (needs WP app password, channel Live) |
| Module 3 — AI Urdu script + browser voice preview | ✅ Live (needs AI key) |
| Module 3 — real MP4 rendering (Urdu TTS voice + Ken Burns zoom, FFmpeg) | ✅ Live (needs Google TTS key Live + ffmpeg installed) |
| Credit system — configurable costs (post/article/video), charged per generation, auto-refund on failure, blocked when empty | ✅ Live |
| Account page — profile + change password; user payment history | ✅ Live |
| Admin console — stats, full user management (plan/credits/suspend/reset password/delete), funds ledger with manual JazzCash/Easypaisa recording, credit-cost & package pricing editor, live API health checks, contact inbox | ✅ Live |
| News sources manager, history log, billing page | ✅ Live |
| Post scheduling — server publishes queued posts at exact time, cancellable, email on publish | ✅ Live |
| RSS auto-mode — sources with Auto on are checked every 15 min; headlines land in Auto-drafts for one-click approval | ✅ Live |
| Full email system via your own SMTP mailbox — welcome on signup, password reset links, invoices on payment, contact auto-reply + admin alert, low-credit warnings, scheduled-post alerts, suspension notices, and an admin marketing broadcast tool with SMTP test | ✅ Live (set SMTP_* in .env) |
| Referral system — /register?ref=CODE, bonus credits to referrer (configurable), copy-link in Account | ✅ Live |
| Brands — per-brand watermark handle, tag & colors on thumbnails; Agency = 5 brands | ✅ Live |
| Analytics — likes/comments/shares pulled from Meta Graph for published posts | ✅ Live (needs Meta Live) |
| Stripe/JazzCash checkout | 🔜 Keys saved in Settings; payment flow to be wired when accounts are live |

## Quick install on a fresh Ubuntu VPS

```bash
# upload/clone the project, then inside the folder:
sudo bash install.sh acclaira.com
```

The installer sets up Node 20, builds the app, runs it with PM2 (auto-restart on reboot), and configures nginx for your domain. Then add free HTTPS:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d acclaira.com -d www.acclaira.com
```

### DNS (at Dynadot)
Point an **A record** for `@` and `www` of acclaira.com to your VPS IP. For acclaira.co, add a domain forward to https://acclaira.com.

## Manual install / local dev

```bash
cp .env.example .env    # edit the 3 values
npm install
npm run dev             # http://localhost:3000
```

## First-run checklist

1. Register with the email in `ADMIN_EMAIL` → you become admin.
2. Dashboard → Settings → **AI engines** → paste a Claude API key (console.anthropic.com) or Gemini key (aistudio.google.com). This unlocks all generation.
3. **WordPress**: WP Admin → Users → Profile → Application Passwords → create "Acclaira" → paste site URL, username, and the password → Save → tick **Go live** → publish a test article from Module 2 and get its real URL.
4. **Meta**: create an app at developers.facebook.com, request `pages_manage_posts` + `instagram_content_publish` (App Review takes 1–2 weeks), generate a long-lived Page token, paste Page ID + token → Go live → post from Module 1.
5. Until a channel is Live it stays **Off air** — nothing ever publishes on its own.

## Enabling video rendering (Module 3, later)

Rendering real MP4s needs FFmpeg and a worker process — heavier than the base install on purpose. When ready: `apt install ffmpeg`, then we add a queue worker that takes the script + TTS audio and renders 9:16 video. Ask Claude for the "Acclaira video worker" step and it will be built on top of this codebase.

## Stack & structure

Next.js 14 (App Router) · SQLite (`data/acclaira.db`, WAL mode, zero external services) · JWT cookies (jose) · bcryptjs · AES-256-GCM for stored credentials · Tailwind.

```
app/            pages + API routes
  api/          auth, settings, sources, history, generate/*, publish/*, admin/*
  dashboard/    all user pages (auth-guarded in layout)
components/     ui.jsx, Marketing.jsx, dash.jsx, thumb.js (canvas engine)
lib/            db.js, auth.js, crypto.js, settings.js, ai.js
install.sh      one-command VPS installer
```

## Useful commands

```bash
pm2 logs acclaira      # live logs
pm2 restart acclaira   # after editing .env or updating code
npm run build          # rebuild after code changes
sqlite3 data/acclaira.db 'SELECT email,role FROM users;'   # inspect DB
```

## Backup

Everything lives in one file: `data/acclaira.db`. Cron-copy it nightly:
```bash
0 3 * * * cp /path/to/acclaira/data/acclaira.db /root/backups/acclaira-$(date +\%F).db
```
