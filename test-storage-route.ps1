# Test Storage Route with CORS
Write-Host "Testing storage route..." -ForegroundColor Cyan

# Test 1: Check if file exists in storage
$testFile = "charity_logos/7q8eiSHo0G4dxvEA0fFaLXdsD375i8gXO6MuXA70.jpg"
$storagePath = "capstone_backend\storage\app\public\$testFile"

if (Test-Path $storagePath) {
    Write-Host "✓ File exists in storage: $testFile" -ForegroundColor Green
} else {
    Write-Host "✗ File NOT found in storage: $testFile" -ForegroundColor Red
}

# Test 2: Make HTTP request to storage route
Write-Host "`nTesting HTTP request to storage route..." -ForegroundColor Cyan

try {
    $url = "http://127.0.0.1:8000/storage/$testFile"
    Write-Host "URL: $url" -ForegroundColor Yellow
    
    $headers = @{
        "Origin" = "http://localhost:8080"
    }
    
    $response = Invoke-WebRequest -Uri $url -Headers $headers -Method GET -UseBasicParsing
    
    Write-Host "✓ Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "✓ Content-Type: $($response.Headers['Content-Type'])" -ForegroundColor Green
    Write-Host "✓ Access-Control-Allow-Origin: $($response.Headers['Access-Control-Allow-Origin'])" -ForegroundColor Green
    Write-Host "✓ Cross-Origin-Resource-Policy: $($response.Headers['Cross-Origin-Resource-Policy'])" -ForegroundColor Green
    Write-Host "✓ Content Length: $($response.RawContentLength) bytes" -ForegroundColor Green
    
} catch {
    Write-Host "✗ Request failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure the Laravel server is running: php artisan serve" -ForegroundColor Yellow
}

Write-Host "`nDone!" -ForegroundColor Cyan
