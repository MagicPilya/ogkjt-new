#!/usr/bin/env bash
set -e
cd /home/__USER__/apps/ogkjt-api
rel=_incoming_api_$(date +%s)
mkdir -p "$rel"
tar -xzf "__REMOTE_ARCHIVE__" -C "$rel"
cp -a "$rel/backend/." /home/__USER__/apps/ogkjt-api/
# CloudLinux nodeenv may not have bin/activate; set PATH to selected Node bin
export PATH=/home/__USER__/nodevenv/apps/ogkjt-api/__NODE_MAJOR__/bin:$PATH
LOCK_HASH_FILE=/home/__USER__/apps/ogkjt-api/.last-lock-hash
NEW_HASH=$(sha256sum package-lock.json | awk '{print $1}')
OLD_HASH=$(cat "$LOCK_HASH_FILE" 2>/dev/null || true)
if [ "$NEW_HASH" != "$OLD_HASH" ]; then npm_config_build_from_source=true npm ci --omit=dev --no-audit --no-fund && echo "$NEW_HASH" > "$LOCK_HASH_FILE"; else echo "Dependencies unchanged, skip npm ci"; fi
mkdir -p /home/__USER__/apps/ogkjt-api/tmp
touch /home/__USER__/apps/ogkjt-api/tmp/restart.txt
rm -f "__REMOTE_ARCHIVE__"
rm -rf "$rel"
