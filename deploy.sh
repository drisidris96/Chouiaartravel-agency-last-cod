#!/bin/bash
set -e

REPO_DIR="/var/www/chouiaar/repo"
FRONTEND_DIR="/var/www/chouiaar/frontend"
FRONTEND_TMP="/var/www/chouiaar/frontend-tmp"
ENV_FILE="/var/www/chouiaar/.env.production"

echo "=== [1/5] سحب آخر تحديثات ==="
cd "$REPO_DIR"
git pull origin master

echo "=== [2/5] بناء الـ Frontend ==="
pnpm --filter @workspace/travel-agency run build

echo "=== [3/5] نشر الـ Frontend بدون توقف ==="
rm -rf "$FRONTEND_TMP"
cp -r "$REPO_DIR/artifacts/travel-agency/dist/public/." "$FRONTEND_TMP/"
rsync -a --delete "$FRONTEND_TMP/" "$FRONTEND_DIR/"
rm -rf "$FRONTEND_TMP"

echo "=== [4/5] بناء الـ API ==="
pnpm --filter @workspace/api-server run build

echo "=== [5/5] إعادة تشغيل الـ API بدون توقف ==="
export $(cat "$ENV_FILE" | grep -v '#' | xargs)
pm2 reload "$REPO_DIR/hostinger-deploy/ecosystem.config.js" --update-env 2>/dev/null || \
  pm2 start "$REPO_DIR/hostinger-deploy/ecosystem.config.js"
pm2 save

echo ""
echo "✅ تم النشر بدون أي توقف!"
pm2 list
