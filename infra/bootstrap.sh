#!/bin/bash
# One-time VPS setup for Remember US v3.0 (Ubuntu/Debian, run as root).
#
#   scp -r infra root@<VPS_IP>:/opt/remember-us/
#   ssh root@<VPS_IP> "bash /opt/remember-us/infra/bootstrap.sh '<CI public key>'"
#
# Safe to re-run.
set -euo pipefail

CI_PUBKEY="${1:-}"
APP_DIR="/opt/remember-us"
DEPLOY_USER="deploy"

if [ "$(id -u)" -ne 0 ]; then
    echo "Run as root." >&2
    exit 1
fi

echo "==> System packages..."
apt-get update -qq
apt-get install -y -qq curl ufw cron > /dev/null

echo "==> Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker
docker compose version > /dev/null

echo "==> Swap (Next.js/Postgres headroom on small VPS)..."
SWAP_MB=$(free -m | awk '/^Swap:/ {print $2}')
if [ "$SWAP_MB" -lt 1500 ] && [ ! -f /swapfile-remember-us ]; then
    fallocate -l 2G /swapfile-remember-us
    chmod 600 /swapfile-remember-us
    mkswap /swapfile-remember-us > /dev/null
    swapon /swapfile-remember-us
    grep -q '^/swapfile-remember-us' /etc/fstab || echo '/swapfile-remember-us none swap sw 0 0' >> /etc/fstab
fi

echo "==> Firewall..."
ufw allow OpenSSH > /dev/null
ufw allow 80/tcp > /dev/null
ufw --force enable > /dev/null

echo "==> Deploy user..."
if ! id "$DEPLOY_USER" &> /dev/null; then
    useradd -m -s /bin/bash "$DEPLOY_USER"
fi
usermod -aG docker "$DEPLOY_USER"
install -d -m 700 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh"
AUTH_KEYS="/home/$DEPLOY_USER/.ssh/authorized_keys"
touch "$AUTH_KEYS"
if [ -n "$CI_PUBKEY" ] && ! grep -qF "$CI_PUBKEY" "$AUTH_KEYS"; then
    echo "$CI_PUBKEY" >> "$AUTH_KEYS"
fi
chown "$DEPLOY_USER:$DEPLOY_USER" "$AUTH_KEYS"
chmod 600 "$AUTH_KEYS"

echo "==> App directory..."
mkdir -p "$APP_DIR/infra" "$APP_DIR/backups"
chown -R "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR"

echo "==> Daily backup cron (03:00)..."
CRON_LINE="0 3 * * * cd $APP_DIR/infra && bash backup.sh >> $APP_DIR/backups/backup.log 2>&1"
( crontab -u "$DEPLOY_USER" -l 2>/dev/null | grep -vF "backup.sh" || true; echo "$CRON_LINE" ) | crontab -u "$DEPLOY_USER" -

ENV_FILE="$APP_DIR/infra/.env.prod"
if [ ! -f "$ENV_FILE" ]; then
    cp "$APP_DIR/infra/.env.prod.example" "$ENV_FILE"
    chown "$DEPLOY_USER:$DEPLOY_USER" "$ENV_FILE"
    chmod 600 "$ENV_FILE"
    echo ""
    echo "  [!] Created $ENV_FILE from the example — fill in every CHANGE_ME / YOUR_VPS_IP."
    echo "      Generate SECRET_KEY:  openssl rand -base64 48"
fi

echo ""
echo "======================================"
echo "  Bootstrap complete."
echo "  Next:"
echo "   1. Edit $ENV_FILE"
echo "   2. Push to main — CI builds images and runs deploy.sh"
echo "   3. Create the admin once:"
echo "      cd $APP_DIR/infra && docker compose --env-file .env.prod exec backend python manage.py createsuperuser"
echo "======================================"
