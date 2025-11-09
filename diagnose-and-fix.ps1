# Complete Diagnosis and Fix Script
# This script will:
# 1. Run deep diagnosis to find all problems
# 2. Apply fixes based on findings
# 3. Verify the fixes worked

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "   COMPLETE REFUND DIAGNOSIS & FIX" -ForegroundColor Cyan  
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to backend directory
Set-Location -Path "capstone_backend"

# Step 1: Run Diagnosis
Write-Host "===============================================" -ForegroundColor Yellow
Write-Host "STEP 1: DEEP DIAGNOSIS" -ForegroundColor Yellow
Write-Host "===============================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Analyzing refund system..." -ForegroundColor White
Write-Host ""

php diagnose_refund_problem.php | Tee-Object -FilePath "../diagnosis_detailed.txt"

Write-Host ""
Write-Host "Diagnosis complete! Saved to: diagnosis_detailed.txt" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to continue with fixes..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Write-Host ""

# Step 2: Check if migrations need to be run
Write-Host "===============================================" -ForegroundColor Yellow
Write-Host "STEP 2: CHECKING MIGRATIONS" -ForegroundColor Yellow
Write-Host "===============================================" -ForegroundColor Yellow
Write-Host ""

$migrationsNeeded = Select-String -Path "../diagnosis_detailed.txt" -Pattern "Migration.*NOT run" -Quiet

if ($migrationsNeeded) {
    Write-Host "⚠️  Migrations need to be run!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Running migrations..." -ForegroundColor White
    php artisan migrate --force
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Migrations completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Migration failed!" -ForegroundColor Red
        Write-Host "Please check the error above and fix manually." -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ All migrations are up to date" -ForegroundColor Green
}

Write-Host ""

# Step 3: Clear caches
Write-Host "===============================================" -ForegroundColor Yellow
Write-Host "STEP 3: CLEARING CACHES" -ForegroundColor Yellow
Write-Host "===============================================" -ForegroundColor Yellow
Write-Host ""

Write-Host "Clearing config cache..." -ForegroundColor White
php artisan config:clear

Write-Host "Clearing application cache..." -ForegroundColor White
php artisan cache:clear

Write-Host "Clearing route cache..." -ForegroundColor White
php artisan route:clear

Write-Host "Clearing view cache..." -ForegroundColor White
php artisan view:clear

Write-Host ""
Write-Host "✅ All caches cleared" -ForegroundColor Green
Write-Host ""

# Step 4: Apply the refund fix
Write-Host "===============================================" -ForegroundColor Yellow
Write-Host "STEP 4: APPLYING REFUND FIX" -ForegroundColor Yellow
Write-Host "===============================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Attempting to fix the approved refund..." -ForegroundColor White
Write-Host ""

php fix_aeron_refund.php

$fixResult = $LASTEXITCODE

Write-Host ""

if ($fixResult -eq 0) {
    Write-Host "✅ Refund fix applied successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Refund fix encountered issues" -ForegroundColor Yellow
    Write-Host "See output above for details" -ForegroundColor White
}

Write-Host ""
Write-Host "Press any key to continue with verification..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Write-Host ""

# Step 5: Verify the fix
Write-Host "===============================================" -ForegroundColor Yellow
Write-Host "STEP 5: VERIFICATION" -ForegroundColor Yellow
Write-Host "===============================================" -ForegroundColor Yellow
Write-Host ""

php check_specific_refunds.php | Tee-Object -FilePath "../verification_result.txt"

Write-Host ""
Write-Host "Verification complete! Saved to: verification_result.txt" -ForegroundColor Green
Write-Host ""

# Step 6: Check the actual database
Write-Host "===============================================" -ForegroundColor Yellow
Write-Host "STEP 6: DIRECT DATABASE CHECK" -ForegroundColor Yellow
Write-Host "===============================================" -ForegroundColor Yellow
Write-Host ""

# Create a simple query file
$queryFile = "temp_verify_query.sql"
$query = @"
SELECT 
    d.id,
    d.status,
    d.is_refunded,
    d.amount,
    rr.status as refund_status,
    u.name as donor
FROM donations d
INNER JOIN refund_requests rr ON d.id = rr.donation_id
INNER JOIN users u ON rr.user_id = u.id
WHERE d.amount = 2070.00 AND rr.status = 'approved'
LIMIT 1;
"@

Set-Content -Path $queryFile -Value $query

Write-Host "Checking database directly..." -ForegroundColor White
Write-Host ""

# Try to read .env for database credentials
if (Test-Path ".env") {
    $envContent = Get-Content ".env" | Out-String
    
    if ($envContent -match "DB_DATABASE=(.+)") {
        $dbName = $matches[1]
        
        Write-Host "Database: $dbName" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "SQL Query Result:" -ForegroundColor Cyan
        Write-Host "----------------" -ForegroundColor Cyan
        
        # Try to run the query if mysql is available
        $mysqlAvailable = Get-Command mysql -ErrorAction SilentlyContinue
        
        if ($mysqlAvailable) {
            try {
                if ($envContent -match "DB_USERNAME=(.+)") { $dbUser = $matches[1] }
                if ($envContent -match "DB_PASSWORD=(.+)") { $dbPass = $matches[1] }
                if ($envContent -match "DB_HOST=(.+)") { $dbHost = $matches[1] } else { $dbHost = "127.0.0.1" }
                if ($envContent -match "DB_PORT=(.+)") { $dbPort = $matches[1] } else { $dbPort = "3306" }
                
                if ($dbPass) {
                    mysql -h $dbHost -P $dbPort -u $dbUser -p"$dbPass" $dbName -e $query
                } else {
                    mysql -h $dbHost -P $dbPort -u $dbUser $dbName -e $query
                }
            } catch {
                Write-Host "Could not connect to MySQL directly" -ForegroundColor Yellow
                Write-Host "Check database manually using:" -ForegroundColor Yellow
                Write-Host "  mysql -u root -p" -ForegroundColor White
                Write-Host "  USE $dbName;" -ForegroundColor White
                Write-Host "  $query" -ForegroundColor White
            }
        } else {
            Write-Host "MySQL command line not available" -ForegroundColor Yellow
            Write-Host "Check database using phpMyAdmin or MySQL Workbench" -ForegroundColor Yellow
        }
    }
}

Remove-Item $queryFile -ErrorAction SilentlyContinue

Write-Host ""

# Return to parent directory
Set-Location -Path ".."

# Final Summary
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "FINAL SUMMARY" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "COMPLETED STEPS:" -ForegroundColor Green
Write-Host "  ✓ Deep diagnosis performed" -ForegroundColor White
Write-Host "  ✓ Migrations checked/run" -ForegroundColor White
Write-Host "  ✓ Caches cleared" -ForegroundColor White
Write-Host "  ✓ Refund fix attempted" -ForegroundColor White
Write-Host "  ✓ Verification completed" -ForegroundColor White
Write-Host "  ✓ Database checked" -ForegroundColor White
Write-Host ""

Write-Host "FILES CREATED:" -ForegroundColor Cyan
Write-Host "  - diagnosis_detailed.txt (full diagnosis)" -ForegroundColor White
Write-Host "  - verification_result.txt (verification results)" -ForegroundColor White
Write-Host ""

Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Review diagnosis_detailed.txt for any remaining issues" -ForegroundColor White
Write-Host "2. Restart your Laravel server:" -ForegroundColor White
Write-Host "   cd capstone_backend" -ForegroundColor Gray
Write-Host "   php artisan serve" -ForegroundColor Gray
Write-Host "3. Hard refresh your browser (Ctrl+F5)" -ForegroundColor White
Write-Host "4. Check the refund page again" -ForegroundColor White
Write-Host ""

Write-Host "IF STILL NOT WORKING:" -ForegroundColor Red
Write-Host "  Open diagnosis_detailed.txt and look for lines marked with ❌" -ForegroundColor White
Write-Host "  Those indicate the specific problems that need to be fixed" -ForegroundColor White
Write-Host ""

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
