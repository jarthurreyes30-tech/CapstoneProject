Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  SUPPORT FEATURE VERIFICATION" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

$allPassed = $true

# Check 1: Frontend route file exists
Write-Host "[1/6] Checking frontend Support page..." -ForegroundColor Yellow
$frontendFile = "capstone_frontend\src\pages\donor\Support.tsx"
if (Test-Path $frontendFile) {
    Write-Host "  [OK] Support.tsx exists" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] Support.tsx not found" -ForegroundColor Red
    $allPassed = $false
}

# Check 2: Backend controller exists
Write-Host ""
Write-Host "[2/6] Checking backend controller..." -ForegroundColor Yellow
$controllerFile = "capstone_backend\app\Http\Controllers\SupportTicketController.php"
if (Test-Path $controllerFile) {
    Write-Host "  [OK] SupportTicketController.php exists" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] SupportTicketController.php not found" -ForegroundColor Red
    $allPassed = $false
}

# Check 3: API routes configured
Write-Host ""
Write-Host "[3/6] Checking API routes..." -ForegroundColor Yellow
$apiRoutesContent = Get-Content "capstone_backend\routes\api.php" -Raw
if ($apiRoutesContent -match "/support/tickets") {
    Write-Host "  [OK] Support routes found in api.php" -ForegroundColor Green
    if ($apiRoutesContent -match "SupportTicketController") {
        Write-Host "  [OK] Controller referenced correctly" -ForegroundColor Green
    }
} else {
    Write-Host "  [ERROR] Support routes not found" -ForegroundColor Red
    $allPassed = $false
}

# Check 4: Frontend route in App.tsx
Write-Host ""
Write-Host "[4/6] Checking frontend routing..." -ForegroundColor Yellow
$appContent = Get-Content "capstone_frontend\src\App.tsx" -Raw
if ($appContent -match 'import Support from') {
    Write-Host "  [OK] Support component imported" -ForegroundColor Green
}
if ($appContent -match 'path="support".*element={<Support') {
    Write-Host "  [OK] Support route configured" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] Support route not found in App.tsx" -ForegroundColor Red
    $allPassed = $false
}

# Check 5: Database migrations exist
Write-Host ""
Write-Host "[5/6] Checking database migrations..." -ForegroundColor Yellow
$ticketsMigration = Get-ChildItem "capstone_backend\database\migrations" -Filter "*support_tickets*" | Select-Object -First 1
$messagesMigration = Get-ChildItem "capstone_backend\database\migrations" -Filter "*support_messages*" | Select-Object -First 1

if ($ticketsMigration) {
    Write-Host "  [OK] support_tickets migration exists" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] support_tickets migration not found" -ForegroundColor Red
    $allPassed = $false
}

if ($messagesMigration) {
    Write-Host "  [OK] support_messages migration exists" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] support_messages migration not found" -ForegroundColor Red
    $allPassed = $false
}

# Check 6: Models exist
Write-Host ""
Write-Host "[6/6] Checking models..." -ForegroundColor Yellow
if (Test-Path "capstone_backend\app\Models\SupportTicket.php") {
    Write-Host "  [OK] SupportTicket model exists" -ForegroundColor Green
} else {
    Write-Host "  [WARN] SupportTicket model not found" -ForegroundColor Yellow
}

if (Test-Path "capstone_backend\app\Models\SupportMessage.php") {
    Write-Host "  [OK] SupportMessage model exists" -ForegroundColor Green
} else {
    Write-Host "  [WARN] SupportMessage model not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan

if ($allPassed) {
    Write-Host "  [SUCCESS] ALL CHECKS PASSED!" -ForegroundColor Green
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "The Support/Ticketing feature is ready to use!" -ForegroundColor Green
    Write-Host ""
    Write-Host "NEXT STEPS:" -ForegroundColor Yellow
    Write-Host "  1. Make sure both servers are running:" -ForegroundColor White
    Write-Host "     - Backend: php artisan serve" -ForegroundColor Gray
    Write-Host "     - Frontend: npm run dev" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  2. Login as a donor user" -ForegroundColor White
    Write-Host ""
    Write-Host "  3. Navigate to:" -ForegroundColor White
    Write-Host "     http://localhost:8080/donor/support" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  4. Test creating a ticket" -ForegroundColor White
    Write-Host ""
    Write-Host "See SUPPORT_FEATURE_TEST_GUIDE.md for detailed testing steps!" -ForegroundColor Yellow
} else {
    Write-Host "  [ERROR] SOME CHECKS FAILED" -ForegroundColor Red
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Please fix the errors above before testing." -ForegroundColor Red
}

Write-Host ""
