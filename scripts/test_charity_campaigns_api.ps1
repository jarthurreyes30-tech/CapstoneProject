# Test charity campaigns API endpoint
$baseUrl = "http://localhost:8000/api"

# Get auth token for charity admin (owner_id: 6 for Charity 1)
Write-Host "Testing /charity/campaigns endpoint..." -ForegroundColor Cyan

# You'll need to replace this with an actual token
# For now, let's test with a sample request
$headers = @{
    "Accept" = "application/json"
    "Content-Type" = "application/json"
}

# Test without auth (should fail)
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/charity/campaigns" -Method Get -Headers $headers -ErrorAction Stop
    Write-Host "Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error (expected - needs auth):" -ForegroundColor Yellow
    Write-Host $_.Exception.Message
}

Write-Host "`n---`n"

# Test the public campaigns filter endpoint
Write-Host "Testing /campaigns/filter endpoint..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/campaigns/filter?status=published" -Method Get -Headers $headers -ErrorAction Stop
    Write-Host "Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
