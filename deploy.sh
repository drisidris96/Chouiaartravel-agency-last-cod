#!/bin/bash
set -e

REPO_DIR="/var/www/chouiaar/repo"
FRONTEND_DIR="/var/www/chouiaar/frontend"
API_DIR="/var/www/chouiaar/api"
ENV_FILE="/var/www/chouiaar/.env.production"

echo "=== [1/6] سحب آخر تحديثات ==="
cd "$REPO_DIR"
git pull origin master

echo "=== [2/6] بناء الـ Frontend ==="
pnpm --filter @workspace/travel-agency run build

echo "=== [3/6] نسخ ملفات الـ Frontend ==="
rm -rf "$FRONTEND_DIR"/*
cp -r "$REPO_DIR/artifacts/travel-agency/dist/public/." "$FRONTEND_DIR/"

echo "=== [4/6] بناء الـ API ==="
pnpm --filter @workspace/api-server run build

echo "=== [5/6] نسخ ملفات الـ API ==="
mkdir -p "$API_DIR/dist"
rm -rf "$API_DIR/dist"/*
cp -r "$REPO_DIR/artifacts/api-server/dist/." "$API_DIR/dist/"

echo "=== [6/6] إعادة تشغيل الـ API ==="
export $(cat "$ENV_FILE" | grep -v '#' | xargs)
pm2 restart chouiaar-api

echo ""
echo "✅ تم النشر بنجاح!"
pm2 list
