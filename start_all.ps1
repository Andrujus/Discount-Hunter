#!/usr/bin/env pwsh
# Discount-Hunter - Complete Full Stack Startup Script
# Usage: .\start_all.ps1

$ErrorActionPreference = "SilentlyContinue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Discount-Hunter - Full Stack Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$DiscountHunterRoot = Join-Path $ScriptDir "Discount-Hunter"
$BackendDir = Join-Path $DiscountHunterRoot "Back-end"
$FrontendDir = Join-Path $DiscountHunterRoot "Front-end"

# Step 1: Kill existing processes
Write-Host "[1/4] Stopping any running processes..." -ForegroundColor Yellow
Get-Process -Name python,node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "OK - Processes stopped" -ForegroundColor Green
Write-Host ""

# Step 2: Start Backend
Write-Host "[2/4] Starting Backend Server on http://127.0.0.1:3000" -ForegroundColor Yellow
Push-Location $BackendDir
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python server_foreground.py" -WindowStyle Minimized
Pop-Location
Start-Sleep -Seconds 3
Write-Host "OK - Backend started" -ForegroundColor Green
Write-Host ""

# Step 3: Start Frontend
Write-Host "[3/4] Starting Frontend on http://localhost:8081" -ForegroundColor Yellow
Push-Location $FrontendDir
$env:EXPO_NO_TELEMETRY = '1'
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npx expo start --web" -WindowStyle Minimized
Pop-Location
Start-Sleep -Seconds 2
Write-Host "OK - Frontend started" -ForegroundColor Green
Write-Host ""

# Step 4: Verify services
Write-Host "[4/4] Verifying services..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

$backendHealthy = $false
$frontendHealthy = $false

try {
    $backendResponse = Invoke-WebRequest -Uri "http://127.0.0.1:3000/healthz" -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($backendResponse.StatusCode -eq 200) {
        $backendHealthy = $true
    }
} catch {}

try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:8081" -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($frontendResponse.StatusCode -eq 200) {
        $frontendHealthy = $true
    }
} catch {}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Startup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services:" -ForegroundColor Yellow
Write-Host "  Backend:  $(if ($backendHealthy) { 'OK' } else { 'Starting...' }) http://127.0.0.1:3000" -ForegroundColor $(if ($backendHealthy) { 'Green' } else { 'Yellow' })
Write-Host "  Frontend: $(if ($frontendHealthy) { 'OK' } else { 'Starting...' }) http://localhost:8081" -ForegroundColor $(if ($frontendHealthy) { 'Green' } else { 'Yellow' })
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Open http://localhost:8081 in your browser"
Write-Host "  2. Click 'Get Started' to begin scanning products"
Write-Host "  3. Minimize the backend/frontend windows to keep them running"
Write-Host ""
