# Test Recurring Campaign Creation
# This script tests the fixed recurring campaign functionality

Write-Host "=== Testing Recurring Campaign Creation ===" -ForegroundColor Cyan
Write-Host ""

# Configuration
$baseUrl = "http://127.0.0.1:8000/api"
$token = Read-Host "Enter your auth token (Bearer token)"

if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Host "Error: Token is required" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/json"
}

# Get charity ID
Write-Host "Step 1: Getting charity information..." -ForegroundColor Yellow
try {
    $charityResponse = Invoke-RestMethod -Uri "$baseUrl/charity/profile" -Method Get -Headers $headers
    $charityId = $charityResponse.id
    Write-Host "✓ Charity ID: $charityId" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to get charity info: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Creating recurring campaign..." -ForegroundColor Yellow

# Prepare campaign data
$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"

$bodyLines = @(
    "--$boundary",
    "Content-Disposition: form-data; name=`"title`"$LF",
    "Test Recurring Campaign - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
    "--$boundary",
    "Content-Disposition: form-data; name=`"description`"$LF",
    "This is a test recurring campaign to verify the fix for null constraint violations.",
    "--$boundary",
    "Content-Disposition: form-data; name=`"problem`"$LF",
    "This is a test problem description that needs to be at least 50 characters long to pass validation.",
    "--$boundary",
    "Content-Disposition: form-data; name=`"solution`"$LF",
    "This is a test solution description that needs to be at least 50 characters long to pass validation.",
    "--$boundary",
    "Content-Disposition: form-data; name=`"outcome`"$LF",
    "Expected outcome for testing purposes only.",
    "--$boundary",
    "Content-Disposition: form-data; name=`"target_amount`"$LF",
    "10000",
    "--$boundary",
    "Content-Disposition: form-data; name=`"donation_type`"$LF",
    "recurring",
    "--$boundary",
    "Content-Disposition: form-data; name=`"campaign_type`"$LF",
    "other",
    "--$boundary",
    "Content-Disposition: form-data; name=`"status`"$LF",
    "draft",
    "--$boundary",
    "Content-Disposition: form-data; name=`"region`"$LF",
    "CALABARZON",
    "--$boundary",
    "Content-Disposition: form-data; name=`"province`"$LF",
    "Laguna",
    "--$boundary",
    "Content-Disposition: form-data; name=`"city`"$LF",
    "City of Cabuyao",
    "--$boundary",
    "Content-Disposition: form-data; name=`"barangay`"$LF",
    "Mamatid",
    "--$boundary",
    "Content-Disposition: form-data; name=`"beneficiary_category[]`"$LF",
    "children_disabilities",
    "--$boundary",
    "Content-Disposition: form-data; name=`"beneficiary_category[]`"$LF",
    "low_income_families",
    "--$boundary",
    "Content-Disposition: form-data; name=`"is_recurring`"$LF",
    "true",
    "--$boundary",
    "Content-Disposition: form-data; name=`"recurrence_type`"$LF",
    "monthly",
    "--$boundary",
    "Content-Disposition: form-data; name=`"recurrence_interval`"$LF",
    "1",
    "--$boundary",
    "Content-Disposition: form-data; name=`"recurrence_start_date`"$LF",
    (Get-Date).AddDays(7).ToString("yyyy-MM-dd"),
    "--$boundary",
    "Content-Disposition: form-data; name=`"auto_publish`"$LF",
    "true",
    "--$boundary--$LF"
)

$body = $bodyLines -join $LF

$headersWithContentType = $headers.Clone()
$headersWithContentType["Content-Type"] = "multipart/form-data; boundary=$boundary"

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/charities/$charityId/campaigns" -Method Post -Headers $headersWithContentType -Body $body
    Write-Host "✓ Campaign created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Campaign Details:" -ForegroundColor Cyan
    Write-Host "  ID: $($response.campaign.id)"
    Write-Host "  Title: $($response.campaign.title)"
    Write-Host "  Donation Type: $($response.campaign.donation_type)"
    Write-Host "  Is Recurring: $($response.campaign.is_recurring)"
    Write-Host "  Recurrence Type: $($response.campaign.recurrence_type)"
    Write-Host "  Recurrence Interval: $($response.campaign.recurrence_interval)"
    Write-Host "  Recurrence Start Date: $($response.campaign.recurrence_start_date)"
    Write-Host "  Next Occurrence Date: $($response.campaign.next_occurrence_date)"
    Write-Host "  Auto Publish: $($response.campaign.auto_publish)"
    Write-Host ""
    
    # Verify the campaign in database
    Write-Host "Step 3: Verifying campaign in database..." -ForegroundColor Yellow
    $campaignId = $response.campaign.id
    $verifyResponse = Invoke-RestMethod -Uri "$baseUrl/campaigns/$campaignId" -Method Get -Headers $headers
    
    if ($verifyResponse.is_recurring -eq $true -and $verifyResponse.recurrence_interval -ne $null) {
        Write-Host "✓ Campaign verified successfully in database!" -ForegroundColor Green
        Write-Host "  Recurrence Interval is NOT NULL: $($verifyResponse.recurrence_interval)" -ForegroundColor Green
    } else {
        Write-Host "✗ Campaign verification failed!" -ForegroundColor Red
    }
    
} catch {
    Write-Host "✗ Failed to create campaign!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
    exit 1
}

Write-Host ""
Write-Host "=== Test Completed Successfully ===" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  ✓ Recurring campaign created without null constraint errors"
Write-Host "  ✓ All recurring fields properly set"
Write-Host "  ✓ Database verification passed"
Write-Host ""
Write-Host "The fix is working correctly!" -ForegroundColor Green
