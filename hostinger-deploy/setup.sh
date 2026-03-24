#!/bin/bash
# ==========================================================
# سكريبت إعداد سيرفر Hostinger — وكالة شويعر
# شغّله مرة واحدة بعد إنشاء الـ VPS
# الأمر: bash setup.sh
# ==========================================================

set -e

echo "==> تحديث النظام..."
apt-get update && apt-get upgrade -y

echo "==> تثبيت الأدوات الأساسية..."
apt-get install -y curl git nginx certbot python3-certbot-nginx ufw postgresql postgresql-contrib

echo "==> تثبيت Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

echo "==> تثبيت pnpm وPM2..."
npm install -g pnpm pm2
pm2 startup systemd -u root --hp /root

echo "==> إنشاء مجلدات المشروع..."
mkdir -p /var/www/chouiaar/api
mkdir -p /var/www/chouiaar/frontend
mkdir -p /var/log/chouiaar

echo "==> إعداد قاعدة البيانات PostgreSQL..."
sudo -u postgres psql <<SQL
CREATE USER chouiaar_user WITH PASSWORD 'CHANGE_THIS_PASSWORD';
CREATE DATABASE chouiaar_db OWNER chouiaar_user;
GRANT ALL PRIVILEGES ON DATABASE chouiaar_db TO chouiaar_user;
SQL

echo "==> استيراد قاعدة البيانات..."
if [ -f "./chouiaar_db_backup.sql" ]; then
    sudo -u postgres psql chouiaar_db < ./chouiaar_db_backup.sql
    echo "تم استيراد قاعدة البيانات بنجاح"
else
    echo "تحذير: ملف chouiaar_db_backup.sql غير موجود، استورد يدوياً"
fi

echo "==> إعداد Nginx..."
cp ./nginx.conf /etc/nginx/sites-available/chouiaar
ln -sf /etc/nginx/sites-available/chouiaar /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "==> إعداد Firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "==> تثبيت شهادة SSL..."
certbot --nginx -d chouiaartravel.com -d www.chouiaartravel.com --non-interactive --agree-tos -m chouiaartravelagency@gmail.com

echo ""
echo "=============================="
echo "الإعداد الأساسي اكتمل!"
echo "الخطوات التالية:"
echo "1. ارفع ملف .env.production إلى /var/www/chouiaar/"
echo "2. شغّل: bash deploy.sh"
echo "=============================="
