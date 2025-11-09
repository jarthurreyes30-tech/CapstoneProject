# Test campaign endpoints
$baseUrl = "http://localhost:8000/api"

Write-Host "=== Testing Campaign Endpoints ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Public campaigns filter endpoint (no auth required)
Write-Host "1. Testing /campaigns/filter (public, published campaigns)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/campaigns/filter?status=published&per_page=12" -Method Get -Headers @{
        "Accept" = "application/json"
    } -ErrorAction Stop
    
    Write-Host "   ✓ Success!" -ForegroundColor Green
    Write-Host "   Total campaigns: $($response.total)" -ForegroundColor White
    Write-Host "   Current page: $($response.current_page)" -ForegroundColor White
    Write-Host "   Campaigns on this page: $($response.data.Count)" -ForegroundColor White
    
    if ($response.data.Count -gt 0) {
        Write-Host "   First campaign:" -ForegroundColor White
        $first = $response.data[0]
        Write-Host "     - ID: $($first.id)" -ForegroundColor Gray
        Write-Host "     - Title: $($first.title)" -ForegroundColor Gray
        Write-Host "     - Status: $($first.status)" -ForegroundColor Gray
        Write-Host "     - Charity: $($first.charity.name)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: All campaigns (including closed/draft)
Write-Host "2. Testing /campaigns/filter (all statuses)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/campaigns/filter?per_page=12" -Method Get -Headers @{
        "Accept" = "application/json"
    } -ErrorAction Stop
    
    Write-Host "   ✓ Success!" -ForegroundColor Green
    Write-Host "   Total campaigns: $($response.total)" -ForegroundColor White
    Write-Host "   Campaigns on this page: $($response.data.Count)" -ForegroundColor White
    
    # Count by status
    $statuses = $response.data | Group-Object -Property status
    Write-Host "   Campaigns by status:" -ForegroundColor White
    foreach ($status in $statuses) {
        Write-Host "     - $($status.Name): $($status.Count)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Filter options endpoint
Write-Host "3. Testing /campaigns/filter-options..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/campaigns/filter-options" -Method Get -Headers @{
        "Accept" = "application/json"
    } -ErrorAction Stop
    
    Write-Host "   ✓ Success!" -ForegroundColor Green
    Write-Host "   Campaign types: $($response.types.Count)" -ForegroundColor White
    Write-Host "   Regions: $($response.regions.Count)" -ForegroundColor White
} catch {
    Write-Host "   ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Testing Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: To test /charity/campaigns endpoint, you need to:" -ForegroundColor Yellow
Write-Host "1. Log in as a charity admin" -ForegroundColor Yellow
Write-Host "2. Get the auth token from browser DevTools (localStorage or sessionStorage)" -ForegroundColor Yellow
Write-Host "3. Run the authenticated test manually with your token" -ForegroundColor Yellow
