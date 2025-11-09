# Test the /charity/campaigns endpoint with authentication
param(
    [string]$Token
)

if (-not $Token) {
    Write-Host "Usage: .\test_api_charity_campaigns.ps1 -Token 'YOUR_AUTH_TOKEN'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To get your token:" -ForegroundColor Cyan
    Write-Host "1. Open browser and log in as Robin" -ForegroundColor White
    Write-Host "2. Press F12 to open DevTools" -ForegroundColor White
    Write-Host "3. Go to Console tab" -ForegroundColor White
    Write-Host "4. Type: localStorage.getItem('auth_token')" -ForegroundColor White
    Write-Host "5. Copy the token and run this script with it" -ForegroundColor White
    exit
}

$baseUrl = "http://localhost:8000/api"

Write-Host "Testing /charity/campaigns endpoint..." -ForegroundColor Cyan
Write-Host ""

try {
    $headers = @{
        "Authorization" = "Bearer $Token"
        "Accept" = "application/json"
        "Content-Type" = "application/json"
    }
    
    Write-Host "Making request to: $baseUrl/charity/campaigns" -ForegroundColor Gray
    Write-Host ""
    
    $response = Invoke-RestMethod -Uri "$baseUrl/charity/campaigns" -Method Get -Headers $headers -ErrorAction Stop
    
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response Structure:" -ForegroundColor Cyan
    Write-Host "  current_page: $($response.current_page)" -ForegroundColor White
    Write-Host "  last_page: $($response.last_page)" -ForegroundColor White
    Write-Host "  total: $($response.total)" -ForegroundColor White
    Write-Host "  per_page: $($response.per_page)" -ForegroundColor White
    Write-Host "  data.length: $($response.data.Count)" -ForegroundColor White
    Write-Host ""
    
    if ($response.data.Count -gt 0) {
        Write-Host "Campaigns Found:" -ForegroundColor Cyan
        foreach ($campaign in $response.data) {
            Write-Host ""
            Write-Host "  Campaign ID: $($campaign.id)" -ForegroundColor Yellow
            Write-Host "    Title: $($campaign.title)" -ForegroundColor White
            Write-Host "    Status: $($campaign.status)" -ForegroundColor White
            Write-Host "    Target: $($campaign.target_amount)" -ForegroundColor White
            Write-Host "    Current: $($campaign.current_amount)" -ForegroundColor White
            Write-Host "    Donors: $($campaign.donors_count)" -ForegroundColor White
            Write-Host "    Start Date: $($campaign.start_date)" -ForegroundColor White
            Write-Host "    End Date: $($campaign.end_date)" -ForegroundColor White
            Write-Host "    Cover Image: $($campaign.cover_image_path)" -ForegroundColor White
        }
    } else {
        Write-Host "No campaigns in response!" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "Full JSON Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 5
    
} catch {
    Write-Host "FAILED!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "HTTP Status Code: $statusCode" -ForegroundColor Yellow
        
        if ($statusCode -eq 401) {
            Write-Host "Authentication failed. Token might be expired or invalid." -ForegroundColor Yellow
        } elseif ($statusCode -eq 404) {
            Write-Host "No charity found for this user." -ForegroundColor Yellow
        }
    }
}
