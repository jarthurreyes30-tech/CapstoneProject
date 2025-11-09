$baseUrl = "http://127.0.0.1:8000/api"

Write-Host "Testing Campaign Filter Endpoints..." -ForegroundColor Cyan

# Test filter-options
Write-Host "`n1. Testing /campaigns/filter-options" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/campaigns/filter-options" -Method GET -Headers @{"Accept"="application/json"}
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}

# Test filter with pagination
Write-Host "`n2. Testing /campaigns/filter?page=1&per_page=12" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/campaigns/filter?page=1&per_page=12" -Method GET -Headers @{"Accept"="application/json"}
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}

Write-Host "`nTest complete!" -ForegroundColor Cyan
