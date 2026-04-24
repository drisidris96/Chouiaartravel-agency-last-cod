#!/bin/bash
set -e

REPO_DIR="/var/www/chouiaar/repo"
FRONTEND_DIR="/var/www/chouiaar/frontend"
FRONTEND_TMP="/var/www/chouiaar/frontend-tmp"
ENV_FILE="/var/www/chouiaar/.env.production"

echo "=== [1/6] سحب آخر تحديثات ==="
cd "$REPO_DIR"
git pull origin master
echo "✔ آخر commit: $(git log -1 --oneline)"

echo ""
echo "=== [2/6] تثبيت الحزم ==="
pnpm install --frozen-lockfile

echo ""
echo "=== [3/6] بناء الـ Frontend ==="
pnpm --filter @workspace/travel-agency run build
echo "✔ Frontend جاهز"

echo ""
echo "=== [4/6] نشر الـ Frontend بدون توقف ==="
rm -rf "$FRONTEND_TMP"
cp -r "$REPO_DIR/artifacts/travel-agency/dist/public/." "$FRONTEND_TMP/"
rsync -a --delete "$FRONTEND_TMP/" "$FRONTEND_DIR/"
rm -rf "$FRONTEND_TMP"
echo "✔ الملفات منقولة إلى $FRONTEND_DIR"

echo ""
echo "=== [5/6] بناء الـ API ==="
pnpm --filter @workspace/api-server run build
echo "✔ API جاهز"

echo ""
echo "=== [6/6] إعادة تشغيل الـ API مع تحميل المتغيرات ==="
pm2 delete chouiaar-api 2>/dev/null || true
pm2 start "$REPO_DIR/hostinger-deploy/ecosystem.config.js"
pm2 save

echo ""
echo "✅ تم النشر بنجاح!"
echo "🔗 الموقع: https://chouiaartravel.com"
echo "📄 صفحة المتابعة: https://chouiaartravel.com/visa-track"
pm2 list
