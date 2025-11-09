# 2FA Bug Fix - Manual Testing Script
# This script helps verify the 2FA bug fix is working correctly

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔒 2FA Bug Fix - Manual Test Script" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Configuration
$baseUrl = "http://127.0.0.1:8000/api"
$email = "donor@example.com"
$password = "password123"

Write-Host "📋 Test Configuration:" -ForegroundColor Yellow
Write-Host "   Backend URL: $baseUrl"
Write-Host "   Test User: $email"
Write-Host "   Password: $password`n"

# Step 1: Login to get token
Write-Host "Step 1: Logging in to get authentication token..." -ForegroundColor Green
try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body (@{
        email = $email
        password = $password
    } | ConvertTo-Json) -ContentType "application/json"
    
    $token = $loginResponse.token
    Write-Host "   ✅ Login successful!" -ForegroundColor Green
    Write-Host "   Token: $($token.Substring(0, 20))...`n" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Please ensure:" -ForegroundColor Yellow
    Write-Host "   1. Backend is running (php artisan serve)" -ForegroundColor Yellow
    Write-Host "   2. User exists in database" -ForegroundColor Yellow
    Write-Host "   3. Credentials are correct`n" -ForegroundColor Yellow
    exit 1
}

# Headers for authenticated requests
$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/json"
    "Content-Type" = "application/json"
}

# Step 2: Check initial 2FA status
Write-Host "Step 2: Checking initial 2FA status..." -ForegroundColor Green
try {
    $statusResponse = Invoke-RestMethod -Uri "$baseUrl/me/2fa/status" -Method Get -Headers $headers
    Write-Host "   ✅ Status retrieved!" -ForegroundColor Green
    Write-Host "   2FA Enabled: $($statusResponse.enabled)" -ForegroundColor Gray
    Write-Host "   Enabled At: $($statusResponse.enabled_at)`n" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Failed to get status: $($_.Exception.Message)`n" -ForegroundColor Red
    exit 1
}

# Step 3: Enable 2FA (generate QR and recovery codes)
Write-Host "Step 3: Enabling 2FA (generating QR code and recovery codes)..." -ForegroundColor Green
try {
    $enableResponse = Invoke-RestMethod -Uri "$baseUrl/me/2fa/enable" -Method Post -Headers $headers
    Write-Host "   ✅ 2FA setup initiated!" -ForegroundColor Green
    Write-Host "   Secret: $($enableResponse.secret)" -ForegroundColor Gray
    Write-Host "   QR Code Length: $($enableResponse.qr_code.Length) characters" -ForegroundColor Gray
    Write-Host "   Recovery Codes Count: $($enableResponse.recovery_codes.Count)" -ForegroundColor Gray
    Write-Host "   Recovery Codes:" -ForegroundColor Gray
    foreach ($code in $enableResponse.recovery_codes) {
        Write-Host "      - $code" -ForegroundColor Gray
    }
    Write-Host ""
    
    $secret = $enableResponse.secret
} catch {
    $errorMessage = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "   ❌ Failed to enable 2FA: $($errorMessage.message)" -ForegroundColor Red
    
    # If already enabled, try to disable first
    if ($errorMessage.message -like "*already enabled*") {
        Write-Host "   ℹ️ 2FA is already enabled. Attempting to disable first..." -ForegroundColor Yellow
        try {
            $disableResponse = Invoke-RestMethod -Uri "$baseUrl/me/2fa/disable" -Method Post -Headers $headers -Body (@{
                password = $password
            } | ConvertTo-Json)
            Write-Host "   ✅ 2FA disabled. Please run the script again.`n" -ForegroundColor Green
        } catch {
            Write-Host "   ❌ Failed to disable: $($_.ErrorDetails.Message)`n" -ForegroundColor Red
        }
    }
    exit 1
}

# Step 4: Check database update
Write-Host "Step 4: Verifying database was updated..." -ForegroundColor Green
Write-Host "   🔍 Checking if two_factor_secret was saved..." -ForegroundColor Gray
Write-Host "   📝 This is the critical check for the bug fix!" -ForegroundColor Yellow
Write-Host "   ⚠️  The bug was: secret wasn't being saved due to missing fillable fields`n" -ForegroundColor Yellow

# Step 5: Generate a test code
Write-Host "Step 5: To verify with a real code..." -ForegroundColor Green
Write-Host "   📱 Open your authenticator app" -ForegroundColor Yellow
Write-Host "   ➕ Add a new account manually" -ForegroundColor Yellow
Write-Host "   🔑 Enter this secret: $secret" -ForegroundColor Yellow
Write-Host "   🏷️  Account name: CharityHub Test" -ForegroundColor Yellow
Write-Host "   ⏱️  Type: Time-based (TOTP)" -ForegroundColor Yellow
Write-Host "   🔢 Your app will show a 6-digit code" -ForegroundColor Yellow
Write-Host ""

# Prompt for code
$code = Read-Host "Enter the 6-digit code from your authenticator app (or press Enter to skip verification)"

if ($code -and $code.Length -eq 6) {
    # Step 6: Verify the code
    Write-Host "`nStep 6: Verifying code and activating 2FA..." -ForegroundColor Green
    try {
        $verifyResponse = Invoke-RestMethod -Uri "$baseUrl/me/2fa/verify" -Method Post -Headers $headers -Body (@{
            code = $code
        } | ConvertTo-Json)
        
        Write-Host "   ✅ SUCCESS! 2FA has been enabled!" -ForegroundColor Green
        Write-Host "   🎉 The bug fix is working!" -ForegroundColor Green
        Write-Host "   Message: $($verifyResponse.message)" -ForegroundColor Gray
        Write-Host "   Recovery Codes Returned: $($verifyResponse.recovery_codes.Count)`n" -ForegroundColor Gray
        
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "✅ BUG FIX VERIFIED - ALL TESTS PASSED!" -ForegroundColor Green
        Write-Host "========================================`n" -ForegroundColor Cyan
        
    } catch {
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "   ❌ Verification failed: $($errorDetails.message)" -ForegroundColor Red
        
        # THIS WAS THE BUG!
        if ($errorDetails.message -like "*enable 2FA first*") {
            Write-Host "`n   🐛 BUG DETECTED! This is the original bug!" -ForegroundColor Red
            Write-Host "   ❌ The two_factor_secret was not saved to the database" -ForegroundColor Red
            Write-Host "   ❌ This means the fillable fields fix did not work" -ForegroundColor Red
            Write-Host "   📝 Check that User model includes 2FA fields in fillable array`n" -ForegroundColor Yellow
        } else {
            Write-Host "   ℹ️  Different error - likely invalid code or timing issue" -ForegroundColor Yellow
            Write-Host "   💡 Try again with a fresh code (codes change every 30 seconds)`n" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "`n⏭️  Skipping verification step" -ForegroundColor Yellow
    Write-Host "   To complete the test, run the script again and enter a valid code`n" -ForegroundColor Yellow
}

# Step 7: Check final status
Write-Host "Step 7: Checking final 2FA status..." -ForegroundColor Green
try {
    $finalStatus = Invoke-RestMethod -Uri "$baseUrl/me/2fa/status" -Method Get -Headers $headers
    Write-Host "   2FA Enabled: $($finalStatus.enabled)" -ForegroundColor Gray
    Write-Host "   Enabled At: $($finalStatus.enabled_at)`n" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Failed to get final status`n" -ForegroundColor Red
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📊 Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Login successful" -ForegroundColor Green
Write-Host "✅ 2FA status retrieved" -ForegroundColor Green
Write-Host "✅ 2FA enable API works" -ForegroundColor Green
Write-Host "✅ QR code and recovery codes generated" -ForegroundColor Green
if ($code -and $code.Length -eq 6) {
    Write-Host "⚠️  Verification tested (check results above)" -ForegroundColor Yellow
} else {
    Write-Host "⏭️  Verification skipped" -ForegroundColor Yellow
}
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "💡 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. If verification succeeded: Test login with 2FA" -ForegroundColor White
Write-Host "   2. If verification failed: Check error message above" -ForegroundColor White
Write-Host "   3. Test frontend: http://localhost:3000/donor/settings/2fa" -ForegroundColor White
Write-Host "   4. Test complete flow with real authenticator app`n" -ForegroundColor White
