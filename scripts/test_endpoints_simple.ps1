# Simple API Endpoint Testing Script
$baseUrl = "http://localhost:8000/api"
$results = @()

Write-Host "=====================================" -ForegroundColor Yellow
Write-Host "  API ENDPOINT TESTING" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Yellow

# Test endpoints
$endpoints = @(
    @{Method="GET"; Path="/ping"; Name="Health Check"},
    @{Method="GET"; Path="/public/stats"; Name="Public Stats"},
    @{Method="GET"; Path="/charities"; Name="Charities List"},
    @{Method="GET"; Path="/campaigns"; Name="Campaigns List"},
    @{Method="GET"; Path="/charities/1"; Name="Charity Detail"},
    @{Method="GET"; Path="/campaigns/1"; Name="Campaign Detail"},
    @{Method="GET"; Path="/leaderboard/donors"; Name="Top Donors"},
    @{Method="GET"; Path="/leaderboard/charities"; Name="Top Charities"},
    @{Method="GET"; Path="/donation-stats"; Name="Donation Stats"},
    @{Method="GET"; Path="/locations/provinces"; Name="Provinces"}
)

foreach ($endpoint in $endpoints) {
    Write-Host "`n[$($endpoint.Name)]" -ForegroundColor Cyan
    Write-Host "$($endpoint.Method) $baseUrl$($endpoint.Path)" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl$($endpoint.Path)" -Method $endpoint.Method -Headers @{"Accept"="application/json"} -ErrorAction Stop
        Write-Host "SUCCESS: $($response.StatusCode)" -ForegroundColor Green
        $results += "PASS: $($endpoint.Name)"
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        Write-Host "FAILED: $status" -ForegroundColor Red
        $results += "FAIL: $($endpoint.Name) - Status $status"
    }
}

Write-Host "`n=====================================" -ForegroundColor Yellow
Write-Host "SUMMARY" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Yellow
$results | ForEach-Object { Write-Host $_ }
