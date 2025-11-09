# Fix Refund Donations PowerShell Script
# This script runs the PHP fix script to repair refund-related data issues

Write-Host "=============================================="  -ForegroundColor Cyan
Write-Host "   REFUND DONATIONS FIX SCRIPT" -ForegroundColor Cyan
Write-Host "=============================================="  -ForegroundColor Cyan
Write-Host ""

# Navigate to backend directory
Set-Location -Path "capstone_backend"

Write-Host "Running refund fix script..." -ForegroundColor Yellow
Write-Host ""

# Run the PHP script
php database/scripts/fix_refund_donations.php

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=============================================="  -ForegroundColor Green
    Write-Host "✅ Fix completed successfully!" -ForegroundColor Green
    Write-Host "=============================================="  -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "=============================================="  -ForegroundColor Red
    Write-Host "❌ Fix failed. Check the error messages above." -ForegroundColor Red
    Write-Host "=============================================="  -ForegroundColor Red
}

# Return to parent directory
Set-Location -Path ".."

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
