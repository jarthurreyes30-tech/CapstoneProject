# Test Campaign Filter Endpoints
Write-Host "Testing Campaign Filter Endpoints..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Filter Options
Write-Host "1. Testing /api/campaigns/filter-options" -ForegroundColor Yellow
try {
    $response1 = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/campaigns/filter-options" -Method GET -Headers @{"Accept"="application/json"}
    Write-Host "Status Code: $($response1.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    $response1.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}

Write-Host ""
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""

# Test 2: Filter Campaigns
Write-Host "2. Testing /api/campaigns/filter" -ForegroundColor Yellow
try {
    $response2 = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/campaigns/filter?page=1&per_page=12" -Method GET -Headers @{"Accept"="application/json"}
    Write-Host "Status Code: $($response2.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    $response2.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}

Write-Host ""
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""

# Test 3: Filter with parameters
Write-Host "3. Testing /api/campaigns/filter with campaign_type parameter" -ForegroundColor Yellow
try {
    $response3 = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/campaigns/filter?campaign_type=Medical&page=1&per_page=12" -Method GET -Headers @{"Accept"="application/json"}
    Write-Host "Status Code: $($response3.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    $response3.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test completed!" -ForegroundColor Cyan
