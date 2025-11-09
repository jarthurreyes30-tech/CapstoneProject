# Comprehensive API Endpoint Testing Script
# Tests all major endpoints to identify errors

$ErrorActionPreference = "Continue"
$baseUrl = "http://localhost:8000/api"
$results = @()

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Description,
        [hashtable]$Headers = @{"Accept" = "application/json"}
    )
    
    Write-Host "`n=== Testing: $Description ===" -ForegroundColor Cyan
    Write-Host "$Method $baseUrl$Endpoint" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl$Endpoint" -Method $Method -Headers $Headers -ErrorAction Stop
        
        $result = @{
            Endpoint = $Endpoint
            Method = $Method
            Description = $Description
            Status = $response.StatusCode
            Success = $true
            Error = $null
        }
        
        Write-Host "✓ SUCCESS: $($response.StatusCode)" -ForegroundColor Green
        
        # Try to parse JSON response
        try {
            $json = $response.Content | ConvertFrom-Json
            if ($json.PSObject.Properties.Name -contains "data") {
                Write-Host "  Response contains 'data' property" -ForegroundColor Gray
            }
        } catch {
            Write-Host "  Response is not JSON" -ForegroundColor Yellow
        }
        
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $result = @{
            Endpoint = $Endpoint
            Method = $Method
            Description = $Description
            Status = $statusCode
            Success = $false
            Error = $_.Exception.Message
        }
        
        Write-Host "✗ FAILED: $statusCode - $($_.Exception.Message)" -ForegroundColor Red
    }
    
    $script:results += $result
    return $result
}

Write-Host "=====================================" -ForegroundColor Yellow
Write-Host "  API ENDPOINT TESTING SUITE" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Yellow
Write-Host ""

# PUBLIC ENDPOINTS (No Auth Required)
Write-Host "`n=== PUBLIC ENDPOINTS ===" -ForegroundColor Magenta

Test-Endpoint -Method "GET" -Endpoint "/ping" -Description "Health Check"
Test-Endpoint -Method "GET" -Endpoint "/public/stats" -Description "Landing Page Statistics"
Test-Endpoint -Method "GET" -Endpoint "/charities" -Description "Public Charities List"
Test-Endpoint -Method "GET" -Endpoint "/campaigns" -Description "Public Campaigns List"
Test-Endpoint -Method "GET" -Endpoint "/leaderboard/donors" -Description "Top Donors Leaderboard"
Test-Endpoint -Method "GET" -Endpoint "/leaderboard/charities" -Description "Top Charities Leaderboard"
Test-Endpoint -Method "GET" -Endpoint "/donation-stats" -Description "Donation Statistics"

# Test specific charity
Write-Host "`n=== TESTING SPECIFIC RESOURCES ===" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Endpoint "/charities/1" -Description "Single Charity Details"
Test-Endpoint -Method "GET" -Endpoint "/charities/1/campaigns" -Description "Charity's Campaigns"
Test-Endpoint -Method "GET" -Endpoint "/charities/1/donation-channels" -Description "Charity's Donation Channels"

# Test specific campaign
Test-Endpoint -Method "GET" -Endpoint "/campaigns/1" -Description "Single Campaign Details"

# LOCATION ENDPOINTS
Write-Host "`n=== LOCATION ENDPOINTS ===" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Endpoint "/locations/provinces" -Description "Provinces List"
Test-Endpoint -Method "GET" -Endpoint "/locations/cities" -Description "Cities List"
Test-Endpoint -Method "GET" -Endpoint "/locations/barangays" -Description "Barangays List"

# AUTHENTICATION ENDPOINTS (These will fail without proper data, but we check if routes exist)
Write-Host "`n=== AUTH ENDPOINTS (Testing Route Existence) ===" -ForegroundColor Magenta
Test-Endpoint -Method "POST" -Endpoint "/auth/login" -Description "Login Endpoint"
Test-Endpoint -Method "POST" -Endpoint "/auth/register/donor" -Description "Donor Registration"
Test-Endpoint -Method "POST" -Endpoint "/auth/register/charity" -Description "Charity Registration"

# SUMMARY
Write-Host "`n`n=====================================" -ForegroundColor Yellow
Write-Host "  TEST SUMMARY" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Yellow

$successCount = ($results | Where-Object { $_.Success -eq $true }).Count
$failCount = ($results | Where-Object { $_.Success -eq $false }).Count
$total = $results.Count

Write-Host "`nTotal Tests: $total" -ForegroundColor White
Write-Host "Passed: $successCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red

if ($failCount -gt 0) {
    Write-Host "`n--- FAILED ENDPOINTS ---" -ForegroundColor Red
    $results | Where-Object { $_.Success -eq $false } | ForEach-Object {
        Write-Host "  ✗ $($_.Method) $($_.Endpoint) - $($_.Description)" -ForegroundColor Red
        Write-Host "    Status: $($_.Status) - $($_.Error)" -ForegroundColor Gray
    }
}

Write-Host "`n=====================================" -ForegroundColor Yellow

# Export results to JSON
$resultsJson = $results | ConvertTo-Json -Depth 10
$resultsJson | Out-File "c:\Users\ycel_\Final\test_results_endpoints.json"
Write-Host "`nResults saved to: test_results_endpoints.json" -ForegroundColor Cyan
