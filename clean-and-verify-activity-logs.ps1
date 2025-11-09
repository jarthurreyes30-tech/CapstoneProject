# Clean and Verify Activity Logs
# This script helps clean seeded data and verify accuracy

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Activity Logs Cleanup & Verification Tool" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Database configuration
$dbHost = "localhost"
$dbName = "charityhub"
$dbUser = "root"
$dbPass = ""

Write-Host "Database Configuration:" -ForegroundColor Yellow
Write-Host "  Host: $dbHost" -ForegroundColor White
Write-Host "  Database: $dbName" -ForegroundColor White
Write-Host "  User: $dbUser" -ForegroundColor White
Write-Host ""

# Function to execute SQL file
function Execute-SqlFile {
    param(
        [string]$FilePath,
        [string]$Description
    )
    
    Write-Host "Executing: $Description" -ForegroundColor Yellow
    
    try {
        # Using mysql command line
        $command = "mysql -h$dbHost -u$dbUser"
        if ($dbPass) {
            $command += " -p$dbPass"
        }
        $command += " $dbName < `"$FilePath`""
        
        Invoke-Expression $command
        Write-Host "✓ $Description completed successfully" -ForegroundColor Green
        Write-Host ""
        return $true
    } catch {
        Write-Host "✗ Error: $_" -ForegroundColor Red
        Write-Host ""
        return $false
    }
}

# Function to run SQL query and display results
function Run-SqlQuery {
    param(
        [string]$Query,
        [string]$Description
    )
    
    Write-Host "Running: $Description" -ForegroundColor Yellow
    
    try {
        $command = "mysql -h$dbHost -u$dbUser"
        if ($dbPass) {
            $command += " -p$dbPass"
        }
        $command += " -e `"$Query`" $dbName"
        
        $result = Invoke-Expression $command
        Write-Host $result -ForegroundColor White
        Write-Host ""
        return $true
    } catch {
        Write-Host "✗ Error: $_" -ForegroundColor Red
        Write-Host ""
        return $false
    }
}

# Main menu
$continue = $true
while ($continue) {
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "Main Menu" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "1. Verify Data Integrity (CHECK FIRST!)" -ForegroundColor White
    Write-Host "2. Backup Activity Logs" -ForegroundColor White
    Write-Host "3. Clean Seeded/Invalid Data" -ForegroundColor Yellow
    Write-Host "4. Verify After Cleanup" -ForegroundColor White
    Write-Host "5. Show Recent Activity Logs" -ForegroundColor White
    Write-Host "6. Restore from Backup" -ForegroundColor Red
    Write-Host "7. Exit" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "Enter your choice (1-7)"
    Write-Host ""
    
    switch ($choice) {
        "1" {
            Write-Host "Step 1: Verifying Data Integrity..." -ForegroundColor Cyan
            Write-Host "This will check for orphaned and invalid activity logs." -ForegroundColor White
            Write-Host ""
            
            # Check for orphaned logs
            Run-SqlQuery "SELECT COUNT(*) as orphaned_users FROM activity_logs al LEFT JOIN users u ON u.id = al.user_id WHERE al.user_id IS NOT NULL AND u.id IS NULL;" "Logs with missing users"
            
            Run-SqlQuery "SELECT COUNT(*) as orphaned_donations FROM activity_logs al LEFT JOIN donations d ON d.id = JSON_EXTRACT(al.details, '$.donation_id') WHERE al.action IN ('donation_created', 'donation_confirmed', 'donation_rejected') AND JSON_EXTRACT(al.details, '$.donation_id') IS NOT NULL AND d.id IS NULL;" "Orphaned donation logs"
            
            Run-SqlQuery "SELECT COUNT(*) as orphaned_campaigns FROM activity_logs al LEFT JOIN campaigns c ON c.id = JSON_EXTRACT(al.details, '$.campaign_id') WHERE al.action LIKE 'campaign_%' AND JSON_EXTRACT(al.details, '$.campaign_id') IS NOT NULL AND c.id IS NULL;" "Orphaned campaign logs"
            
            Run-SqlQuery "SELECT action, COUNT(*) as count FROM activity_logs GROUP BY action ORDER BY count DESC LIMIT 10;" "Top 10 action types"
            
            Write-Host "Press any key to continue..." -ForegroundColor Gray
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
        
        "2" {
            Write-Host "Step 2: Creating Backup..." -ForegroundColor Cyan
            Write-Host ""
            
            $backupQuery = "CREATE TABLE IF NOT EXISTS activity_logs_backup AS SELECT * FROM activity_logs;"
            Run-SqlQuery $backupQuery "Creating backup table"
            
            $countQuery = "SELECT COUNT(*) as backup_count FROM activity_logs_backup;"
            Run-SqlQuery $countQuery "Verifying backup"
            
            Write-Host "✓ Backup created successfully!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Press any key to continue..." -ForegroundColor Gray
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
        
        "3" {
            Write-Host "Step 3: Cleaning Seeded/Invalid Data..." -ForegroundColor Cyan
            Write-Host ""
            Write-Host "⚠ WARNING: This will DELETE invalid activity logs!" -ForegroundColor Red
            Write-Host "Make sure you have created a backup first (Option 2)." -ForegroundColor Yellow
            Write-Host ""
            
            $confirm = Read-Host "Type 'YES' to proceed with cleanup"
            
            if ($confirm -eq "YES") {
                Write-Host ""
                Write-Host "Cleaning..." -ForegroundColor Yellow
                
                # Count before
                Run-SqlQuery "SELECT COUNT(*) as before_count FROM activity_logs;" "Records before cleanup"
                
                # Execute cleanup script
                Execute-SqlFile ".\clean-activity-logs.sql" "Activity Logs Cleanup"
                
                # Count after
                Run-SqlQuery "SELECT COUNT(*) as after_count FROM activity_logs;" "Records after cleanup"
                
                Write-Host "✓ Cleanup completed!" -ForegroundColor Green
            } else {
                Write-Host "Cleanup cancelled." -ForegroundColor Yellow
            }
            
            Write-Host ""
            Write-Host "Press any key to continue..." -ForegroundColor Gray
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
        
        "4" {
            Write-Host "Step 4: Verifying After Cleanup..." -ForegroundColor Cyan
            Write-Host ""
            
            Run-SqlQuery "SELECT COUNT(*) as remaining_orphaned FROM activity_logs al LEFT JOIN users u ON u.id = al.user_id WHERE al.user_id IS NOT NULL AND u.id IS NULL;" "Remaining orphaned logs"
            
            Run-SqlQuery "SELECT action, COUNT(*) as count FROM activity_logs GROUP BY action ORDER BY count DESC;" "Action distribution after cleanup"
            
            Run-SqlQuery "SELECT DATE(created_at) as date, COUNT(*) as daily_logs FROM activity_logs WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) GROUP BY DATE(created_at) ORDER BY date DESC;" "Recent activity (last 7 days)"
            
            Write-Host "Press any key to continue..." -ForegroundColor Gray
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
        
        "5" {
            Write-Host "Recent Activity Logs:" -ForegroundColor Cyan
            Write-Host ""
            
            Run-SqlQuery "SELECT al.action, u.name, u.role, al.created_at FROM activity_logs al JOIN users u ON u.id = al.user_id ORDER BY al.created_at DESC LIMIT 20;" "Last 20 activity logs"
            
            Write-Host "Press any key to continue..." -ForegroundColor Gray
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
        
        "6" {
            Write-Host "Step 6: Restore from Backup..." -ForegroundColor Cyan
            Write-Host ""
            Write-Host "⚠ WARNING: This will RESTORE activity logs from backup!" -ForegroundColor Red
            Write-Host "This will DELETE current logs and restore from backup." -ForegroundColor Yellow
            Write-Host ""
            
            $confirm = Read-Host "Type 'RESTORE' to proceed"
            
            if ($confirm -eq "RESTORE") {
                Write-Host ""
                Write-Host "Restoring from backup..." -ForegroundColor Yellow
                
                $restoreQuery = @"
                DROP TABLE IF EXISTS activity_logs;
                CREATE TABLE activity_logs AS SELECT * FROM activity_logs_backup;
"@
                Run-SqlQuery $restoreQuery "Restoring from backup"
                
                Write-Host "✓ Restore completed!" -ForegroundColor Green
            } else {
                Write-Host "Restore cancelled." -ForegroundColor Yellow
            }
            
            Write-Host ""
            Write-Host "Press any key to continue..." -ForegroundColor Gray
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
        
        "7" {
            Write-Host "Exiting..." -ForegroundColor Yellow
            $continue = $false
        }
        
        default {
            Write-Host "Invalid choice. Please try again." -ForegroundColor Red
            Write-Host ""
        }
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Activity logs cleanup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Test admin dashboard Action Logs page" -ForegroundColor White
Write-Host "2. Verify filters work correctly" -ForegroundColor White
Write-Host "3. Check that all actions show real data" -ForegroundColor White
Write-Host "4. Monitor new activity logs going forward" -ForegroundColor White
Write-Host ""
Write-Host "Files created:" -ForegroundColor Yellow
Write-Host "  - clean-activity-logs.sql (cleanup script)" -ForegroundColor White
Write-Host "  - verify-activity-logs-integrity.sql (verification queries)" -ForegroundColor White
Write-Host "  - clean-and-verify-activity-logs.ps1 (this script)" -ForegroundColor White
Write-Host ""
