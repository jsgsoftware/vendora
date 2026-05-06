# start.ps1 — One-liner to clone InsForge and spin up the full stack
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# 1. Clone InsForge OSS if not present
if (-not (Test-Path "insforge\.git")) {
    Write-Host "[vendora] Cloning InsForge OSS repository..."
    git clone --depth 1 https://github.com/insforge/insforge.git insforge
} else {
    Write-Host "[vendora] InsForge OSS already present."
}

# 2. Ensure .env exists
if (-not (Test-Path ".env")) {
    Write-Host "[vendora] Creating .env from .env.docker ..."
    Copy-Item .env.docker .env
}

# 3. Build and start everything
Write-Host "[vendora] Building and starting Docker services..."
docker compose up -d --build

Write-Host ""
Write-Host "[vendora] Waiting for InsForge to finish migrations (this may take 40-60s)..."
$ready = $false
$attempts = 0
while (-not $ready -and $attempts -lt 60) {
    Start-Sleep -Seconds 2
    try {
        $t = New-Object System.Net.Sockets.TcpClient
        $t.Connect("localhost", 7130)
        $t.Close()
        $ready = $true
    } catch {}
    $attempts++
    if ($attempts % 5 -eq 0) {
        Write-Host "  ...still waiting (attempt $attempts/60)..."
    }
}

if (-not $ready) {
    Write-Host "[vendora] InsForge did not start in time. Showing last logs:"
    docker compose logs --tail=60 insforge
    exit 1
}

Write-Host ""
Write-Host "[vendora] InsForge is ready. Applying Vendora schema migrations..."
node scripts/apply-vendora-migrations.js

Write-Host ""
Write-Host "[vendora] Seeding demo data..."
node scripts/seed-vendora.mjs

Write-Host ""
Write-Host "============================================================"
Write-Host "  Vendora is ready with demo data!"
Write-Host "============================================================"
Write-Host "  Vendora App        -> http://localhost:3000"
Write-Host "  InsForge Dashboard -> http://localhost:7131"
Write-Host "  InsForge API       -> http://localhost:7130"
Write-Host "  PostgREST API      -> http://localhost:5430"
Write-Host ""
Write-Host "  DEMO ACCOUNTS (sign in at /auth/signin):"
Write-Host "    Admin    : admin@demo.com    / admin123"
Write-Host "    Vendor   : vendor@demo.com  / vendor123"
Write-Host "    Customer : user@demo.com     / user123"
Write-Host ""
Write-Host "  Products seeded: 5 (iPhone, MacBook, Nike, Sofa, Headphones)"
Write-Host "  Storage bucket: images (public)"
Write-Host ""
Write-Host "  View logs:  docker compose logs -f"
Write-Host "  Stop:       docker compose down"
Write-Host "  Full reset: docker compose down -v"
Write-Host "============================================================"
