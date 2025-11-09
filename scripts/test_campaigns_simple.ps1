# Test campaign endpoints
$baseUrl = "http://localhost:8000/api"

Write-Host "Testing Campaign Endpoints" -ForegroundColor Cyan
Write-Host ""

# Test 1: Public campaigns filter
Write-Host "1. Testing /campaigns/filter (published)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/campaigns/filter?status=published&per_page=12" -Method Get
    Write-Host "   Success! Total: $($response.total), Data count: $($response.data.Count)" -ForegroundColor Green
    if ($response.data.Count -gt 0) {
        $first = $response.data[0]
        Write-Host "   First campaign: $($first.title) (Status: $($first.status))" -ForegroundColor Gray
    }
} catch {
    Write-Host "   Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: All campaigns
Write-Host "2. Testing /campaigns/filter (all)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/campaigns/filter?per_page=12" -Method Get
    Write-Host "   Success! Total: $($response.total), Data count: $($response.data.Count)" -ForegroundColor Green
    $statuses = $response.data | Group-Object -Property status
    foreach ($status in $statuses) {
        Write-Host "   - $($status.Name): $($status.Count)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Testing Complete" -ForegroundColor Cyan
