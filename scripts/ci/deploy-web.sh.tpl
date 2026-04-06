#!/usr/bin/env bash
set -Eeuo pipefail
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
if [ ! -f "$rel/server.js" ]; then
  echo "Missing server.js in release artifact" >&2
  exit 1
fi
cp -f "$rel/server.js" ./server.js
cp -f "$rel/package.json" ./package.json 2>/dev/null || true
cp -f "$rel/package-lock.json" ./package-lock.json

# Detect actual CloudLinux venv path (nodevenv/nodeenv, requested or any installed major).
APP_VENV_DIR=$(ls -d "/home/__USER__/nodevenv/apps/ogkjt-web/__NODE_MAJOR__" "/home/__USER__/nodeenv/apps/ogkjt-web/__NODE_MAJOR__" 2>/dev/null | head -n1 || true)
if [ -z "$APP_VENV_DIR" ]; then
  APP_VENV_DIR=$(ls -d "/home/__USER__/nodevenv/apps/ogkjt-web"/[0-9]* "/home/__USER__/nodeenv/apps/ogkjt-web"/[0-9]* 2>/dev/null | head -n1 || true)
fi
if [ -z "$APP_VENV_DIR" ]; then
  echo "Missing Node venv for ogkjt-web" >&2
  exit 1
fi
VENV_BIN="$APP_VENV_DIR/bin"
VENV_LIB="$APP_VENV_DIR/lib/node_modules"

# CloudLinux Node.js Selector expects node_modules symlink in app root.
if [ -e node_modules ] && [ ! -L node_modules ]; then rm -rf node_modules; fi
mkdir -p "$VENV_LIB"
ln -sfn "$VENV_LIB" node_modules

# nodevenv often has no bin/activate; use bin directory directly.
export PATH="$VENV_BIN:$PATH"
LOCK_HASH_FILE=/home/__USER__/apps/ogkjt-web/.last-lock-hash
NEW_HASH=$(sha256sum package-lock.json | awk '{print $1}')
OLD_HASH=$(cat "$LOCK_HASH_FILE" 2>/dev/null || true)
if [ "$NEW_HASH" != "$OLD_HASH" ]; then npm ci --omit=dev --no-audit --no-fund && echo "$NEW_HASH" > "$LOCK_HASH_FILE"; else echo "Dependencies unchanged, skip npm ci"; fi
mkdir -p tmp
touch tmp/restart.txt
rm -f "$ARCHIVE"
rm -rf "$rel"
