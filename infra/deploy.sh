#!/bin/bash
# Release script for Remember US v3.0 — runs on the VPS.
# Called by CI after images are pushed to GHCR; also usable by hand for rollback:
#   cd /opt/remember-us/infra && bash deploy.sh <commit-sha>
set -euo pipefail

cd "$(dirname "$0")"

export IMAGE_TAG="${1:-latest}"
DC="docker compose --env-file .env.prod"
BACKUP_DIR="/opt/remember-us/backups"

if [ ! -f .env.prod ]; then
    echo "[!] infra/.env.prod is missing — run bootstrap.sh first." >&2
    exit 1
fi

echo "==> Deploying image tag: $IMAGE_TAG"

mkdir -p "$BACKUP_DIR"
if [ -n "$($DC ps --status running -q db)" ]; then
    echo "==> Pre-deploy database backup..."
    $DC exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' \
        | gzip > "$BACKUP_DIR/pre-deploy-$(date +%Y%m%d-%H%M%S)-${IMAGE_TAG:0:7}.sql.gz"
    # Keep the 10 most recent pre-deploy dumps
    ls -1t "$BACKUP_DIR"/pre-deploy-*.sql.gz 2>/dev/null | tail -n +11 | xargs -r rm -f
else
    echo "==> Database not running yet (first deploy) — skipping backup."
fi

echo "==> Pulling images..."
$DC pull backend celery frontend

echo "==> Applying migrations..."
$DC run --rm backend python manage.py migrate --noinput

echo "==> Starting containers..."
$DC up -d --no-build --remove-orphans

echo "==> Smoke check..."
for url in http://localhost/ http://localhost/admin/login/; do
    ok=""
    for _ in $(seq 1 30); do
        if curl -fsS -o /dev/null "$url"; then ok=1; break; fi
        sleep 2
    done
    if [ -z "$ok" ]; then
        echo "[!] $url did not respond with 2xx within 60s" >&2
        $DC ps
        $DC logs --tail 50 backend frontend nginx
        exit 1
    fi
    echo "    OK  $url"
done

docker image prune -f > /dev/null

echo "==> Deploy of $IMAGE_TAG complete."
