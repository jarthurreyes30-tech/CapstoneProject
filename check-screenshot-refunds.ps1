# Check Specific Refunds from Screenshot
# This checks the refunds visible in the charity dashboard screenshot

Write-Host ""
Write-Host "=============================================="  -ForegroundColor Cyan
Write-Host "   CHECKING REFUNDS FROM SCREENSHOT" -ForegroundColor Cyan
Write-Host "=============================================="  -ForegroundColor Cyan
Write-Host ""
Write-Host "Looking for:" -ForegroundColor Yellow
Write-Host "  - P7,070.00 refund (Approved)" -ForegroundColor White
Write-Host "  - P375.00 refund (Green Earth Movement)" -ForegroundColor White
Write-Host ""

# Navigate to backend directory
Set-Location -Path "capstone_backend"

# Run the specific check script
php check_specific_refunds.php

$exitCode = $LASTEXITCODE

# Return to parent directory
Set-Location -Path ".."

if ($exitCode -eq 0) {
    Write-Host ""
    Write-Host "=============================================="  -ForegroundColor Green
    Write-Host "Check completed!" -ForegroundColor Green
    Write-Host "=============================================="  -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "=============================================="  -ForegroundColor Red
    Write-Host "Check failed. See error above." -ForegroundColor Red
    Write-Host "=============================================="  -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
