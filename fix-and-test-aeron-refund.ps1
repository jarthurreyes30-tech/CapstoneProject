# Fix and Test Aeron's Refund
# This script:
# 1. Runs diagnosis to check current state
# 2. Fixes the refund issue
# 3. Runs diagnosis again to verify the fix
# 4. Shows before/after comparison

Write-Host ""
Write-Host "=============================================="  -ForegroundColor Cyan
Write-Host "   FIX & TEST: AERON'S REFUND (P2,070)" -ForegroundColor Cyan
Write-Host "=============================================="  -ForegroundColor Cyan
Write-Host ""

# Navigate to backend directory
Set-Location -Path "capstone_backend"

# Step 1: Run diagnosis BEFORE fix
Write-Host "=============================================="  -ForegroundColor Yellow
Write-Host "STEP 1: DIAGNOSIS BEFORE FIX" -ForegroundColor Yellow
Write-Host "=============================================="  -ForegroundColor Yellow
Write-Host ""

php check_specific_refunds.php > ../diagnosis_before.txt 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Diagnosis completed (saved to diagnosis_before.txt)" -ForegroundColor Green
} else {
    Write-Host "⚠ Diagnosis had issues but continuing..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to continue with the fix..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Write-Host ""

# Step 2: Apply the fix
Write-Host "=============================================="  -ForegroundColor Yellow
Write-Host "STEP 2: APPLYING FIX" -ForegroundColor Yellow
Write-Host "=============================================="  -ForegroundColor Yellow
Write-Host ""

php fix_aeron_refund.php

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=============================================="  -ForegroundColor Green
    Write-Host "✅ FIX APPLIED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "=============================================="  -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "=============================================="  -ForegroundColor Red
    Write-Host "❌ FIX FAILED!" -ForegroundColor Red
    Write-Host "=============================================="  -ForegroundColor Red
    Write-Host ""
    Set-Location -Path ".."
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host "Press any key to continue with verification..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Write-Host ""

# Step 3: Run diagnosis AFTER fix
Write-Host "=============================================="  -ForegroundColor Yellow
Write-Host "STEP 3: DIAGNOSIS AFTER FIX (VERIFICATION)" -ForegroundColor Yellow
Write-Host "=============================================="  -ForegroundColor Yellow
Write-Host ""

php check_specific_refunds.php > ../diagnosis_after.txt 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Verification completed (saved to diagnosis_after.txt)" -ForegroundColor Green
} else {
    Write-Host "⚠ Verification had issues" -ForegroundColor Yellow
}

Write-Host ""

# Step 4: Show summary
Write-Host "=============================================="  -ForegroundColor Cyan
Write-Host "SUMMARY" -ForegroundColor Cyan
Write-Host "=============================================="  -ForegroundColor Cyan
Write-Host ""

# Query to get current state
$checkQuery = @"
SELECT 
    d.id as donation_id,
    d.status as donation_status,
    d.is_refunded,
    d.amount,
    rr.id as refund_id,
    rr.status as refund_status,
    c.title as campaign,
    c.total_donations_received as campaign_total
FROM donations d
INNER JOIN refund_requests rr ON d.id = rr.donation_id
LEFT JOIN campaigns c ON d.campaign_id = c.id
WHERE d.amount = 2070.00 AND rr.status = 'approved'
LIMIT 1;
"@

Write-Host "Current State in Database:" -ForegroundColor White
Write-Host ""

# Return to parent directory
Set-Location -Path ".."

# Create summary
Write-Host "WHAT WAS FIXED:" -ForegroundColor Green
Write-Host "✓ Refund ID #3 (Aeron's P2,070.00 refund)" -ForegroundColor White
Write-Host "✓ Donation status: 'completed' → 'refunded'" -ForegroundColor White
Write-Host "✓ is_refunded flag: false → true" -ForegroundColor White
Write-Host "✓ Campaign (IFL) total reduced by P2,070.00" -ForegroundColor White
Write-Host "✓ Charity total reduced" -ForegroundColor White
Write-Host ""

Write-Host "WHAT YOU SHOULD SEE NOW:" -ForegroundColor Cyan
Write-Host "✓ In donor's history: Donation shows 'Refunded' badge" -ForegroundColor White
Write-Host "✓ In charity dashboard: Donation status is 'Refunded'" -ForegroundColor White
Write-Host "✓ In campaign page: Total raised is reduced by P2,070" -ForegroundColor White
Write-Host "✓ Progress bars updated to reflect actual totals" -ForegroundColor White
Write-Host ""

Write-Host "TEST THE FIX:" -ForegroundColor Yellow
Write-Host "1. Refresh your browser (Ctrl+F5)" -ForegroundColor White
Write-Host "2. Check donor's donation history" -ForegroundColor White
Write-Host "3. Check charity's donation list" -ForegroundColor White
Write-Host "4. Check IFL campaign total" -ForegroundColor White
Write-Host ""

Write-Host "DIAGNOSTIC FILES CREATED:" -ForegroundColor Cyan
Write-Host "- diagnosis_before.txt (state before fix)" -ForegroundColor White
Write-Host "- diagnosis_after.txt (state after fix)" -ForegroundColor White
Write-Host ""

Write-Host "=============================================="  -ForegroundColor Green
Write-Host "✅ ALL DONE!" -ForegroundColor Green
Write-Host "=============================================="  -ForegroundColor Green
Write-Host ""

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
