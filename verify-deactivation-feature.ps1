Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  ACCOUNT DEACTIVATION FEATURE VERIFICATION" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

$hasErrors = $false

# Check 1: Backend routes
Write-Host "[1/5] Checking backend API routes..." -ForegroundColor Yellow
$apiRoutesContent = Get-Content "capstone_backend\routes\api.php" -Raw
if ($apiRoutesContent -match "deactivate") {
    Write-Host "  [OK] Deactivate route found" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] Deactivate route not found" -ForegroundColor Red
    $hasErrors = $true
}

if ($apiRoutesContent -match "reactivate") {
    Write-Host "  [OK] Reactivate route found" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] Reactivate route not found" -ForegroundColor Red
    $hasErrors = $true
}

# Check 2: Backend controller methods
Write-Host ""
Write-Host "[2/5] Checking AuthController methods..." -ForegroundColor Yellow
$controllerContent = Get-Content "capstone_backend\app\Http\Controllers\AuthController.php" -Raw
if ($controllerContent -match "function deactivateAccount") {
    Write-Host "  [OK] deactivateAccount method exists" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] deactivateAccount method not found" -ForegroundColor Red
    $hasErrors = $true
}

if ($controllerContent -match "function reactivateAccount") {
    Write-Host "  [OK] reactivateAccount method exists" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] reactivateAccount method not found" -ForegroundColor Red
    $hasErrors = $true
}

# Check 3: Database enum bug
Write-Host ""
Write-Host "[3/5] Checking database schema for enum bug..." -ForegroundColor Yellow
$migrationContent = Get-Content "capstone_backend\database\migrations\0001_01_01_000000_create_users_table.php" -Raw

if ($migrationContent -match "enum\('status',\['active','suspended'\]") {
    Write-Host "  [WARN] Database only allows 'active' and 'suspended'" -ForegroundColor Yellow
    Write-Host "  [BUG] Controller tries to use 'inactive' which will fail!" -ForegroundColor Red
    $hasErrors = $true
} elseif ($migrationContent -match "enum\('status',\['active','inactive','suspended'\]") {
    Write-Host "  [OK] Database supports 'active', 'inactive', and 'suspended'" -ForegroundColor Green
} else {
    Write-Host "  [WARN] Could not determine enum values" -ForegroundColor Yellow
}

if ($controllerContent -match "update\(\['status' => 'inactive'\]") {
    Write-Host "  [WARN] Controller uses 'inactive' status" -ForegroundColor Yellow
}

# Check 4: Frontend UI
Write-Host ""
Write-Host "[4/5] Checking frontend implementation..." -ForegroundColor Yellow
$accountSettingsContent = Get-Content "capstone_frontend\src\pages\donor\AccountSettings.tsx" -Raw
if ($accountSettingsContent -match "deactivate|Deactivate") {
    Write-Host "  [OK] Deactivation UI found" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] No deactivation UI in AccountSettings.tsx" -ForegroundColor Red
    Write-Host "  [INFO] Frontend interface is missing" -ForegroundColor Yellow
    $hasErrors = $true
}

# Check 5: Frontend route
Write-Host ""
Write-Host "[5/5] Checking frontend routing..." -ForegroundColor Yellow
$appContent = Get-Content "capstone_frontend\src\App.tsx" -Raw
if ($appContent -match 'settings/deactivate') {
    Write-Host "  [OK] Deactivate route found in App.tsx" -ForegroundColor Green
} else {
    Write-Host "  [WARN] No /settings/deactivate route found" -ForegroundColor Yellow
    Write-Host "  [INFO] May use AccountSettings instead" -ForegroundColor Gray
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan

if ($hasErrors) {
    Write-Host "  [CRITICAL] FEATURE HAS BUGS - NOT WORKING" -ForegroundColor Red
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "ISSUES FOUND:" -ForegroundColor Red
    Write-Host ""
    Write-Host "1. DATABASE ENUM BUG:" -ForegroundColor Yellow
    Write-Host "   - Database only accepts: 'active', 'suspended'" -ForegroundColor White
    Write-Host "   - Controller tries to set: 'inactive'" -ForegroundColor White
    Write-Host "   - This will cause SQL error!" -ForegroundColor Red
    Write-Host ""
    Write-Host "2. FRONTEND UI MISSING:" -ForegroundColor Yellow
    Write-Host "   - No deactivate button in AccountSettings" -ForegroundColor White
    Write-Host "   - Users cannot access this feature from UI" -ForegroundColor White
    Write-Host ""
    Write-Host "RECOMMENDATION:" -ForegroundColor Yellow
    Write-Host "This feature CANNOT be tested manually because:" -ForegroundColor Red
    Write-Host "  - Backend will crash due to enum mismatch" -ForegroundColor Red
    Write-Host "  - No UI exists to trigger the feature" -ForegroundColor Red
    Write-Host ""
    Write-Host "See ACCOUNT_DEACTIVATION_ANALYSIS.md for detailed fix guide." -ForegroundColor Cyan
} else {
    Write-Host "  [SUCCESS] ALL CHECKS PASSED!" -ForegroundColor Green
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Feature appears to be implemented correctly!" -ForegroundColor Green
    Write-Host ""
    Write-Host "HOW TO TEST:" -ForegroundColor Yellow
    Write-Host "  1. Make sure servers are running" -ForegroundColor White
    Write-Host "  2. Navigate to: http://localhost:8080/donor/settings" -ForegroundColor White
    Write-Host "  3. Look for 'Deactivate Account' option" -ForegroundColor White
    Write-Host "  4. Test deactivation and reactivation" -ForegroundColor White
    Write-Host ""
    Write-Host "See ACCOUNT_DEACTIVATION_ANALYSIS.md for detailed testing steps." -ForegroundColor Cyan
}

Write-Host ""
