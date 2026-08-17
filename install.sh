#!/bin/bash
# ============================================
#  Acclaira VPS Installer (Ubuntu 22.04/24.04)
#  Usage: sudo bash install.sh yourdomain.com
# ============================================
set -e
DOMAIN=${1:-acclaira.com}
APP_DIR=$(pwd)

echo "==> Installing Acclaira for $DOMAIN"

# 1. Node.js 20
if ! command -v node >/dev/null || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt 18 ]; then
  echo "==> Installing Node.js 20…"
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
apt-get install -y build-essential python3 nginx ffmpeg

# 2. App dependencies + build
echo "==> Installing app dependencies…"
npm install --no-audit --no-fund

# 3. Environment
if [ ! -f .env ]; then
  echo "==> Creating .env with random secrets…"
  cat > .env << ENV
JWT_SECRET=$(openssl rand -hex 32)
CRED_SECRET=$(openssl rand -hex 32)
ADMIN_EMAIL=admin@$DOMAIN
APP_URL=https://$DOMAIN

# SMTP — fill these with your mailbox (e.g. noreply@$DOMAIN) then: pm2 restart acclaira
SMTP_HOST=mail.$DOMAIN
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@$DOMAIN
SMTP_PASS=
SMTP_FROM="Acclaira" <noreply@$DOMAIN>
ENV
  echo "    ADMIN_EMAIL set to admin@$DOMAIN — register with this email to become admin."
fi

echo "==> Building…"
set -a; source .env; set +a
npm run build

# 4. PM2 process manager
npm install -g pm2
pm2 delete acclaira 2>/dev/null || true
pm2 start npm --name acclaira -- start
pm2 save
pm2 startup systemd -u $USER --hp $HOME | tail -1 | bash || true

# 5. Nginx reverse proxy
echo "==> Configuring nginx for $DOMAIN…"
cat > /etc/nginx/sites-available/acclaira << NGINX
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    client_max_body_size 20m;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
NGINX
ln -sf /etc/nginx/sites-available/acclaira /etc/nginx/sites-enabled/acclaira
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo ""
echo "=================================================="
echo "  ✅ Acclaira is running at http://$DOMAIN"
echo "  Next steps:"
echo "  1. Free HTTPS:  apt install -y certbot python3-certbot-nginx"
echo "                  certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo "  2. Register with admin@$DOMAIN to get the Admin panel"
echo "  3. Add your API keys in Dashboard → Settings"
echo "  Logs:    pm2 logs acclaira"
echo "  Restart: pm2 restart acclaira"
echo "=================================================="
