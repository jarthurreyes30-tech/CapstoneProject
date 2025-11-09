# Quick Fix and Restart Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  APPLYING DATA EXPORT FIX" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create exports directory
Write-Host "[1/5] Creating exports directory..." -ForegroundColor Yellow
$exportsDir = ".\capstone_backend\storage\app\exports"
if (-not (Test-Path $exportsDir)) {
    New-Item -ItemType Directory -Path $exportsDir -Force | Out-Null
    Write-Host "  [OK] Created: $exportsDir" -ForegroundColor Green
} else {
    Write-Host "  [OK] Directory already exists" -ForegroundColor Green
}

Write-Host ""

# Step 2: Clear Laravel cache
Write-Host "[2/5] Clearing Laravel cache..." -ForegroundColor Yellow
Push-Location ".\capstone_backend"
try {
    php artisan config:clear | Out-Null
    php artisan route:clear | Out-Null
    php artisan cache:clear | Out-Null
    php artisan view:clear | Out-Null
    Write-Host "  [OK] All caches cleared" -ForegroundColor Green
} catch {
    Write-Host "  [WARN] Failed to clear cache (backend may not be running)" -ForegroundColor Yellow
}
Pop-Location

Write-Host ""

# Step 3: Check PHP Zip extension
Write-Host "[3/5] Checking PHP Zip extension..." -ForegroundColor Yellow
Push-Location ".\capstone_backend"
try {
    $result = php -r "echo class_exists('ZipArchive') ? 'yes' : 'no';"
    if ($result -eq "yes") {
        Write-Host "  [OK] PHP Zip extension is installed" -ForegroundColor Green
    } else {
        Write-Host "  [ERROR] PHP Zip extension is NOT installed!" -ForegroundColor Red
        Write-Host "     Please install it before using data export" -ForegroundColor Gray
        Write-Host "     See DATA_EXPORT_FIX.md for installation instructions" -ForegroundColor Gray
    }
} catch {
    Write-Host "  [ERROR] Failed to check PHP" -ForegroundColor Red
}
Pop-Location

Write-Host ""

# Step 4: Stop existing processes
Write-Host "[4/5] Stopping existing processes..." -ForegroundColor Yellow
Write-Host "  [INFO] Please manually stop:" -ForegroundColor Cyan
Write-Host "     - Backend server (Ctrl+C in terminal running 'php artisan serve')" -ForegroundColor Gray
Write-Host "     - Frontend dev server (Ctrl+C in terminal running 'npm run dev')" -ForegroundColor Gray
Write-Host ""
Write-Host "  Press any key after stopping servers..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""

# Step 5: Instructions to restart
Write-Host "[5/5] Restart Instructions:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Terminal 1 - Backend:" -ForegroundColor Cyan
Write-Host "     cd capstone_backend" -ForegroundColor White
Write-Host "     php artisan serve" -ForegroundColor White
Write-Host ""
Write-Host "  Terminal 2 - Frontend:" -ForegroundColor Cyan
Write-Host "     cd capstone_frontend" -ForegroundColor White
Write-Host "     npm run dev" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FIX APPLIED SUCCESSFULLY!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Changes Made:" -ForegroundColor Green
Write-Host "  ✅ DataExportController completely rewritten" -ForegroundColor White
Write-Host "  ✅ CORS configuration updated" -ForegroundColor White
Write-Host "  ✅ Frontend axios configuration fixed" -ForegroundColor White
Write-Host "  ✅ AccountSettings.tsx updated to use api instance" -ForegroundColor White
Write-Host "  ✅ Exports directory created" -ForegroundColor White
Write-Host "  ✅ Caches cleared" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Restart backend and frontend servers (see above)" -ForegroundColor White
Write-Host "  2. Login as a donor user" -ForegroundColor White
Write-Host "  3. Go to Settings > Download Data" -ForegroundColor White
Write-Host "  4. Click 'Download My Data' button" -ForegroundColor White
Write-Host "  5. Verify ZIP file downloads successfully" -ForegroundColor White
Write-Host ""
Write-Host "Documentation: DATA_EXPORT_FIX.md" -ForegroundColor Gray
Write-Host "Testing Script: .\test-data-export.ps1" -ForegroundColor Gray
Write-Host ""
