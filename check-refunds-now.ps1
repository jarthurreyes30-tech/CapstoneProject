# Quick Check for Approved Refunds
# This script checks the database for approved refunds and shows their status

Write-Host ""
Write-Host "=============================================="  -ForegroundColor Cyan
Write-Host "   CHECKING APPROVED REFUNDS" -ForegroundColor Cyan
Write-Host "=============================================="  -ForegroundColor Cyan
Write-Host ""

# Navigate to backend directory
Set-Location -Path "capstone_backend"

Write-Host "Checking database for approved refunds..." -ForegroundColor Yellow
Write-Host ""

# Run the PHP check script
php check_refunds_now.php

$exitCode = $LASTEXITCODE

# Return to parent directory
Set-Location -Path ".."

if ($exitCode -eq 0) {
    Write-Host ""
    Write-Host "=============================================="  -ForegroundColor Green
    Write-Host "✅ Check completed!" -ForegroundColor Green
    Write-Host "=============================================="  -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "=============================================="  -ForegroundColor Red
    Write-Host "❌ Check failed. See error above." -ForegroundColor Red
    Write-Host "=============================================="  -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
