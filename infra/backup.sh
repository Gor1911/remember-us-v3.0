#!/bin/bash
# Daily backup of PostgreSQL and uploaded media — run from cron (installed by bootstrap.sh).
# Restore DB:    gunzip -c db-<ts>.sql.gz | docker compose --env-file .env.prod exec -T db sh -c 'psql -U "$POSTGRES_USER" "$POSTGRES_DB"'
# Restore media: docker compose --env-file .env.prod exec -T backend tar xzf - -C /app < media-<ts>.tar.gz
set -euo pipefail

cd "$(dirname "$0")"

DC="docker compose --env-file .env.prod"
BACKUP_DIR="/opt/remember-us/backups"
KEEP_DAYS=7
TS="$(date +%Y%m%d-%H%M%S)"

mkdir -p "$BACKUP_DIR"

$DC exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' | gzip > "$BACKUP_DIR/db-$TS.sql.gz"
$DC exec -T backend tar czf - -C /app mediafiles > "$BACKUP_DIR/media-$TS.tar.gz"

find "$BACKUP_DIR" -maxdepth 1 \( -name 'db-*.sql.gz' -o -name 'media-*.tar.gz' \) -mtime +"$KEEP_DAYS" -delete

echo "Backup $TS done: $(du -sh "$BACKUP_DIR" | cut -f1) total in $BACKUP_DIR"
