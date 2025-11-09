# CharityHub System Cleanup Script
# Run this to remove duplicate files and clean up the codebase

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CHARITYHUB CLEANUP SCRIPT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"
$filesDeleted = 0
$errors = 0

# Phase 1: Delete Duplicate Frontend Files
Write-Host "Phase 1: Cleaning Frontend Duplicate Files..." -ForegroundColor Yellow
Write-Host ""

$frontendFiles = @(
    "capstone_frontend\src\pages\auth\Login_BACKUP.tsx",
    "capstone_frontend\src\pages\auth\Login_NEW.tsx",
    "capstone_frontend\src\pages\charity\Settings_BACKUP.tsx",
    "capstone_frontend\src\pages\charity\Settings_NEW.tsx",
    "capstone_frontend\src\pages\donor\TwoFactorAuth_BACKUP.tsx",
    "capstone_frontend\src\pages\donor\TwoFactorAuth_NEW.tsx",
    "capstone_frontend\src\pages\charity\Dashboard.tsx"  # Keep CharityDashboard.tsx
)

foreach ($file in $frontendFiles) {
    $fullPath = Join-Path $PSScriptRoot $file
    if (Test-Path $fullPath) {
        try {
            Remove-Item $fullPath -Force
            Write-Host "[OK] Deleted: $file" -ForegroundColor Green
            $filesDeleted++
        }
        catch {
            Write-Host "[ERROR] Failed to delete: $file" -ForegroundColor Red
            $errors++
        }
    }
    else {
        Write-Host "[SKIP] Not found: $file" -ForegroundColor Gray
    }
}

Write-Host ""

# Phase 2: Delete Duplicate Backend Controllers
Write-Host "Phase 2: Cleaning Backend Duplicate Controllers..." -ForegroundColor Yellow
Write-Host ""

$backendControllers = @(
    "capstone_backend\app\Http\Controllers\DonationChannelController.php",
    "capstone_backend\app\Http\Controllers\DonorProfileController.php",
    "capstone_backend\app\Http\Controllers\CharityFollowController.php"
)

foreach ($controller in $backendControllers) {
    $fullPath = Join-Path $PSScriptRoot $controller
    if (Test-Path $fullPath) {
        try {
            Remove-Item $fullPath -Force
            Write-Host "[OK] Deleted: $controller" -ForegroundColor Green
            $filesDeleted++
        }
        catch {
            Write-Host "[ERROR] Failed to delete: $controller" -ForegroundColor Red
            $errors++
        }
    }
    else {
        Write-Host "[SKIP] Not found: $controller" -ForegroundColor Gray
    }
}

Write-Host ""

# Phase 3: Create Database Cleanup SQL
Write-Host "Phase 3: Generating Database Cleanup SQL..." -ForegroundColor Yellow
Write-Host ""

$sqlScript = @"
-- CharityHub Database Cleanup Script
-- Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

-- Phase 1: Fix orphaned donation
DELETE FROM donations 
WHERE campaign_id NOT IN (SELECT id FROM campaigns);

-- Phase 2: Consolidate login tables
-- (Migrate data first if failed_logins has important data)
DROP TABLE IF EXISTS failed_login_attempts;
-- DROP TABLE IF EXISTS failed_logins;  -- Uncomment after data migration

-- Phase 3: Remove duplicate email table
DROP TABLE IF EXISTS email_changes;

-- Phase 4: Remove unused tables
DROP TABLE IF EXISTS volunteers;
DROP TABLE IF EXISTS two_factor_codes;
DROP TABLE IF EXISTS donor_milestones;

-- Verification queries
SELECT 'Orphaned donations check:' as info, COUNT(*) as count 
FROM donations 
WHERE campaign_id NOT IN (SELECT id FROM campaigns);

SELECT 'Total tables:' as info, COUNT(*) as count 
FROM information_schema.tables 
WHERE table_schema = 'capstone_db';
"@

$sqlPath = Join-Path $PSScriptRoot "database_cleanup.sql"
$sqlScript | Out-File -FilePath $sqlPath -Encoding UTF8
Write-Host "[OK] Created: database_cleanup.sql" -ForegroundColor Green
Write-Host "    Run this SQL script in phpMyAdmin or MySQL client" -ForegroundColor Gray

Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CLEANUP SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Files deleted: $filesDeleted" -ForegroundColor Green
Write-Host "Errors: $errors" -ForegroundColor $(if($errors -gt 0){"Red"}else{"Green"})
Write-Host ""

if ($errors -eq 0) {
    Write-Host "[SUCCESS] Cleanup completed successfully!" -ForegroundColor Green
}
else {
    Write-Host "[WARNING] Cleanup completed with errors" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Run database_cleanup.sql in phpMyAdmin" -ForegroundColor White
Write-Host "2. Restart backend server: cd capstone_backend && php artisan serve" -ForegroundColor White
Write-Host "3. Test the application thoroughly" -ForegroundColor White
Write-Host ""

# Pause to let user read
Read-Host "Press Enter to exit"
