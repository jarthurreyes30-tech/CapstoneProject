# Email System API Testing Script
# Run this to test the email API endpoints

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Email System API Testing" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if backend is running
Write-Host "[1/3] Testing backend connection..." -ForegroundColor Yellow
try {
    $ping = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/ping" -Method GET
    Write-Host "✅ Backend is running" -ForegroundColor Green
    Write-Host "   Timestamp: $($ping.time)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Backend is not running!" -ForegroundColor Red
    Write-Host "   Please start the backend server first" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Test 2: Test SMTP connection
Write-Host "[2/3] Testing SMTP connection..." -ForegroundColor Yellow
try {
    $connection = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/email/test-connection" -Method GET
    if ($connection.success) {
        Write-Host "✅ SMTP connection successful" -ForegroundColor Green
        Write-Host "   Mailer: $($connection.mailer)" -ForegroundColor Gray
        Write-Host "   Host: $($connection.host)" -ForegroundColor Gray
        Write-Host "   Port: $($connection.port)" -ForegroundColor Gray
    } else {
        Write-Host "❌ SMTP connection failed" -ForegroundColor Red
        Write-Host "   Error: $($connection.error)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "💡 Please configure SMTP in .env file:" -ForegroundColor Cyan
        Write-Host "   1. Update MAIL_MAILER=smtp" -ForegroundColor White
        Write-Host "   2. Set MAIL_HOST=smtp.gmail.com" -ForegroundColor White
        Write-Host "   3. Set MAIL_PORT=587" -ForegroundColor White
        Write-Host "   4. Add your Gmail and app password" -ForegroundColor White
        exit 1
    }
} catch {
    Write-Host "❌ Failed to test SMTP connection" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# Test 3: Send test email
Write-Host "[3/3] Sending test email..." -ForegroundColor Yellow
$testEmail = Read-Host "Enter your email address to test"

if ([string]::IsNullOrWhiteSpace($testEmail)) {
    Write-Host "❌ Email address is required" -ForegroundColor Red
    exit 1
}

try {
    $body = @{
        email = $testEmail
        name = "Test User"
    } | ConvertTo-Json

    $result = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/test-email" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"

    if ($result.success) {
        Write-Host "✅ Test email sent successfully!" -ForegroundColor Green
        Write-Host "   Recipient: $($result.recipient)" -ForegroundColor Gray
        Write-Host "   Message: $($result.message)" -ForegroundColor Gray
        Write-Host ""
        Write-Host "📬 Check your inbox (and spam folder) at: $testEmail" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Failed to send test email" -ForegroundColor Red
        Write-Host "   Message: $($result.message)" -ForegroundColor Yellow
        if ($result.error) {
            Write-Host "   Error: $($result.error)" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "❌ API request failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Testing Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 For more help, see EMAIL_SETUP_GUIDE.md" -ForegroundColor Gray
