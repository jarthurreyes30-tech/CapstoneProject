# Check Action Logs Statistics Accuracy
# Compares what Admin Dashboard shows vs actual database

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Action Logs Statistics Accuracy Check" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Database configuration
$dbHost = "localhost"
$dbName = "charityhub"
$dbUser = "root"
$dbPass = ""

# Function to run SQL query
function Run-Query {
    param([string]$Query, [string]$Description)
    
    Write-Host "$Description" -ForegroundColor Yellow
    
    try {
        $command = "mysql -h$dbHost -u$dbUser"
        if ($dbPass) { $command += " -p$dbPass" }
        $command += " -N -e `"$Query`" $dbName"
        
        $result = Invoke-Expression $command
        return $result
    } catch {
        Write-Host "Error: $_" -ForegroundColor Red
        return $null
    }
}

Write-Host "Checking database statistics..." -ForegroundColor White
Write-Host ""

# Get current statistics
$totalActivities = Run-Query "SELECT COUNT(*) FROM activity_logs al WHERE EXISTS (SELECT 1 FROM users u WHERE u.id = al.user_id);" "Calculating Total Activities..."

$donations = Run-Query "SELECT COUNT(*) FROM activity_logs al WHERE al.action IN ('donation_created', 'donation_confirmed', 'donation_rejected') AND EXISTS (SELECT 1 FROM users u WHERE u.id = al.user_id);" "Calculating Donations..."

$campaigns = Run-Query "SELECT COUNT(*) FROM activity_logs al WHERE al.action = 'campaign_created' AND EXISTS (SELECT 1 FROM users u WHERE u.id = al.user_id);" "Calculating Campaigns Created..."

$registrations = Run-Query "SELECT COUNT(*) FROM activity_logs al WHERE al.action IN ('register', 'user_registered') AND EXISTS (SELECT 1 FROM users u WHERE u.id = al.user_id);" "Calculating New Registrations..."

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "RESULTS" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Display results
Write-Host "These are the ACCURATE numbers from your database:" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Total Activities: " -NoNewline -ForegroundColor White
Write-Host "$totalActivities" -ForegroundColor Cyan
Write-Host "   All user actions" -ForegroundColor Gray
Write-Host ""

Write-Host "💰 Donations: " -NoNewline -ForegroundColor White
Write-Host "$donations" -ForegroundColor Cyan
Write-Host "   Total donation actions" -ForegroundColor Gray
Write-Host ""

Write-Host "📢 Campaigns Created: " -NoNewline -ForegroundColor White
Write-Host "$campaigns" -ForegroundColor Cyan
Write-Host "   New campaigns" -ForegroundColor Gray
Write-Host ""

Write-Host "👥 New Registrations: " -NoNewline -ForegroundColor White
Write-Host "$registrations" -ForegroundColor Cyan
Write-Host "   User signups" -ForegroundColor Gray
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "COMPARISON" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "What you reported seeing in Admin Dashboard:" -ForegroundColor Yellow
Write-Host "  Total Activities: 330" -ForegroundColor White
Write-Host "  Donations: 3" -ForegroundColor White
Write-Host "  Campaigns Created: 8" -ForegroundColor White
Write-Host "  New Registrations: 10" -ForegroundColor White
Write-Host ""

Write-Host "What SHOULD be showing (from database):" -ForegroundColor Yellow
Write-Host "  Total Activities: $totalActivities" -ForegroundColor White
Write-Host "  Donations: $donations" -ForegroundColor White
Write-Host "  Campaigns Created: $campaigns" -ForegroundColor White
Write-Host "  New Registrations: $registrations" -ForegroundColor White
Write-Host ""

# Check for issues
$orphanedLogs = Run-Query "SELECT COUNT(*) FROM activity_logs al LEFT JOIN users u ON u.id = al.user_id WHERE al.user_id IS NOT NULL AND u.id IS NULL;" "Checking for orphaned logs..."

if ([int]$orphanedLogs -gt 0) {
    Write-Host "⚠ WARNING: Found $orphanedLogs orphaned logs (logs with deleted users)" -ForegroundColor Red
    Write-Host "  These logs are being excluded from statistics." -ForegroundColor Yellow
    Write-Host "  Run clean-activity-logs.sql to remove them." -ForegroundColor Yellow
    Write-Host ""
}

# Check data accuracy
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "DATA ACCURACY CHECK" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$actualDonations = Run-Query "SELECT COUNT(*) FROM donations;" "Checking actual donations in database..."
$donationLogs = Run-Query "SELECT COUNT(*) FROM activity_logs WHERE action = 'donation_created' AND EXISTS (SELECT 1 FROM users u WHERE u.id = user_id);" "Checking donation_created logs..."

Write-Host "Actual Donations in Database: $actualDonations" -ForegroundColor White
Write-Host "Donation_created Logs: $donationLogs" -ForegroundColor White

if ([int]$actualDonations -ne [int]$donationLogs) {
    Write-Host "⚠ Mismatch detected! Some donations are not being logged." -ForegroundColor Yellow
} else {
    Write-Host "✓ Perfect match! All donations are logged." -ForegroundColor Green
}
Write-Host ""

$actualCampaigns = Run-Query "SELECT COUNT(*) FROM campaigns;" "Checking actual campaigns in database..."
$campaignLogs = Run-Query "SELECT COUNT(*) FROM activity_logs WHERE action = 'campaign_created' AND EXISTS (SELECT 1 FROM users u WHERE u.id = user_id);" "Checking campaign_created logs..."

Write-Host "Actual Campaigns in Database: $actualCampaigns" -ForegroundColor White
Write-Host "Campaign_created Logs: $campaignLogs" -ForegroundColor White

if ([int]$actualCampaigns -ne [int]$campaignLogs) {
    Write-Host "⚠ Mismatch detected! Some campaigns are not being logged." -ForegroundColor Yellow
} else {
    Write-Host "✓ Perfect match! All campaigns are logged." -ForegroundColor Green
}
Write-Host ""

$actualUsers = Run-Query "SELECT COUNT(*) FROM users;" "Checking actual users in database..."
$registrationLogs = Run-Query "SELECT COUNT(*) FROM activity_logs WHERE action IN ('register', 'user_registered') AND EXISTS (SELECT 1 FROM users u WHERE u.id = user_id);" "Checking registration logs..."

Write-Host "Actual Users in Database: $actualUsers" -ForegroundColor White
Write-Host "Registration Logs: $registrationLogs" -ForegroundColor White

if ([int]$actualUsers -ne [int]$registrationLogs) {
    Write-Host "⚠ Not all users have registration logs (this is normal for admin accounts)" -ForegroundColor Yellow
} else {
    Write-Host "✓ Perfect match! All users have registration logs." -ForegroundColor Green
}
Write-Host ""

# Show recent activity
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "RECENT ACTIVITY (Last 10)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$recentQuery = @"
SELECT CONCAT(u.name, ' (', u.role, ') - ', al.action, ' - ', DATE_FORMAT(al.created_at, '%Y-%m-%d %H:%i')) as activity
FROM activity_logs al
JOIN users u ON u.id = al.user_id
ORDER BY al.created_at DESC
LIMIT 10;
"@

$recent = Run-Query $recentQuery "Fetching recent activity..."
if ($recent) {
    $recent -split "`n" | ForEach-Object {
        Write-Host "  $_" -ForegroundColor White
    }
} else {
    Write-Host "  No recent activity found" -ForegroundColor Gray
}
Write-Host ""

# Action items
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "ACTION ITEMS" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

if ([int]$orphanedLogs -gt 0) {
    Write-Host "1. ⚠ Clean up $orphanedLogs orphaned logs:" -ForegroundColor Yellow
    Write-Host "   Run: .\clean-and-verify-activity-logs.ps1" -ForegroundColor White
    Write-Host "   Or:  SOURCE c:/Users/ycel_/Final/clean-activity-logs.sql;" -ForegroundColor White
    Write-Host ""
}

Write-Host "2. 🔄 Restart your backend server:" -ForegroundColor Yellow
Write-Host "   cd capstone_backend" -ForegroundColor White
Write-Host "   php artisan serve" -ForegroundColor White
Write-Host ""

Write-Host "3. 🌐 Refresh Admin Dashboard:" -ForegroundColor Yellow
Write-Host "   Clear browser cache (Ctrl+Shift+R)" -ForegroundColor White
Write-Host "   Navigate to: http://localhost:5173/admin/action-logs" -ForegroundColor White
Write-Host ""

Write-Host "4. ✓ Verify the numbers match what's shown above" -ForegroundColor Yellow
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "SUMMARY" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

if ([int]$orphanedLogs -eq 0) {
    Write-Host "✓ Database is clean!" -ForegroundColor Green
    Write-Host "✓ Statistics should be accurate" -ForegroundColor Green
    Write-Host "✓ Admin Dashboard should show: Total=$totalActivities, Donations=$donations, Campaigns=$campaigns, Registrations=$registrations" -ForegroundColor Green
} else {
    Write-Host "⚠ Database needs cleanup" -ForegroundColor Yellow
    Write-Host "  After cleanup, stats will show: Total=$totalActivities, Donations=$donations, Campaigns=$campaigns, Registrations=$registrations" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
