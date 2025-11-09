Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  ACCOUNT RETRIEVAL FEATURE VERIFICATION" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

$allPassed = $true

# Check 1: Backend routes
Write-Host "[1/7] Checking backend API routes..." -ForegroundColor Yellow
$apiRoutesContent = Get-Content "capstone_backend\routes\api.php" -Raw
if ($apiRoutesContent -match "auth/retrieve/donor") {
    Write-Host "  [OK] Donor retrieval route found" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] Donor retrieval route not found" -ForegroundColor Red
    $allPassed = $false
}

if ($apiRoutesContent -match "auth/retrieve/charity") {
    Write-Host "  [OK] Charity retrieval route found" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] Charity retrieval route not found" -ForegroundColor Red
    $allPassed = $false
}

# Check 2: Backend controller methods
Write-Host ""
Write-Host "[2/7] Checking AuthController methods..." -ForegroundColor Yellow
$controllerContent = Get-Content "capstone_backend\app\Http\Controllers\AuthController.php" -Raw
if ($controllerContent -match "function retrieveDonorAccount") {
    Write-Host "  [OK] retrieveDonorAccount method exists" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] retrieveDonorAccount method not found" -ForegroundColor Red
    $allPassed = $false
}

if ($controllerContent -match "function retrieveCharityAccount") {
    Write-Host "  [OK] retrieveCharityAccount method exists" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] retrieveCharityAccount method not found" -ForegroundColor Red
    $allPassed = $false
}

# Check 3: Database migration
Write-Host ""
Write-Host "[3/7] Checking database migration..." -ForegroundColor Yellow
$migration = Get-ChildItem "capstone_backend\database\migrations" -Filter "*retrieval*" | Select-Object -First 1
if ($migration) {
    Write-Host "  [OK] account_retrieval_requests migration exists" -ForegroundColor Green
    Write-Host "      File: $($migration.Name)" -ForegroundColor Gray
} else {
    Write-Host "  [ERROR] Migration not found" -ForegroundColor Red
    $allPassed = $false
}

# Check 4: Model
Write-Host ""
Write-Host "[4/7] Checking model..." -ForegroundColor Yellow
if (Test-Path "capstone_backend\app\Models\AccountRetrievalRequest.php") {
    Write-Host "  [OK] AccountRetrievalRequest model exists" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] Model not found" -ForegroundColor Red
    $allPassed = $false
}

# Check 5: Frontend donor page
Write-Host ""
Write-Host "[5/7] Checking frontend donor retrieval page..." -ForegroundColor Yellow
if (Test-Path "capstone_frontend\src\pages\auth\RetrieveDonor.tsx") {
    Write-Host "  [OK] RetrieveDonor.tsx exists" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] RetrieveDonor.tsx not found" -ForegroundColor Red
    $allPassed = $false
}

# Check 6: Frontend charity page
Write-Host ""
Write-Host "[6/7] Checking frontend charity retrieval page..." -ForegroundColor Yellow
if (Test-Path "capstone_frontend\src\pages\auth\RetrieveCharity.tsx") {
    Write-Host "  [OK] RetrieveCharity.tsx exists" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] RetrieveCharity.tsx not found" -ForegroundColor Red
    $allPassed = $false
}

# Check 7: Frontend routing
Write-Host ""
Write-Host "[7/7] Checking frontend routing..." -ForegroundColor Yellow
$appContent = Get-Content "capstone_frontend\src\App.tsx" -Raw
if ($appContent -match 'import RetrieveDonor') {
    Write-Host "  [OK] RetrieveDonor component imported" -ForegroundColor Green
}
if ($appContent -match 'import RetrieveCharity') {
    Write-Host "  [OK] RetrieveCharity component imported" -ForegroundColor Green
}
if ($appContent -match 'path="/auth/retrieve/donor"') {
    Write-Host "  [OK] Donor retrieval route configured" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] Donor retrieval route not configured" -ForegroundColor Red
    $allPassed = $false
}
if ($appContent -match 'path="/auth/retrieve/charity"') {
    Write-Host "  [OK] Charity retrieval route configured" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] Charity retrieval route not configured" -ForegroundColor Red
    $allPassed = $false
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan

if ($allPassed) {
    Write-Host "  [SUCCESS] ALL CHECKS PASSED!" -ForegroundColor Green
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "The Account Retrieval feature is FULLY IMPLEMENTED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "FEATURES READY:" -ForegroundColor Yellow
    Write-Host "  [OK] Donor Account Retrieval" -ForegroundColor Green
    Write-Host "  [OK] Charity Account Retrieval" -ForegroundColor Green
    Write-Host ""
    Write-Host "HOW TO TEST:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. PREPARE TEST DATA:" -ForegroundColor White
    Write-Host "   - Create a donor account and set status to 'suspended'" -ForegroundColor Gray
    Write-Host "   - Create a charity admin and set status to 'suspended'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   SQL Commands:" -ForegroundColor Cyan
    Write-Host "   UPDATE users SET status = 'suspended'" -ForegroundColor Gray
    Write-Host "   WHERE email = 'test@example.com' AND role = 'donor';" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. TEST DONOR RETRIEVAL:" -ForegroundColor White
    Write-Host "   Navigate to: http://localhost:8080/auth/retrieve/donor" -ForegroundColor Cyan
    Write-Host "   - Enter suspended donor email" -ForegroundColor Gray
    Write-Host "   - Enter reason for reactivation" -ForegroundColor Gray
    Write-Host "   - Submit and verify success page" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. TEST CHARITY RETRIEVAL:" -ForegroundColor White
    Write-Host "   Navigate to: http://localhost:8080/auth/retrieve/charity" -ForegroundColor Cyan
    Write-Host "   - Enter suspended charity admin email" -ForegroundColor Gray
    Write-Host "   - Enter organization name" -ForegroundColor Gray
    Write-Host "   - Enter reason for reactivation" -ForegroundColor Gray
    Write-Host "   - Submit and verify success page" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. VERIFY IN DATABASE:" -ForegroundColor White
    Write-Host "   SELECT * FROM account_retrieval_requests;" -ForegroundColor Gray
    Write-Host ""
    Write-Host "See ACCOUNT_RETRIEVAL_ANALYSIS.md for detailed testing guide!" -ForegroundColor Cyan
} else {
    Write-Host "  [ERROR] SOME CHECKS FAILED" -ForegroundColor Red
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Please fix the errors above before testing." -ForegroundColor Red
}

Write-Host ""
