#!/bin/bash
# ====================================================
#  Chouiaar Travel Agency — Server Setup Script
#  Run as root on Ubuntu 22.04
# ====================================================
set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }

echo ""
echo "================================================"
echo "  Chouiaar Travel Agency — VPS Setup"
echo "  IP: $(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')"
echo "================================================"
echo ""

# ── 1. System Update ──────────────────────────────
log "Updating system..."
apt update -y && apt upgrade -y
apt install -y curl wget git ufw nginx postgresql postgresql-contrib \
  certbot python3-certbot-nginx build-essential

# ── 2. Node.js 20 + pnpm ─────────────────────────
log "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2 pnpm
log "Node.js $(node -v) installed"

# ── 3. PostgreSQL Setup ───────────────────────────
log "Setting up PostgreSQL..."
DB_NAME="chouiaar"
DB_USER="chouiaar_user"
DB_PASS=$(openssl rand -base64 24 | tr -dc 'A-Za-z0-9' | head -c 32)

sudo -u postgres psql <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DB_USER') THEN
    CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';
  END IF;
END
\$\$;
SELECT 'CREATE DATABASE $DB_NAME OWNER $DB_USER'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
SQL

# Save DB credentials
cat > /root/.chouiaar_db_credentials <<CREDS
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASS=$DB_PASS
DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME
CREDS
chmod 600 /root/.chouiaar_db_credentials
log "Database created — credentials saved to /root/.chouiaar_db_credentials"

# ── 4. Clone & Build Project ─────────────────────
log "Cloning project from GitHub..."
rm -rf /var/www/chouiaar-src
git clone https://github.com/drisidris96/Chouiaartravel-project.git /var/www/chouiaar-src
cd /var/www/chouiaar-src

log "Installing dependencies..."
pnpm install

log "Building frontend..."
pnpm --filter @workspace/travel-agency run build

log "Building backend..."
pnpm --filter @workspace/api-server run build

# ── 5. Deploy files ───────────────────────────────
log "Deploying files..."
mkdir -p /var/www/chouiaar/{frontend,backend}
cp -r /var/www/chouiaar-src/artifacts/travel-agency/dist/public/* /var/www/chouiaar/frontend/
cp -r /var/www/chouiaar-src/artifacts/api-server/dist/* /var/www/chouiaar/backend/
cp -r /var/www/chouiaar-src/artifacts/api-server/node_modules /var/www/chouiaar/backend/

# ── 6. Environment & PM2 ─────────────────────────
log "Configuring environment..."
SESSION_SECRET=$(openssl rand -hex 32)

cat > /var/www/chouiaar/ecosystem.config.cjs <<PM2
module.exports = {
  apps: [{
    name: "chouiaar-api",
    script: "/var/www/chouiaar/backend/index.mjs",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "512M",
    env: {
      NODE_ENV: "production",
      PORT: 3000,
      DATABASE_URL: "postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME",
      SESSION_SECRET: "$SESSION_SECRET",
      SMTP_HOST: "mail.privateemail.com",
      SMTP_PORT: "587",
      SMTP_USER: "noreply@chouiaartravel.com",
      SMTP_PASS: "YOUR_EMAIL_PASSWORD_HERE",
      SMTP_FROM: "noreply@chouiaartravel.com",
    }
  }]
};
PM2

# ── 7. Database Migration ─────────────────────────
log "Running database migrations..."
cd /var/www/chouiaar-src
DATABASE_URL="postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME" \
  pnpm --filter @workspace/db run push 2>/dev/null || \
  warn "Migration skipped — may need manual run"

# ── 8. Nginx ──────────────────────────────────────
log "Configuring Nginx..."
cat > /etc/nginx/sites-available/chouiaartravel.com <<NGINX
server {
    listen 80;
    server_name chouiaartravel.com www.chouiaartravel.com _;

    root /var/www/chouiaar/frontend;
    index index.html;

    location /api/ {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINX

ln -sf /etc/nginx/sites-available/chouiaartravel.com /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# ── 9. Start App ──────────────────────────────────
log "Starting application with PM2..."
cd /var/www/chouiaar
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null | grep "sudo\|systemctl" | bash || true

# ── 10. Firewall ──────────────────────────────────
log "Configuring firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# ── Done ──────────────────────────────────────────
echo ""
echo "================================================"
echo -e "  ${GREEN}✅ Installation Complete!${NC}"
echo "================================================"
echo ""
echo "  🌐 Website: http://$(curl -s ifconfig.me 2>/dev/null)"
echo "  🔑 Admin:   admin@chouiaar.com"
echo "  🔑 Pass:    germany@123GERMANY1234"
echo ""
echo "  ⚠️  Add email password:"
echo "  nano /var/www/chouiaar/ecosystem.config.cjs"
echo "  pm2 restart chouiaar-api"
echo ""
echo "  📋 Useful commands:"
echo "  pm2 status              → app status"
echo "  pm2 logs chouiaar-api   → view logs"
echo "  pm2 restart chouiaar-api→ restart"
echo ""
if [ -n "$(which certbot 2>/dev/null)" ]; then
  echo "  🔒 To enable HTTPS (after pointing domain to this IP):"
  echo "  certbot --nginx -d chouiaartravel.com -d www.chouiaartravel.com"
fi
echo "================================================"
