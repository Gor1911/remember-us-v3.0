#!/bin/bash
# First-time deploy script for Remember US v3.0
# Run on VPS: bash deploy.sh
set -e

REPO="https://github.com/Gor1911/remember-us-v3.0.git"
APP_DIR="/opt/remember-us"

echo "==> Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi

if ! command -v docker &> /dev/null || ! docker compose version &> /dev/null; then
    echo "Installing Docker Compose plugin..."
    apt-get update -qq && apt-get install -y docker-compose-plugin
fi

echo "==> Cloning / updating repo..."
if [ -d "$APP_DIR" ]; then
    git -C "$APP_DIR" pull
else
    git clone "$REPO" "$APP_DIR"
fi

cd "$APP_DIR/infra"

echo "==> Checking .env.prod..."
if [ ! -f .env.prod ]; then
    cp .env.prod.example .env.prod
    echo ""
    echo "  [!] .env.prod created from example."
    echo "  [!] Edit /opt/remember-us/infra/.env.prod before continuing:"
    echo "      - Set POSTGRES_PASSWORD"
    echo "      - Set SECRET_KEY (50 random chars)"
    echo ""
    echo "  Run after editing:  cd /opt/remember-us/infra && bash deploy.sh"
    exit 0
fi

echo "==> Building and starting containers..."
docker compose down --remove-orphans
docker compose build --no-cache
docker compose up -d

echo "==> Creating Django superuser (if not exists)..."
docker compose exec -T backend python manage.py shell -c "
from apps.users.models import User
if not User.objects.filter(email='admin@remember-us.local').exists():
    u = User.objects.create_superuser('admin@remember-us.local', 'Admin1234!')
    print('Superuser created: admin@remember-us.local / Admin1234!')
else:
    print('Superuser already exists.')
"

echo ""
echo "======================================"
echo "  Deploy complete!"
echo "  Site:  http://188.214.107.148"
echo "  Admin: http://188.214.107.148/admin"
echo "  Login: admin@remember-us.local"
echo "  Pass:  Admin1234!"
echo "  (change password after first login)"
echo "======================================"
