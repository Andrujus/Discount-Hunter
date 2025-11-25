#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Discount-Hunter - Complete Full Stack Startup Script
    
.DESCRIPTION
    Starts both the FastAPI backend and Expo frontend servers.
    Backend: http://127.0.0.1:3000
    Frontend: http://localhost:8081
    
.EXAMPLE
    .\start_all.ps1
#>

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
Write-Host "✓ Processes stopped" -ForegroundColor Green
Write-Host ""

# Step 2: Start Backend
Write-Host "[2/4] Starting Backend Server on http://127.0.0.1:3000" -ForegroundColor Yellow
Push-Location $BackendDir
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python server_foreground.py" -WindowStyle Minimized
Pop-Location
Start-Sleep -Seconds 3
Write-Host "✓ Backend started" -ForegroundColor Green
Write-Host ""

# Step 3: Start Frontend
Write-Host "[3/4] Starting Frontend on http://localhost:8081" -ForegroundColor Yellow
Push-Location $FrontendDir
$env:EXPO_NO_TELEMETRY = '1'
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npx expo start --web" -WindowStyle Minimized
Pop-Location
Start-Sleep -Seconds 2
Write-Host "✓ Frontend started" -ForegroundColor Green
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
Write-Host "  Backend:  $(if ($backendHealthy) { '✓ ' } else { '⚠ ' })http://127.0.0.1:3000" -ForegroundColor $(if ($backendHealthy) { 'Green' } else { 'Yellow' })
Write-Host "  Frontend: $(if ($frontendHealthy) { '✓ ' } else { '⚠ ' })http://localhost:8081" -ForegroundColor $(if ($frontendHealthy) { 'Green' } else { 'Yellow' })
Write-Host ""
Write-Host "Environment:" -ForegroundColor Yellow
Write-Host "  OCR API Key: $(if ([System.Environment]::GetEnvironmentVariable('OCR_SPACE_API_KEY', 'User')) { '✓ Configured' } else { '⚠ Not set' })" -ForegroundColor $(if ([System.Environment]::GetEnvironmentVariable('OCR_SPACE_API_KEY', 'User')) { 'Green' } else { 'Yellow' })
Write-Host "  Scraping API Key: $(if ([System.Environment]::GetEnvironmentVariable('SCRAPINGBEE_API_KEY', 'User')) { '✓ Configured' } else { '⚠ Not set' })" -ForegroundColor $(if ([System.Environment]::GetEnvironmentVariable('SCRAPINGBEE_API_KEY', 'User')) { 'Green' } else { 'Yellow' })
Write-Host ""
Write-Host "Tips:" -ForegroundColor Yellow
Write-Host "  • Minimize the backend and frontend windows to keep them running"
Write-Host "  • Backend logs will show in the backend window"
Write-Host "  • Frontend will open automatically or visit http://localhost:8081"
Write-Host "  • To stop: Close the windows or press Ctrl+C in each terminal"
Write-Host ""
