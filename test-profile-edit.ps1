# Profile Edit API Test Script
# Tests profile editing for all three user roles

$API_URL = "http://localhost:8000/api"
$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PROFILE EDIT FUNCTIONALITY TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to test API endpoint
function Test-ProfileEndpoint {
    param(
        [string]$Role,
        [string]$Token,
        [string]$Endpoint,
        [hashtable]$Data
    )
    
    Write-Host "Testing $Role Profile Edit..." -ForegroundColor Yellow
    Write-Host "Endpoint: $Endpoint" -ForegroundColor Gray
    
    try {
        $headers = @{
            "Authorization" = "Bearer $Token"
            "Accept" = "application/json"
            "Content-Type" = "application/json"
        }
        
        $body = $Data | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$API_URL$Endpoint" -Method PUT -Headers $headers -Body $body -ErrorAction Stop
        
        Write-Host "✅ SUCCESS: Profile updated" -ForegroundColor Green
        Write-Host "Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
        return $true
    }
    catch {
        Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host "Error Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
        return $false
    }
    Write-Host ""
}

# Function to get current user profile
function Get-UserProfile {
    param([string]$Token)
    
    try {
        $headers = @{
            "Authorization" = "Bearer $Token"
            "Accept" = "application/json"
        }
        
        $response = Invoke-RestMethod -Uri "$API_URL/me" -Method GET -Headers $headers -ErrorAction Stop
        return $response
    }
    catch {
        Write-Host "❌ Failed to get user profile: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST 1: DONOR PROFILE EDIT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Please provide a DONOR account token for testing:" -ForegroundColor Yellow
Write-Host "(You can get this by logging in as a donor in the frontend)" -ForegroundColor Gray
$donorToken = Read-Host "Donor Token"

if ($donorToken) {
    Write-Host ""
    Write-Host "Fetching current donor profile..." -ForegroundColor Cyan
    $donorProfile = Get-UserProfile -Token $donorToken
    
    if ($donorProfile) {
        Write-Host "Current Profile:" -ForegroundColor Green
        Write-Host "  Name: $($donorProfile.name)" -ForegroundColor Gray
        Write-Host "  Email: $($donorProfile.email)" -ForegroundColor Gray
        Write-Host "  Phone: $($donorProfile.phone)" -ForegroundColor Gray
        Write-Host "  Address: $($donorProfile.address)" -ForegroundColor Gray
        Write-Host ""
        
        Write-Host "Testing Donor Profile Update..." -ForegroundColor Cyan
        $donorData = @{
            name = "$($donorProfile.name) (Updated)"
            phone = "09123456789"
            address = "123 Test Street, Manila"
        }
        
        $donorResult = Test-ProfileEndpoint -Role "DONOR" -Token $donorToken -Endpoint "/me" -Data $donorData
        
        Write-Host ""
        Write-Host "Testing with MISSING FIELDS (display_name, bio, interests)..." -ForegroundColor Cyan
        $donorDataExtended = @{
            name = $donorProfile.name
            phone = "09123456789"
            address = "123 Test Street, Manila"
            display_name = "TestDonor"
            bio = "This is a test bio"
            interests = @("Education", "Health")
        }
        
        $donorExtendedResult = Test-ProfileEndpoint -Role "DONOR (Extended)" -Token $donorToken -Endpoint "/me" -Data $donorDataExtended
        
        Write-Host ""
        Write-Host "Verifying if extended fields were saved..." -ForegroundColor Cyan
        $updatedProfile = Get-UserProfile -Token $donorToken
        
        if ($updatedProfile) {
            Write-Host "Updated Profile:" -ForegroundColor Green
            Write-Host "  Name: $($updatedProfile.name)" -ForegroundColor Gray
            Write-Host "  Display Name: $($updatedProfile.display_name)" -ForegroundColor $(if ($updatedProfile.display_name) { "Green" } else { "Red" })
            Write-Host "  Bio: $($updatedProfile.bio)" -ForegroundColor $(if ($updatedProfile.bio) { "Green" } else { "Red" })
            Write-Host "  Interests: $($updatedProfile.interests)" -ForegroundColor $(if ($updatedProfile.interests) { "Green" } else { "Red" })
            
            if (-not $updatedProfile.display_name -or -not $updatedProfile.bio -or -not $updatedProfile.interests) {
                Write-Host ""
                Write-Host "⚠️  WARNING: Extended fields (display_name, bio, interests) were NOT saved!" -ForegroundColor Red
                Write-Host "    This confirms the backend is missing these fields." -ForegroundColor Red
            }
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST 2: CHARITY ADMIN PROFILE EDIT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Please provide a CHARITY ADMIN account token for testing:" -ForegroundColor Yellow
Write-Host "(You can get this by logging in as a charity admin in the frontend)" -ForegroundColor Gray
$charityToken = Read-Host "Charity Admin Token"

if ($charityToken) {
    Write-Host ""
    Write-Host "Fetching current charity profile..." -ForegroundColor Cyan
    $charityProfile = Get-UserProfile -Token $charityToken
    
    if ($charityProfile -and $charityProfile.charity) {
        Write-Host "Current Charity Profile:" -ForegroundColor Green
        Write-Host "  Organization: $($charityProfile.charity.name)" -ForegroundColor Gray
        Write-Host "  Mission: $($charityProfile.charity.mission)" -ForegroundColor Gray
        Write-Host ""
        
        Write-Host "Testing Charity Profile Update..." -ForegroundColor Cyan
        
        # Create multipart form data for charity profile
        $boundary = [System.Guid]::NewGuid().ToString()
        $LF = "`r`n"
        
        $bodyLines = @(
            "--$boundary",
            "Content-Disposition: form-data; name=`"mission`"$LF",
            "Updated mission statement for testing purposes. This is a longer text to meet the minimum character requirement of 30 characters.",
            "--$boundary",
            "Content-Disposition: form-data; name=`"vision`"$LF",
            "Updated vision statement for testing.",
            "--$boundary",
            "Content-Disposition: form-data; name=`"description`"$LF",
            "Updated description for testing purposes. This needs to be at least 50 characters long to pass validation.",
            "--$boundary--$LF"
        )
        
        $body = $bodyLines -join $LF
        
        try {
            $headers = @{
                "Authorization" = "Bearer $charityToken"
                "Accept" = "application/json"
                "Content-Type" = "multipart/form-data; boundary=$boundary"
            }
            
            $response = Invoke-RestMethod -Uri "$API_URL/charity/profile/update" -Method POST -Headers $headers -Body $body -ErrorAction Stop
            
            Write-Host "✅ SUCCESS: Charity profile updated" -ForegroundColor Green
            Write-Host "Response: $($response.message)" -ForegroundColor Gray
        }
        catch {
            Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
            if ($_.ErrorDetails.Message) {
                Write-Host "Error Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
            }
        }
    }
    else {
        Write-Host "❌ No charity found for this account" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST 3: SYSTEM ADMIN PROFILE EDIT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Please provide a SYSTEM ADMIN account token for testing:" -ForegroundColor Yellow
Write-Host "(You can get this by logging in as an admin in the frontend)" -ForegroundColor Gray
$adminToken = Read-Host "Admin Token"

if ($adminToken) {
    Write-Host ""
    Write-Host "Fetching current admin profile..." -ForegroundColor Cyan
    $adminProfile = Get-UserProfile -Token $adminToken
    
    if ($adminProfile) {
        Write-Host "Current Admin Profile:" -ForegroundColor Green
        Write-Host "  Name: $($adminProfile.name)" -ForegroundColor Gray
        Write-Host "  Email: $($adminProfile.email)" -ForegroundColor Gray
        Write-Host "  Phone: $($adminProfile.phone)" -ForegroundColor Gray
        Write-Host ""
        
        Write-Host "Testing Admin Profile Update..." -ForegroundColor Cyan
        $adminData = @{
            name = "$($adminProfile.name) (Updated)"
            phone = "09987654321"
            address = "Admin Office, Manila"
        }
        
        $adminResult = Test-ProfileEndpoint -Role "ADMIN" -Token $adminToken -Endpoint "/me" -Data $adminData
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Test Results:" -ForegroundColor Yellow
Write-Host "1. Donor Profile Edit: " -NoNewline
if ($donorResult) { Write-Host "✅ PASSED" -ForegroundColor Green } else { Write-Host "❌ FAILED or SKIPPED" -ForegroundColor Red }

Write-Host "2. Charity Admin Profile Edit: " -NoNewline
Write-Host "⚠️  MANUAL VERIFICATION NEEDED" -ForegroundColor Yellow

Write-Host "3. System Admin Profile Edit: " -NoNewline
if ($adminResult) { Write-Host "✅ PASSED" -ForegroundColor Green } else { Write-Host "❌ FAILED or SKIPPED" -ForegroundColor Red }

Write-Host ""
Write-Host "Key Findings:" -ForegroundColor Yellow
Write-Host "• Donor profile edit works but MISSING fields: display_name, bio, interests" -ForegroundColor $(if ($donorResult) { "Yellow" } else { "Gray" })
Write-Host "• Charity admin profile edit uses separate endpoint: /charity/profile/update" -ForegroundColor Yellow
Write-Host "• System admin profile edit uses same endpoint as donor: /me" -ForegroundColor Yellow
Write-Host ""

Write-Host "For detailed analysis, see: PROFILE_EDIT_TEST_REPORT.md" -ForegroundColor Cyan
Write-Host ""
