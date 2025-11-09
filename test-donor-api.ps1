# Test Donor Profile API Data Fetching
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "  DONOR PROFILE API TEST" -ForegroundColor Yellow
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

# Get donor ID from user input
$donorId = Read-Host "Enter Donor ID to test (or press Enter for ID 1)"
if ([string]::IsNullOrWhiteSpace($donorId)) {
    $donorId = "1"
}

Write-Host "`nTesting API endpoint: /api/donors/$donorId" -ForegroundColor Yellow
Write-Host ""

# Get auth token
Write-Host "Please enter your auth token (from browser localStorage):" -ForegroundColor Yellow
Write-Host "(In browser console: localStorage.getItem('auth_token'))" -ForegroundColor Cyan
$token = Read-Host "Token"

if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Host "`nERROR: Token required" -ForegroundColor Red
    exit
}

# Test API
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Accept" = "application/json"
    }
    
    Write-Host "`nCalling API..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/donors/$donorId" -Headers $headers -Method GET
    
    Write-Host "`nSUCCESS! Profile data received:" -ForegroundColor Green
    Write-Host "=====================================================================" -ForegroundColor Cyan
    
    $data = $response.data
    
    Write-Host "Name: $($data.name)" -ForegroundColor White
    Write-Host "Email: $($data.email)" -ForegroundColor White
    Write-Host "Location: $($data.location)" -ForegroundColor White
    Write-Host "Avatar URL: $($data.avatar_url)" -ForegroundColor White
    Write-Host "Cover URL: $($data.cover_url)" -ForegroundColor White
    Write-Host ""
    Write-Host "--- Stats ---" -ForegroundColor Yellow
    Write-Host "Total Donated: ₱$($data.total_donated)" -ForegroundColor Cyan
    Write-Host "Campaigns Supported: $($data.campaigns_supported_count)" -ForegroundColor Cyan
    Write-Host "Recent Donations: $($data.recent_donations_count)" -ForegroundColor Cyan
    Write-Host "Liked Campaigns: $($data.liked_campaigns_count)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "--- Other Info ---" -ForegroundColor Yellow
    Write-Host "Member Since: $($data.member_since)" -ForegroundColor White
    Write-Host "Is Owner: $($data.is_owner)" -ForegroundColor White
    Write-Host "Bio: $($data.bio)" -ForegroundColor White
    
    Write-Host "`n=====================================================================" -ForegroundColor Cyan
    Write-Host "Full JSON Response:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 5
    
} catch {
    Write-Host "`nERROR: API call failed" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common Issues:" -ForegroundColor Yellow
    Write-Host "  - Backend not running (php artisan serve)" -ForegroundColor White
    Write-Host "  - Wrong donor ID" -ForegroundColor White
    Write-Host "  - Invalid token" -ForegroundColor White
    Write-Host "  - Donor doesn't exist in database" -ForegroundColor White
}

Write-Host ""
