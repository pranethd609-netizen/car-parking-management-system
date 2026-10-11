# ParkFlow Pro - PowerShell Launcher
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  ParkFlow Pro - Car Parking Management System" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path (Join-Path $scriptDir "backend")

# Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/"
    pause
    exit 1
}

# Install dependencies if missing
if (-not (Test-Path "node_modules")) {
    Write-Host "[INFO] Installing backend dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "[INFO] Launching ParkFlow Pro at http://localhost:5000 ..." -ForegroundColor Green
Start-Process "http://localhost:5000"

node server.js
