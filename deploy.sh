#!/bin/bash
set -e

REPO_DIR="/var/www/chouiaar/repo"
FRONTEND_DIR="/var/www/chouiaar/frontend"
ENV_FILE="/var/www/chouiaar/.env.production"

echo "=== [1/5] سحب آخر تحديثات ==="
cd "$REPO_DIR"
git pull origin master

echo "=== [2/5] تثبيت الحزم ==="
pnpm install --frozen-lockfile

echo "=== [3/5] بناء الـ Frontend ==="
pnpm --filter @workspace/travel-agency run build

echo "=== [4/5] نسخ ملفات الـ Frontend ==="
rm -rf "$FRONTEND_DIR"/*
cp -r "$REPO_DIR/artifacts/travel-agency/dist/public/." "$FRONTEND_DIR/"

echo "=== [5/5] بناء وإعادة تشغيل الـ API ==="
pnpm --filter @workspace/api-server run build
export $(cat "$ENV_FILE" | grep -v '#' | xargs)
pm2 delete all
pm2 start "$REPO_DIR/hostinger-deploy/ecosystem.config.js"
pm2 save

echo ""
echo "✅ تم النشر بنجاح!"
pm2 list
