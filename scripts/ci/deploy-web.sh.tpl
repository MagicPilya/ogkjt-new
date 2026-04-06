#!/usr/bin/env bash
set -e
APP_DIR='__REMOTE_APP_DIR__'
ARCHIVE='__REMOTE_ARCHIVE__'
cd "$APP_DIR"
rel=_incoming_$(date +%s)
mkdir -p "$rel"
tar -xzf "$ARCHIVE" -C "$rel"
if [ -d .next ]; then mv .next .next_old_$(date +%s) || true; fi
if [ -d public ]; then mv public public_old_$(date +%s) || true; fi
if [ -d "$rel/.next" ]; then mv "$rel/.next" .next; fi
if [ -d "$rel/public" ]; then mv "$rel/public" public; fi
cp -f "$rel/server.js" ./server.js 2>/dev/null || true
cp -f "$rel/package.json" ./package.json 2>/dev/null || true
cp -f "$rel/package-lock.json" ./package-lock.json
# CloudLinux nodeenv may not have bin/activate; set PATH to selected Node bin
export PATH=/home/__USER__/nodevenv/apps/ogkjt-web/__NODE_MAJOR__/bin:$PATH
LOCK_HASH_FILE=/home/__USER__/apps/ogkjt-web/.last-lock-hash
NEW_HASH=$(sha256sum package-lock.json | awk '{print $1}')
OLD_HASH=$(cat "$LOCK_HASH_FILE" 2>/dev/null || true)
if [ "$NEW_HASH" != "$OLD_HASH" ]; then npm ci --omit=dev --no-audit --no-fund && echo "$NEW_HASH" > "$LOCK_HASH_FILE"; else echo "Dependencies unchanged, skip npm ci"; fi
mkdir -p tmp
touch tmp/restart.txt
rm -f "$ARCHIVE"
rm -rf "$rel"
