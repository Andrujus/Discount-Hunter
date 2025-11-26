#!/usr/bin/env pwsh
# Discount-Hunter - Complete Full Stack Startup Script
# Usage: .\start_all.ps1

$ErrorActionPreference = "SilentlyContinue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Discount-Hunter - Full Stack Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get script directory and resolve project root (supports both repo layouts)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
# Prefer `Discount-Hunter-app` folder if present, then `Discount-Hunter`, otherwise use script dir
$possibleApp = Join-Path $ScriptDir "Discount-Hunter-app"
$possibleRoot = Join-Path $ScriptDir "Discount-Hunter"
if (Test-Path $possibleApp) {
    $ProjectRoot = $possibleApp
} elseif (Test-Path $possibleRoot) {
    $ProjectRoot = $possibleRoot
} else {
    $ProjectRoot = $ScriptDir
}

$BackendDir = Join-Path $ProjectRoot "Back-end"
$FrontendDir = Join-Path $ProjectRoot "Front-end"

# Step 1: Kill existing processes
Write-Host "[1/4] Stopping any running processes..." -ForegroundColor Yellow
Get-Process -Name python,node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "OK - Processes stopped" -ForegroundColor Green
Write-Host ""

# Step 2: Start Backend
Write-Host "[2/4] Starting Backend Server on http://127.0.0.1:3000" -ForegroundColor Yellow
if (-not (Test-Path $BackendDir)) {
    Write-Host "Backend directory not found: $BackendDir" -ForegroundColor Red
} else {
    # Build a command that activates venv if present and runs the foreground server
    $backendCmd = "Set-Location -LiteralPath '$BackendDir'; if (Test-Path '.venv\\Scripts\\Activate.ps1') { . .\\.venv\\Scripts\\Activate.ps1 } else { Write-Host 'Virtual environment not found - run: python -m venv .venv' -ForegroundColor Red; Read-Host 'Press Enter to close' }; python server_foreground.py"
    $backendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd -WorkingDirectory $BackendDir -PassThru
    Start-Sleep -Seconds 5
    Write-Host "OK - Backend started (separate window)" -ForegroundColor Green
}
Write-Host ""

# Step 3: Start Frontend
Write-Host "[3/4] Starting Frontend on http://localhost:8081" -ForegroundColor Yellow
if (-not (Test-Path $FrontendDir)) {
    Write-Host "Frontend directory not found: $FrontendDir" -ForegroundColor Red
} else {
    # Launch a new PowerShell that sets the EXPO_NO_TELEMETRY env var and starts Expo in the project folder
    $frontendCmd = "Set-Location -LiteralPath '$FrontendDir'; `$env:EXPO_NO_TELEMETRY = '1'; Write-Host 'Starting Expo bundler...' -ForegroundColor Cyan; npx expo start"
    $frontendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd -WorkingDirectory $FrontendDir -PassThru
    Start-Sleep -Seconds 8
    Write-Host "OK - Frontend started (separate window)" -ForegroundColor Green
}
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
Write-Host "  1. Check the backend/frontend windows for any errors"
Write-Host "  2. Browser will open automatically in ~15 seconds"
Write-Host "  3. If browser doesn't open, manually go to: http://localhost:8081"
Write-Host "  4. Keep the backend/frontend windows open while using the app"
Write-Host ""

Write-Host "Waiting for services to fully start..." -ForegroundColor Cyan
Start-Sleep -Seconds 15
Write-Host "Opening browser..." -ForegroundColor Cyan
Start-Process "http://localhost:8081"

# Close the backend and frontend terminal windows after browser opens
Start-Sleep -Seconds 2
Write-Host "Minimizing service windows..." -ForegroundColor Cyan
if ($backendProcess) {
    Stop-Process -Id $backendProcess.Id -ErrorAction SilentlyContinue
}
if ($frontendProcess) {
    Stop-Process -Id $frontendProcess.Id -ErrorAction SilentlyContinue
}
Write-Host "Service windows closed. Services are still running in background." -ForegroundColor Green
