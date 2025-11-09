# Quick email API test
Write-Host "Testing Email API..." -ForegroundColor Cyan

$body = @{
    email = "testvalidation@example.com"
    name = "API Validation Test"
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/test-email" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    Write-Host ""
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "Message: $($result.message)" -ForegroundColor White
    Write-Host "Recipient: $($result.recipient)" -ForegroundColor White
    Write-Host ""
    Write-Host "Check the log file to see the email HTML:" -ForegroundColor Yellow
    Write-Host ".\capstone_backend\storage\logs\laravel.log" -ForegroundColor Gray
} catch {
    Write-Host ""
    Write-Host "FAILED!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
}
