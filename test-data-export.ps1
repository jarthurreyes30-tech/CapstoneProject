# Data Export Testing Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DATA EXPORT SYSTEM TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$errors = 0
$warnings = 0

# Test 1: Check PHP Zip Extension
Write-Host "[1/5] Checking PHP Zip Extension..." -ForegroundColor Yellow
Push-Location ".\capstone_backend"
try {
    $result = php -r "echo class_exists('ZipArchive') ? 'installed' : 'missing';"
    if ($result -eq "installed") {
        Write-Host "  [OK] PHP Zip extension is installed" -ForegroundColor Green
    } else {
        Write-Host "  [ERROR] PHP Zip extension is NOT installed" -ForegroundColor Red
        Write-Host "     Install it with: pecl install zip" -ForegroundColor Gray
        $errors++
    }
} catch {
    Write-Host "  [ERROR] Failed to check PHP extensions" -ForegroundColor Red
    $errors++
}
Pop-Location

Write-Host ""

# Test 2: Check exports directory permissions
Write-Host "[2/5] Checking exports directory..." -ForegroundColor Yellow
$exportsDir = ".\capstone_backend\storage\app\exports"
if (Test-Path $exportsDir) {
    Write-Host "  [OK] Exports directory exists" -ForegroundColor Green
} else {
    Write-Host "  [INFO] Creating exports directory..." -ForegroundColor Cyan
    try {
        New-Item -ItemType Directory -Path $exportsDir -Force | Out-Null
        Write-Host "  [OK] Exports directory created" -ForegroundColor Green
    } catch {
        Write-Host "  [ERROR] Failed to create exports directory" -ForegroundColor Red
        $errors++
    }
}

Write-Host ""

# Test 3: Check CORS configuration
Write-Host "[3/5] Checking CORS configuration..." -ForegroundColor Yellow
$corsFile = ".\capstone_backend\config\cors.php"
if (Test-Path $corsFile) {
    $corsContent = Get-Content $corsFile -Raw
    if ($corsContent -match "localhost:8080") {
        Write-Host "  [OK] CORS includes localhost:8080" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] CORS may not include frontend origin" -ForegroundColor Yellow
        $warnings++
    }
    
    if ($corsContent -match "supports_credentials.*true") {
        Write-Host "  [OK] CORS credentials enabled" -ForegroundColor Green
    }
    
    if ($corsContent -match "Content-Disposition") {
        Write-Host "  [OK] File download headers exposed" -ForegroundColor Green
    }
} else {
    Write-Host "  [ERROR] CORS config not found" -ForegroundColor Red
    $errors++
}

Write-Host ""

# Test 4: Check DataExportController
Write-Host "[4/5] Checking DataExportController..." -ForegroundColor Yellow
$controllerPath = ".\capstone_backend\app\Http\Controllers\DataExportController.php"
if (Test-Path $controllerPath) {
    $controllerContent = Get-Content $controllerPath -Raw
    
    if ($controllerContent -match "class_exists\('ZipArchive'\)") {
        Write-Host "  [OK] ZipArchive check implemented" -ForegroundColor Green
    }
    
    if ($controllerContent -match "Log::error") {
        Write-Host "  [OK] Error logging implemented" -ForegroundColor Green
    }
    
    if ($controllerContent -match "createReadme") {
        Write-Host "  [OK] README generation included" -ForegroundColor Green
    }
} else {
    Write-Host "  [ERROR] DataExportController not found" -ForegroundColor Red
    $errors++
}

Write-Host ""

# Test 5: Clear Laravel cache
Write-Host "[5/5] Clearing Laravel cache..." -ForegroundColor Yellow
Push-Location ".\capstone_backend"
try {
    php artisan config:clear | Out-Null
    php artisan route:clear | Out-Null
    php artisan cache:clear | Out-Null
    Write-Host "  [OK] Cache cleared successfully" -ForegroundColor Green
} catch {
    Write-Host "  [WARN] Failed to clear cache (backend may not be running)" -ForegroundColor Yellow
    $warnings++
}
Pop-Location

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "SUCCESS: All tests passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "The data export feature should now work correctly." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Restart your backend: php artisan serve" -ForegroundColor White
    Write-Host "  2. Restart your frontend dev server" -ForegroundColor White
    Write-Host "  3. Login as a donor" -ForegroundColor White
    Write-Host "  4. Go to Settings > Download Data" -ForegroundColor White
    Write-Host "  5. Click 'Download My Data'" -ForegroundColor White
    Write-Host ""
} elseif ($errors -eq 0) {
    Write-Host "WARNINGS: $warnings" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "System should work, but review warnings above" -ForegroundColor Yellow
} else {
    Write-Host "ERRORS: $errors | WARNINGS: $warnings" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please fix the errors above before testing" -ForegroundColor Red
}

Write-Host ""
