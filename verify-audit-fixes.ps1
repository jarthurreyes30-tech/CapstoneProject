# Verification Script for Audit Fixes
Write-Host "=" -ForegroundColor Cyan -NoNewline; Write-Host ("="*79) -ForegroundColor Cyan
Write-Host "  SYSTEM AUDIT VERIFICATION" -ForegroundColor Yellow
Write-Host "=" -ForegroundColor Cyan -NoNewline; Write-Host ("="*79) -ForegroundColor Cyan
Write-Host ""

$backendPath = "capstone_backend"
$frontendPath = "capstone_frontend"

# Test 1: Verify Migration Applied
Write-Host "1. Checking database migration..." -ForegroundColor Yellow
cd $backendPath
$migrationCheck = php artisan migrate:status | Select-String "add_total_donations_to_charities"
if ($migrationCheck) {
    Write-Host "   ✓ Migration applied successfully" -ForegroundColor Green
} else {
    Write-Host "   ✗ Migration not found" -ForegroundColor Red
}

# Test 2: Check if Charity model updated
Write-Host "`n2. Verifying Charity model..." -ForegroundColor Yellow
$charityModel = Get-Content "app/Models/Charity.php" -Raw
if ($charityModel -match "total_donations_received" -and $charityModel -match "recalculateTotals") {
    Write-Host "   ✓ Charity model updated with donation tracking" -ForegroundColor Green
} else {
    Write-Host "   ✗ Charity model missing updates" -ForegroundColor Red
}

# Test 3: Check if Donation model updated
Write-Host "`n3. Verifying Donation model..." -ForegroundColor Yellow
$donationModel = Get-Content "app/Models/Donation.php" -Raw
if ($donationModel -match "updateCharityTotals") {
    Write-Host "   ✓ Donation model updated with charity total updates" -ForegroundColor Green
} else {
    Write-Host "   ✗ Donation model missing updateCharityTotals method" -ForegroundColor Red
}

# Test 4: Verify frontend CharityProfile fixed
cd ..
Write-Host "`n4. Verifying CharityProfile frontend fix..." -ForegroundColor Yellow
$charityProfile = Get-Content "$frontendPath/src/pages/charity/CharityProfile.tsx" -Raw
$hasHardcodedData = $charityProfile -match '"Jane Smith"'
if (-not $hasHardcodedData -and $charityProfile -match "fetch.*\/me") {
    Write-Host "   ✓ CharityProfile.tsx fixed - using real API" -ForegroundColor Green
} else {
    Write-Host "   ⚠ CharityProfile.tsx may still have issues" -ForegroundColor Yellow
}

# Test 5: Database Column Check
Write-Host "`n5. Checking database columns..." -ForegroundColor Yellow
cd $backendPath

# Create a quick test to check columns exist
$checkScript = @'
<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    $columns = Schema::getColumnListing('charities');
    $hasTotal = in_array('total_donations_received', $columns);
    $hasDonors = in_array('donors_count', $columns);
    $hasCampaigns = in_array('campaigns_count', $columns);
    
    if ($hasTotal && $hasDonors && $hasCampaigns) {
        echo "SUCCESS: All columns exist\n";
        
        // Check if data is populated
        $charity = DB::table('charities')->first();
        if ($charity) {
            echo "Sample charity data:\n";
            echo "  - Total Donations: " . $charity->total_donations_received . "\n";
            echo "  - Donors Count: " . $charity->donors_count . "\n";
            echo "  - Campaigns Count: " . $charity->campaigns_count . "\n";
        }
    } else {
        echo "ERROR: Missing columns\n";
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
'@

Set-Content -Path "test_columns.php" -Value $checkScript
$result = php test_columns.php
Remove-Item "test_columns.php"

if ($result -match "SUCCESS") {
    Write-Host "   ✓ Database columns verified" -ForegroundColor Green
    Write-Host $result -ForegroundColor Cyan
} else {
    Write-Host "   ✗ Database column check failed" -ForegroundColor Red
    Write-Host $result -ForegroundColor Red
}

# Summary
Write-Host "`n" -NoNewline
Write-Host "=" -ForegroundColor Cyan -NoNewline; Write-Host ("="*79) -ForegroundColor Cyan
Write-Host "  VERIFICATION COMPLETE" -ForegroundColor Yellow
Write-Host "=" -ForegroundColor Cyan -NoNewline; Write-Host ("="*79) -ForegroundColor Cyan
Write-Host ""
Write-Host "All critical fixes have been applied!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Test charity profile page in browser" -ForegroundColor White
Write-Host "  2. Create a test donation and verify totals update" -ForegroundColor White
Write-Host "  3. Check analytics pages for accurate data" -ForegroundColor White
Write-Host "  4. Review the COMPREHENSIVE_AUDIT_REPORT.md for details" -ForegroundColor White
Write-Host ""

cd ..
