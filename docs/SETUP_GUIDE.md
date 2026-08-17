# 🚀 Domain-Only Setup Guide for `acclaira.com`

All raw IP URLs and exposed web ports have been closed. All services now operate strictly through your domain names with automatic SSL/TLS encryption.

---

## 🌐 Active Domain Mapping

| Domain / Subdomain | Target Service | SSL / Encryption | Description |
| :--- | :--- | :--- | :--- |
| **`https://mail.acclaira.com`** | **Poste.io Email & Webmail** | Auto Let's Encrypt | Webmail (Roundcube) & Email Administrator Console |
| **`https://panel.acclaira.com`** | **Coolify PaaS** | Auto Let's Encrypt | Dashboard to deploy Node.js/Next.js, Python, PostgreSQL |
| **`https://acclaira.com`** | **Your Main Web App** | Auto Let's Encrypt | Deployed via Coolify (Next.js / Node.js / Python) |
| **`https://api.acclaira.com`** | **Backend API** | Auto Let's Encrypt | Deployed via Coolify (Python FastAPI / Node.js) |

> [!IMPORTANT]
> Raw IP addresses (e.g. `http://144.126.148.169/*`, port `8088`, port `8443`) are disabled/hidden and will no longer serve pages. Only valid host requests matching your domains will be routed.

---

## 📋 DNS Records to Add in Your DNS Manager (e.g. Cloudflare / Registrar)

Add the following DNS records for **`acclaira.com`**:

### 1. Web & Server Hostname Records (A Records)
| Type | Name / Host | Target / IPv4 | Cloudflare Proxy Status | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `mail` | `144.126.148.169` | **DNS Only (Grey Cloud)** | Required for IMAP/SMTP mail server |
| **A** | `panel` | `144.126.148.169` | Proxied or DNS Only | Coolify Management Panel |
| **A** | `@` *(root)* | `144.126.148.169` | Proxied or DNS Only | Your main web application |
| **A** | `*` *(wildcard)* | `144.126.148.169` | Proxied or DNS Only | Allows instant subdomains (e.g. `api`, `app`) |

---

### 2. Email Routing & Anti-Spam Records (MX & TXT Records)
| Type | Name / Host | Target / Value | Priority | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **MX** | `@` *(root)* | `mail.acclaira.com` | `10` | Delivers inbound emails to your mail server |
| **TXT** | `@` *(root)* | `v=spf1 mx ip4:144.126.148.169 ~all` | - | SPF: Authorizes your server to send emails |
| **TXT** | `_dmarc` | `v=DMARC1; p=none; sp=none; rua=mailto:mail@acclaira.com` | - | DMARC: Anti-spoofing policy |

---

## ✉️ Email Client Settings (for iPhone, Mac Mail, Thunderbird, Android)

| Service | Server Hostname | Port | Encryption |
| :--- | :--- | :--- | :--- |
| **Webmail Access** | `https://mail.acclaira.com` | `443` | HTTPS (SSL) |
| **Incoming Mail (IMAP)** | `mail.acclaira.com` | `993` | SSL / TLS |
| **Outgoing Mail (SMTP)** | `mail.acclaira.com` | `587` or `465` | STARTTLS / SSL |
| **Username** | `mail@acclaira.com` | - | - |
| **Password** | *Your chosen password* | - | - |
