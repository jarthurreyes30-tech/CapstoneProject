# Quick Step-by-Step Check
# Run this to test each part one by one

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "   QUICK SYSTEM CHECK (STEP-BY-STEP)" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to backend
Set-Location -Path "capstone_backend"

# Run the step-by-step check
php step_by_step_check.php

$exitCode = $LASTEXITCODE

# Return to parent directory
Set-Location -Path ".."

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan

if ($exitCode -eq 0) {
    Write-Host "Check complete!" -ForegroundColor Green
} else {
    Write-Host "Check complete with issues found" -ForegroundColor Yellow
}

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
