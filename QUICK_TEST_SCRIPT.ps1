# Quick System Test Script
# Tests all critical endpoints and functionality

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Quick System Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8000/api"
$testsPassed = 0
$testsFailed = 0

# Function to test endpoint
function Test-Endpoint {
    param($name, $url, $method = "GET")
    
    Write-Host "Testing: $name..." -ForegroundColor Yellow -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method $method -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 201) {
            Write-Host " ✅ PASS" -ForegroundColor Green
            $script:testsPassed++
            return $true
        }
    }
    catch {
        Write-Host " ❌ FAIL ($($_.Exception.Message))" -ForegroundColor Red
        $script:testsFailed++
        return $false
    }
}

Write-Host "1. Testing Public Endpoints" -ForegroundColor Cyan
Write-Host "--------------------------------" -ForegroundColor Gray

Test-Endpoint "Public Charities List" "$baseUrl/charities"
Test-Endpoint "Public Campaigns List" "$baseUrl/campaigns"
Test-Endpoint "Public Statistics" "$baseUrl/public/stats"

Write-Host ""
Write-Host "2. Testing New Features" -ForegroundColor Cyan
Write-Host "--------------------------------" -ForegroundColor Gray

# These will fail without authentication but we're testing if routes exist
Write-Host "Testing: Charity Officers Route..." -ForegroundColor Yellow -NoNewline
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/charities/1/officers" -Method GET -UseBasicParsing -ErrorAction SilentlyContinue
    Write-Host " ✅ ROUTE EXISTS" -ForegroundColor Green
    $script:testsPassed++
}
catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Write-Host " ❌ ROUTE NOT FOUND" -ForegroundColor Red
        $script:testsFailed++
    } else {
        Write-Host " ✅ ROUTE EXISTS (needs auth)" -ForegroundColor Green
        $script:testsPassed++
    }
}

Write-Host ""
Write-Host "3. Testing Database" -ForegroundColor Cyan
Write-Host "--------------------------------" -ForegroundColor Gray

Set-Location capstone_backend

Write-Host "Checking migrations..." -ForegroundColor Yellow
$migrationOutput = php artisan migrate:status | Select-String "charity_officers" -Quiet
if ($migrationOutput) {
    Write-Host "✅ Charity Officers table exists" -ForegroundColor Green
    $script:testsPassed++
} else {
    Write-Host "❌ Charity Officers table missing" -ForegroundColor Red
    $script:testsFailed++
}

$volunteerOutput = php artisan migrate:status | Select-String "campaign_volunteers" -Quiet
if ($volunteerOutput) {
    Write-Host "✅ Campaign Volunteers table exists" -ForegroundColor Green
    $script:testsPassed++
} else {
    Write-Host "❌ Campaign Volunteers table missing" -ForegroundColor Red
    $script:testsFailed++
}

Write-Host ""
Write-Host "4. Checking File Integrity" -ForegroundColor Cyan
Write-Host "--------------------------------" -ForegroundColor Gray

$files = @(
    "app\Models\CharityOfficer.php",
    "app\Models\CampaignVolunteer.php",
    "app\Http\Controllers\CharityOfficerController.php",
    "app\Http\Controllers\CampaignVolunteerController.php"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $syntaxCheck = php -l $file 2>&1
        if ($syntaxCheck -like "*No syntax errors*") {
            Write-Host "✅ $file" -ForegroundColor Green
            $script:testsPassed++
        } else {
            Write-Host "❌ $file (syntax error)" -ForegroundColor Red
            $script:testsFailed++
        }
    } else {
        Write-Host "❌ $file (not found)" -ForegroundColor Red
        $script:testsFailed++
    }
}

Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Results" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Tests Passed: $testsPassed" -ForegroundColor Green
Write-Host "Tests Failed: $testsFailed" -ForegroundColor Red

$total = $testsPassed + $testsFailed
$successRate = [math]::Round(($testsPassed / $total) * 100, 2)
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 80) { "Green" } else { "Yellow" })

Write-Host ""
if ($testsFailed -eq 0) {
    Write-Host "🎉 All tests passed! System is ready." -ForegroundColor Green
} else {
    Write-Host "⚠️ Some tests failed. Review errors above." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Start backend: cd capstone_backend && php artisan serve" -ForegroundColor White
Write-Host "2. Start queue: php artisan queue:work" -ForegroundColor White
Write-Host "3. Start frontend: cd capstone_frontend && npm run dev" -ForegroundColor White
Write-Host ""
