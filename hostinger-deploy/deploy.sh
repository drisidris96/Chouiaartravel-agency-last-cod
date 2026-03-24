#!/bin/bash
# ==========================================================
# سكريبت النشر — شغّله في كل مرة تريد تحديث الموقع
# الأمر: bash deploy.sh
# ==========================================================

set -e

PROJECT_DIR="/var/www/chouiaar"
REPO_DIR="$PROJECT_DIR/repo"

echo "==> جلب آخر تحديثات الكود..."
if [ -d "$REPO_DIR" ]; then
    cd "$REPO_DIR" && git pull
else
    # أول مرة — استنسخ من GitHub (ضع رابط الـ repo هنا)
    git clone https://github.com/drisidris96/Chouiaartravel-project.git "$REPO_DIR"
fi

cd "$REPO_DIR"

echo "==> تثبيت الحزم..."
pnpm install --frozen-lockfile

echo "==> بناء الواجهة الأمامية..."
pnpm --filter @workspace/travel-agency run build

echo "==> بناء الخادم الخلفي..."
pnpm --filter @workspace/api-server run build

echo "==> نسخ الملفات..."
cp -r artifacts/travel-agency/dist/* "$PROJECT_DIR/frontend/"
cp -r artifacts/api-server/dist "$PROJECT_DIR/api/"
cp -r artifacts/api-server/node_modules "$PROJECT_DIR/api/" 2>/dev/null || true
cp hostinger-deploy/ecosystem.config.js "$PROJECT_DIR/"

echo "==> إعادة تشغيل الخادم..."
cd "$PROJECT_DIR"
pm2 startOrRestart ecosystem.config.js --env production
pm2 save

echo ""
echo "=============================="
echo "تم النشر بنجاح! الموقع يعمل الآن"
echo "للتحقق: pm2 status"
echo "للسجلات: pm2 logs chouiaar-api"
echo "=============================="
