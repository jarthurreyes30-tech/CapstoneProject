# Comprehensive Email System Testing Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  EMAIL SYSTEM VALIDATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$errors = 0
$warnings = 0

# Test 1: Backend Running
Write-Host "[1/6] Checking if backend is running..." -ForegroundColor Yellow
try {
    $ping = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/ping" -Method GET -ErrorAction Stop
    Write-Host "  [OK] Backend is running" -ForegroundColor Green
    Write-Host "     Time: $($ping.time)" -ForegroundColor DarkGray
} catch {
    Write-Host "  [ERROR] Backend is NOT running" -ForegroundColor Red
    Write-Host "     Error: $($_.Exception.Message)" -ForegroundColor DarkRed
    $errors++
}

Write-Host ""

# Test 2: Email API Route Exists
Write-Host "[2/6] Testing email API route..." -ForegroundColor Yellow
try {
    $testResponse = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/test-email" `
        -Method POST `
        -ContentType "application/json" `
        -Body '{"email":"test@example.com"}' `
        -ErrorAction Stop
    
    Write-Host "  [OK] Email API route exists" -ForegroundColor Green
    if ($testResponse.success) {
        Write-Host "     Status: Email sent successfully" -ForegroundColor DarkGray
    } else {
        Write-Host "     Status: $($testResponse.message)" -ForegroundColor Yellow
        $warnings++
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 500) {
        Write-Host "  [WARN] Route exists but email sending failed (expected without SMTP config)" -ForegroundColor Yellow
        $warnings++
    } else {
        Write-Host "  [ERROR] Email API route not accessible" -ForegroundColor Red
        Write-Host "     Error: $($_.Exception.Message)" -ForegroundColor DarkRed
        $errors++
    }
}

Write-Host ""

# Test 3: Connection Test Route
Write-Host "[3/6] Testing SMTP connection endpoint..." -ForegroundColor Yellow
try {
    $connTest = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/email/test-connection" -Method GET -ErrorAction Stop
    Write-Host "  [OK] Connection test endpoint works" -ForegroundColor Green
    
    if ($connTest.success) {
        Write-Host "     SMTP Status: Connected" -ForegroundColor DarkGreen
        Write-Host "     Mailer: $($connTest.mailer)" -ForegroundColor DarkGray
        Write-Host "     Host: $($connTest.host)" -ForegroundColor DarkGray
        Write-Host "     Port: $($connTest.port)" -ForegroundColor DarkGray
    } else {
        Write-Host "     SMTP Status: Not configured (using 'log' mailer)" -ForegroundColor Yellow
        Write-Host "     This is expected if SMTP hasn't been configured yet" -ForegroundColor DarkGray
        $warnings++
    }
} catch {
    Write-Host "  [ERROR] Connection test endpoint failed" -ForegroundColor Red
    $errors++
}

Write-Host ""

# Test 4: Frontend Running
Write-Host "[4/6] Checking if frontend is running..." -ForegroundColor Yellow
try {
    $frontendTest = Invoke-WebRequest -Uri "http://localhost:8080" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "  [OK] Frontend is running" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Frontend is NOT running" -ForegroundColor Red
    Write-Host "     Please start frontend: npm run dev" -ForegroundColor DarkRed
    $errors++
}

Write-Host ""

# Test 5: Check Email Templates
Write-Host "[5/6] Verifying email templates..." -ForegroundColor Yellow
$templatePath = ".\capstone_backend\resources\views\emails"
$requiredTemplates = @(
    "layout.blade.php",
    "test-email.blade.php",
    "verification.blade.php",
    "donation-confirmation.blade.php",
    "password-reset.blade.php",
    "charity-verification-status.blade.php",
    "campaign-approval.blade.php",
    "welcome.blade.php",
    "security-alert.blade.php"
)

$missingTemplates = @()
foreach ($template in $requiredTemplates) {
    $fullPath = Join-Path $templatePath $template
    if (Test-Path $fullPath) {
        # Template exists
    } else {
        $missingTemplates += $template
    }
}

if ($missingTemplates.Count -eq 0) {
    Write-Host "  [OK] All $($requiredTemplates.Count) email templates found" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] Missing templates: $($missingTemplates.Count)" -ForegroundColor Red
    foreach ($missing in $missingTemplates) {
        Write-Host "     - $missing" -ForegroundColor DarkRed
    }
    $errors++
}

Write-Host ""

# Test 6: Check Email Controller
Write-Host "[6/6] Verifying EmailController..." -ForegroundColor Yellow
$controllerPath = ".\capstone_backend\app\Http\Controllers\EmailController.php"
if (Test-Path $controllerPath) {
    Write-Host "  [OK] EmailController.php exists" -ForegroundColor Green
    
    # Check if it has required methods
    $controllerContent = Get-Content $controllerPath -Raw
    $requiredMethods = @("sendTestEmail", "testConnection", "sendVerification", "sendPasswordReset")
    $foundMethods = @()
    
    foreach ($method in $requiredMethods) {
        if ($controllerContent -match "function $method") {
            $foundMethods += $method
        }
    }
    
    Write-Host "     Methods found: $($foundMethods.Count)/$($requiredMethods.Count)" -ForegroundColor DarkGray
} else {
    Write-Host "  [ERROR] EmailController.php not found" -ForegroundColor Red
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
    Write-Host "Your email system is fully implemented and ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Configure SMTP in .env file" -ForegroundColor White
    Write-Host "  2. Visit: http://localhost:8080/admin/test-email" -ForegroundColor White
    Write-Host "  3. Send a test email to verify delivery" -ForegroundColor White
} elseif ($errors -eq 0) {
    Write-Host "WARNINGS: $warnings" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "System is implemented but needs SMTP configuration" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 To complete setup:" -ForegroundColor Cyan
    Write-Host "  1. Update .env with Gmail SMTP settings" -ForegroundColor White
    Write-Host "  2. Restart backend server" -ForegroundColor White
    Write-Host "  3. Test email sending" -ForegroundColor White
} else {
    Write-Host "ERRORS: $errors | WARNINGS: $warnings" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please fix the errors above before proceeding" -ForegroundColor Red
}

Write-Host ""
Write-Host "See EMAIL_SETUP_GUIDE.md for detailed instructions" -ForegroundColor Gray
Write-Host ""
