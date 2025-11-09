# Test password reset email functionality
Write-Host "Testing Password Reset Email API..." -ForegroundColor Cyan
Write-Host ""

# Use an existing user email from the database (admin@example.com from seeders)
$testEmail = "admin@example.com"

Write-Host "Sending password reset request for: $testEmail" -ForegroundColor Yellow

$body = @{
    email = $testEmail
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/email/password-reset" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    Write-Host ""
    if ($response.success) {
        Write-Host "SUCCESS!" -ForegroundColor Green
        Write-Host "Message: $($response.message)" -ForegroundColor White
        Write-Host ""
        Write-Host "Check the log file to see the email:" -ForegroundColor Yellow
        Write-Host ".\capstone_backend\storage\logs\laravel.log" -ForegroundColor Gray
        Write-Host ""
        Write-Host "The password reset email has been generated and logged." -ForegroundColor Green
    } else {
        Write-Host "FAILED" -ForegroundColor Red
        Write-Host "Message: $($response.message)" -ForegroundColor Yellow
    }
} catch {
    $errorBody = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host ""
    Write-Host "API Error:" -ForegroundColor Red
    Write-Host "Message: $($errorBody.message)" -ForegroundColor Yellow
    
    if ($errorBody.errors) {
        Write-Host "Validation Errors:" -ForegroundColor Yellow
        $errorBody.errors.PSObject.Properties | ForEach-Object {
            Write-Host "  $($_.Name): $($_.Value -join ', ')" -ForegroundColor Gray
        }
    }
}

Write-Host ""
