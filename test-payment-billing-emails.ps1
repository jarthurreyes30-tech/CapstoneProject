# Payment & Billing Email System Testing Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PAYMENT & BILLING EMAIL TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$errors = 0
$warnings = 0

# Test 1: Check Backend Running
Write-Host "[1/8] Checking backend..." -ForegroundColor Yellow
try {
    $ping = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/ping" -Method GET -ErrorAction Stop
    Write-Host "  [OK] Backend is running" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Backend is NOT running" -ForegroundColor Red
    Write-Host "     Start it with: cd capstone_backend && php artisan serve" -ForegroundColor Gray
    $errors++
}

Write-Host ""

# Test 2: Check Events
Write-Host "[2/8] Verifying Event classes..." -ForegroundColor Yellow
$events = @(
    "PaymentMethodUpdated",
    "TaxInfoUpdated"
)

$missingEvents = @()
foreach ($event in $events) {
    $path = ".\capstone_backend\app\Events\$event.php"
    if (-not (Test-Path $path)) {
        $missingEvents += $event
    }
}

if ($missingEvents.Count -eq 0) {
    Write-Host "  [OK] All 2 Event classes found" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] Missing $($missingEvents.Count) Event classes" -ForegroundColor Red
    $errors++
}

Write-Host ""

# Test 3: Check Listeners
Write-Host "[3/8] Verifying Listener classes..." -ForegroundColor Yellow
$listeners = @(
    "SendPaymentMethodUpdatedEmail",
    "SendTaxInfoUpdatedEmail"
)

$missingListeners = @()
foreach ($listener in $listeners) {
    $path = ".\capstone_backend\app\Listeners\$listener.php"
    if (-not (Test-Path $path)) {
        $missingListeners += $listener
    }
}

if ($missingListeners.Count -eq 0) {
    Write-Host "  [OK] All 2 Listener classes found" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] Missing $($missingListeners.Count) Listener classes" -ForegroundColor Red
    $errors++
}

Write-Host ""

# Test 4: Check Mailable Classes
Write-Host "[4/8] Verifying Mailable classes..." -ForegroundColor Yellow
$mailables = @(
    "PaymentMethodUpdatedMail",
    "TaxInfoUpdatedMail"
)

$missingMailables = @()
foreach ($mailable in $mailables) {
    $path = ".\capstone_backend\app\Mail\$mailable.php"
    if (-not (Test-Path $path)) {
        $missingMailables += $mailable
    }
}

if ($missingMailables.Count -eq 0) {
    Write-Host "  [OK] All 2 Mailable classes found" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] Missing $($missingMailables.Count) Mailable classes" -ForegroundColor Red
    $errors++
}

Write-Host ""

# Test 5: Check Email Templates
Write-Host "[5/8] Verifying email templates..." -ForegroundColor Yellow
$templates = @{
    "payment/method-updated" = ".\capstone_backend\resources\views\emails\payment\method-updated.blade.php"
    "tax/info-updated" = ".\capstone_backend\resources\views\emails\tax\info-updated.blade.php"
}

$missingTemplates = @()
foreach ($template in $templates.Keys) {
    if (-not (Test-Path $templates[$template])) {
        $missingTemplates += $template
    }
}

if ($missingTemplates.Count -eq 0) {
    Write-Host "  [OK] All 2 email templates found" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] Missing $($missingTemplates.Count) templates" -ForegroundColor Red
    $errors++
}

Write-Host ""

# Test 6: Check Controllers
Write-Host "[6/8] Verifying Controllers..." -ForegroundColor Yellow
$controllers = @(
    "PaymentMethodController",
    "TaxInfoController"
)

$missingControllers = @()
foreach ($controller in $controllers) {
    $path = ".\capstone_backend\app\Http\Controllers\$controller.php"
    if (-not (Test-Path $path)) {
        $missingControllers += $controller
    }
}

if ($missingControllers.Count -eq 0) {
    Write-Host "  [OK] All 2 Controllers found" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] Missing $($missingControllers.Count) Controllers" -ForegroundColor Red
    $errors++
}

Write-Host ""

# Test 7: Check Routes
Write-Host "[7/8] Verifying API routes..." -ForegroundColor Yellow
$routeFile = ".\capstone_backend\routes\api.php"
if (Test-Path $routeFile) {
    $routeContent = Get-Content $routeFile -Raw
    
    $hasPaymentRoutes = $routeContent -match "PaymentMethodController"
    $hasTaxRoutes = $routeContent -match "TaxInfoController"
    
    if ($hasPaymentRoutes -and $hasTaxRoutes) {
        Write-Host "  [OK] Payment and Tax routes configured" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] Some routes may be missing" -ForegroundColor Yellow
        $warnings++
    }
} else {
    Write-Host "  [ERROR] Routes file not found" -ForegroundColor Red
    $errors++
}

Write-Host ""

# Test 8: Check Email Configuration
Write-Host "[8/8] Checking email configuration..." -ForegroundColor Yellow
$envPath = ".\capstone_backend\.env"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    
    if ($envContent -match "charityhub25@gmail.com") {
        Write-Host "  [OK] CharityHub email configured" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] CharityHub email not configured" -ForegroundColor Yellow
        $warnings++
    }
    
    if ($envContent -match "QUEUE_CONNECTION=(database|redis|sync)") {
        Write-Host "  [OK] Queue connection configured" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] Queue connection not configured" -ForegroundColor Yellow
        $warnings++
    }
} else {
    Write-Host "  [ERROR] .env file not found" -ForegroundColor Red
    $errors++
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VALIDATION SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "SUCCESS: ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Payment & Billing Email System Implemented!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Components Verified:" -ForegroundColor Cyan
    Write-Host "  - 2 Event classes" -ForegroundColor White
    Write-Host "  - 2 Listener classes" -ForegroundColor White
    Write-Host "  - 2 Mailable classes" -ForegroundColor White
    Write-Host "  - 2 Email templates" -ForegroundColor White
    Write-Host "  - 2 Controllers" -ForegroundColor White
    Write-Host "  - API routes configured" -ForegroundColor White
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Start queue worker:" -ForegroundColor White
    Write-Host "     php artisan queue:work" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  2. Test via Tinker:" -ForegroundColor White
    Write-Host "     php artisan tinker" -ForegroundColor Gray
    Write-Host "     event(new \App\Events\PaymentMethodUpdated(\App\Models\User::first(), 'added', 'GCash', '1234'));" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  3. Test via API with authentication token" -ForegroundColor White
    Write-Host ""
} elseif ($errors -eq 0) {
    Write-Host "WARNINGS: $warnings" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "System implemented with minor warnings" -ForegroundColor Yellow
} else {
    Write-Host "ERRORS: $errors | WARNINGS: $warnings" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please fix the errors above" -ForegroundColor Red
}

Write-Host ""
Write-Host "Documentation: PAYMENT_BILLING_EMAIL_DOCUMENTATION.md" -ForegroundColor Gray
Write-Host ""
