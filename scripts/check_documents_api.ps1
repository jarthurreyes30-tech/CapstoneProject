# Check Documents API Response
# This script tests the API to see what data is actually being returned

Write-Host "=== Checking Documents API ===" -ForegroundColor Cyan
Write-Host ""

# Get the charity ID from user input
$charityId = Read-Host "Enter your charity ID (check in database or user profile)"

if ([string]::IsNullOrWhiteSpace($charityId)) {
    Write-Host "No charity ID provided. Exiting..." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Testing API endpoint: http://localhost:8000/api/charities/$charityId/documents" -ForegroundColor Yellow
Write-Host ""

# Get auth token
$token = Read-Host "Enter your auth token (from localStorage or sessionStorage)"

if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Host "No token provided. Attempting without auth..." -ForegroundColor Yellow
    $headers = @{
        "Accept" = "application/json"
    }
} else {
    $headers = @{
        "Accept" = "application/json"
        "Authorization" = "Bearer $token"
    }
}

try {
    Write-Host "Fetching documents..." -ForegroundColor Green
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/charities/$charityId/documents" -Method Get -Headers $headers
    
    Write-Host ""
    Write-Host "=== API Response ===" -ForegroundColor Cyan
    Write-Host ""
    
    if ($response -is [Array]) {
        Write-Host "Total documents returned: $($response.Count)" -ForegroundColor Green
        Write-Host ""
        
        $approved = ($response | Where-Object { $_.verification_status -eq 'approved' }).Count
        $pending = ($response | Where-Object { $_.verification_status -eq 'pending' }).Count
        $rejected = ($response | Where-Object { $_.verification_status -eq 'rejected' }).Count
        
        Write-Host "Breakdown by status:" -ForegroundColor Yellow
        Write-Host "  Approved: $approved" -ForegroundColor Green
        Write-Host "  Pending: $pending" -ForegroundColor Yellow
        Write-Host "  Rejected: $rejected" -ForegroundColor Red
        Write-Host ""
        
        Write-Host "Document Details:" -ForegroundColor Yellow
        foreach ($doc in $response) {
            Write-Host "  - ID: $($doc.id) | Type: $($doc.doc_type) | Status: $($doc.verification_status)" -ForegroundColor White
        }
    } else {
        Write-Host "Response is not an array. Full response:" -ForegroundColor Red
        $response | ConvertTo-Json -Depth 10
    }
    
} catch {
    Write-Host ""
    Write-Host "=== ERROR ===" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
        
        if ($statusCode -eq 401) {
            Write-Host "Authentication failed. Please check your token." -ForegroundColor Yellow
        } elseif ($statusCode -eq 404) {
            Write-Host "Charity not found. Please check the charity ID." -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Compare the API response count with what's shown in the UI" -ForegroundColor White
Write-Host "2. If counts match API but UI shows wrong number, restart frontend dev server" -ForegroundColor White
Write-Host "3. If API returns wrong count, check database directly" -ForegroundColor White
Write-Host "4. Open browser console (F12) and check for the console.log messages" -ForegroundColor White
Write-Host ""

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
