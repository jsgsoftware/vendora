# start.sh — One-liner to clone InsForge and spin up the full stack
#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# 1. Clone InsForge OSS if not present
if [ ! -d "insforge/.git" ]; then
    echo "[vendora] Cloning InsForge OSS repository..."
    git clone --depth 1 https://github.com/insforge/insforge.git insforge
else
    echo "[vendora] InsForge OSS already present."
fi

# 2. Ensure .env exists
if [ ! -f ".env" ]; then
    echo "[vendora] Creating .env from .env.docker ..."
    cp .env.docker .env
fi

# 3. Build and start everything
echo "[vendora] Building and starting Docker services..."
docker compose up -d --build

echo ""
echo "[vendora] Waiting for InsForge to finish migrations (this may take 40-60s)..."
ready=false
attempts=0
while [ "$ready" = false ] && [ $attempts -lt 60 ]; do
    sleep 2
    if curl -sf http://localhost:7130/health > /dev/null 2>&1; then
        ready=true
    fi
    attempts=$((attempts + 1))
    if [ $((attempts % 5)) -eq 0 ]; then
        echo "  ...still waiting (attempt $attempts/60)..."
    fi
done

if [ "$ready" = false ]; then
    echo "[vendora] InsForge did not start in time. Showing last logs:"
    docker compose logs --tail=60 insforge
    exit 1
fi

echo ""
echo "[vendora] InsForge is ready. Applying Vendora schema migrations..."
node scripts/apply-vendora-migrations.js

echo ""
echo "[vendora] Seeding demo data..."
node scripts/seed-vendora.mjs

echo ""
echo "============================================================"
echo "  Vendora is ready with demo data!"
echo "============================================================"
echo "  Vendora App        -> http://localhost:3000"
echo "  InsForge Dashboard -> http://localhost:7131"
echo "  InsForge API       -> http://localhost:7130"
echo "  PostgREST API      -> http://localhost:5430"
echo ""
echo "  DEMO ACCOUNTS (sign in at /auth/signin):"
echo "    Admin    : admin@demo.com    / admin123"
echo "    Vendor   : vendor@demo.com   / vendor123"
echo "    Customer : user@demo.com      / user123"
echo ""
echo "  Products seeded: 5 (iPhone, MacBook, Nike, Sofa, Headphones)"
echo "  Storage bucket: images (public)"
echo ""
echo "  View logs:  docker compose logs -f"
echo "  Stop:       docker compose down"
echo "  Full reset: docker compose down -v"
echo "============================================================"
