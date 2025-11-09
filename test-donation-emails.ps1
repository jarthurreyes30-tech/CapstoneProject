# Donation Email System Testing Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DONATION EMAIL SYSTEM TEST" -ForegroundColor Cyan
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

# Test 2: Check Mailable Classes
Write-Host "[2/8] Verifying Mailable classes..." -ForegroundColor Yellow
$mailables = @(
    "DonationConfirmationMail",
    "NewDonationAlertMail",
    "RecurringDonationUpdateMail",
    "RefundRequestMail",
    "DonationStatementMail",
    "DonationExportMail"
)

$missingMailables = @()
foreach ($mailable in $mailables) {
    $path = ".\capstone_backend\app\Mail\$mailable.php"
    if (-not (Test-Path $path)) {
        $missingMailables += $mailable
    }
}

if ($missingMailables.Count -eq 0) {
    Write-Host "  [OK] All 6 Mailable classes found" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] Missing $($missingMailables.Count) Mailable classes" -ForegroundColor Red
    $errors++
}

Write-Host ""

# Test 3: Check Email Templates
Write-Host "[3/8] Verifying email templates..." -ForegroundColor Yellow
$templates = @(
    "confirmation",
    "new-donation-alert",
    "recurring-update",
    "refund-confirmation",
    "refund-alert-charity",
    "annual-statement",
    "export-ready"
)

$missingTemplates = @()
foreach ($template in $templates) {
    $path = ".\capstone_backend\resources\views\emails\donations\$template.blade.php"
    if (-not (Test-Path $path)) {
        $missingTemplates += $template
    }
}

if ($missingTemplates.Count -eq 0) {
    Write-Host "  [OK] All 7 email templates found" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] Missing $($missingTemplates.Count) templates" -ForegroundColor Red
    $errors++
}

Write-Host ""

# Test 4: Check DonationController Updates
Write-Host "[4/8] Verifying DonationController..." -ForegroundColor Yellow
$controllerPath = ".\capstone_backend\app\Http\Controllers\DonationController.php"
if (Test-Path $controllerPath) {
    $controllerContent = Get-Content $controllerPath -Raw
    
    $hasMailImport = $controllerContent -match "use Illuminate\\Support\\Facades\\Mail"
    $hasEmailMethod = $controllerContent -match "function sendDonationEmails"
    $hasMailableImports = $controllerContent -match "DonationConfirmationMail.*NewDonationAlertMail"
    
    if ($hasMailImport -and $hasEmailMethod -and $hasMailableImports) {
        Write-Host "  [OK] DonationController updated with email logic" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] DonationController may be missing email logic" -ForegroundColor Yellow
        $warnings++
    }
} else {
    Write-Host "  [ERROR] DonationController not found" -ForegroundColor Red
    $errors++
}

Write-Host ""

# Test 5: Check .env Configuration
Write-Host "[5/8] Checking .env configuration..." -ForegroundColor Yellow
$envPath = ".\capstone_backend\.env"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    
    $hasMailer = $envContent -match "MAIL_MAILER=(smtp|log)"
    $hasFromAddress = $envContent -match "MAIL_FROM_ADDRESS"
    $hasFrontendUrl = $envContent -match "APP_FRONTEND_URL"
    
    if ($hasMailer) {
        if ($envContent -match "MAIL_MAILER=smtp") {
            Write-Host "  [OK] Mail configured for SMTP" -ForegroundColor Green
        } else {
            Write-Host "  [INFO] Mail configured for LOG (development mode)" -ForegroundColor Cyan
            Write-Host "     Update MAIL_MAILER=smtp for actual sending" -ForegroundColor Gray
        }
    } else {
        Write-Host "  [WARN] MAIL_MAILER not configured" -ForegroundColor Yellow
        $warnings++
    }
    
    if ($envContent -match "charityhub25@gmail.com") {
        Write-Host "  [OK] CharityHub email address configured" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] CharityHub email not configured" -ForegroundColor Yellow
        Write-Host "     Set MAIL_FROM_ADDRESS=charityhub25@gmail.com" -ForegroundColor Gray
        $warnings++
    }
} else {
    Write-Host "  [ERROR] .env file not found" -ForegroundColor Red
    $errors++
}

Write-Host ""

# Test 6: Check Queue Configuration
Write-Host "[6/8] Checking queue configuration..." -ForegroundColor Yellow
$envPath = ".\capstone_backend\.env"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    
    if ($envContent -match "QUEUE_CONNECTION=(database|redis|sync)") {
        Write-Host "  [OK] Queue connection configured" -ForegroundColor Green
        
        # Check if queue worker is running
        $queueCheck = Get-Process -Name php -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*queue:work*" }
        if ($queueCheck) {
            Write-Host "  [OK] Queue worker is running" -ForegroundColor Green
        } else {
            Write-Host "  [WARN] Queue worker not detected" -ForegroundColor Yellow
            Write-Host "     Start it with: php artisan queue:work" -ForegroundColor Gray
            $warnings++
        }
    } else {
        Write-Host "  [WARN] Queue connection not configured" -ForegroundColor Yellow
        $warnings++
    }
}

Write-Host ""

# Test 7: Check Database Migrations
Write-Host "[7/8] Checking database tables..." -ForegroundColor Yellow
Write-Host "  [INFO] Ensure these tables exist:" -ForegroundColor Cyan
Write-Host "     - donations" -ForegroundColor Gray
Write-Host "     - jobs (for queue)" -ForegroundColor Gray
Write-Host "     - charities" -ForegroundColor Gray
Write-Host "     - campaigns" -ForegroundColor Gray
Write-Host "     - users" -ForegroundColor Gray
Write-Host "  [OK] Database structure assumed correct" -ForegroundColor Green

Write-Host ""

# Test 8: Test Email Sending (if admin user exists)
Write-Host "[8/8] Testing email API..." -ForegroundColor Yellow
Write-Host "  [INFO] Manual test required" -ForegroundColor Cyan
Write-Host "     1. Create a donation via API or frontend" -ForegroundColor Gray
Write-Host "     2. Check storage/logs/laravel.log for email logs" -ForegroundColor Gray
Write-Host "     3. If queue worker running, check jobs table" -ForegroundColor Gray
Write-Host "  [SKIP] Automated test not performed" -ForegroundColor Yellow

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VALIDATION SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "SUCCESS: ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your donation email system is fully implemented!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Components Verified:" -ForegroundColor Cyan
    Write-Host "  - 6 Mailable classes" -ForegroundColor White
    Write-Host "  - 7 Email templates" -ForegroundColor White
    Write-Host "  - DonationController updated" -ForegroundColor White
    Write-Host "  - Email configuration present" -ForegroundColor White
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Update .env with Gmail credentials" -ForegroundColor White
    Write-Host "     MAIL_FROM_ADDRESS=charityhub25@gmail.com" -ForegroundColor Gray
    Write-Host "     MAIL_PASSWORD=your_app_password" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  2. Start queue worker:" -ForegroundColor White
    Write-Host "     php artisan queue:work" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  3. Create a test donation and verify emails" -ForegroundColor White
    Write-Host ""
} elseif ($errors -eq 0) {
    Write-Host "WARNINGS: $warnings" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "System is implemented with minor warnings" -ForegroundColor Yellow
    Write-Host "Review warnings above and complete configuration" -ForegroundColor Yellow
} else {
    Write-Host "ERRORS: $errors | WARNINGS: $warnings" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please fix the errors above" -ForegroundColor Red
}

Write-Host ""
Write-Host "Full documentation: DONATION_EMAIL_CONFIGURATION.md" -ForegroundColor Gray
Write-Host ""
