# Fix Individual Donations Display
# This script creates individual activity logs for each donation

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Fix Individual Donations Display" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Database configuration
$dbHost = "localhost"
$dbName = "charityhub"
$dbUser = "root"
$dbPass = ""

function Run-Query {
    param([string]$Query, [string]$Description)
    
    if ($Description) {
        Write-Host $Description -ForegroundColor Yellow
    }
    
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

Write-Host "Step 1: Checking current state..." -ForegroundColor Cyan
Write-Host ""

$totalDonations = Run-Query "SELECT COUNT(*) FROM donations WHERE DATE(created_at) = '2025-10-28';" "Counting donations on 2025-10-28..."
$totalLogs = Run-Query "SELECT COUNT(*) FROM activity_logs WHERE action = 'donation_created' AND DATE(created_at) = '2025-10-28';" "Counting activity logs..."

Write-Host ""
Write-Host "Donations on 2025-10-28: $totalDonations" -ForegroundColor White
Write-Host "Activity logs: $totalLogs" -ForegroundColor White
Write-Host ""

if ([int]$totalDonations -eq [int]$totalLogs) {
    Write-Host "✓ Donations and logs match! Each donation already has a log." -ForegroundColor Green
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

Write-Host "⚠ Mismatch detected: $totalDonations donations but only $totalLogs logs" -ForegroundColor Yellow
Write-Host ""

# Show donor breakdown
Write-Host "Donor Breakdown:" -ForegroundColor Cyan
$breakdown = @"
SELECT 
    u.name,
    COUNT(d.id) as donations,
    COUNT(al.id) as logs
FROM donations d
JOIN users u ON u.id = d.donor_id
LEFT JOIN activity_logs al ON 
    al.action = 'donation_created' 
    AND JSON_EXTRACT(al.details, '$.donation_id') = d.id
WHERE DATE(d.created_at) = '2025-10-28'
GROUP BY u.id, u.name
ORDER BY donations DESC;
"@

$result = Run-Query $breakdown
if ($result) {
    $result -split "`n" | ForEach-Object {
        $parts = $_ -split "`t"
        if ($parts.Count -ge 3) {
            $name = $parts[0]
            $donations = $parts[1]
            $logs = $parts[2]
            
            if ([int]$donations -ne [int]$logs) {
                Write-Host "  ⚠ $name : $donations donations but $logs logs" -ForegroundColor Yellow
            } else {
                Write-Host "  ✓ $name : $donations donations, $logs logs" -ForegroundColor Green
            }
        }
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "FIX OPTIONS" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "1. Run automatic fix (creates individual logs)" -ForegroundColor White
Write-Host "2. View detailed breakdown first" -ForegroundColor White
Write-Host "3. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-3)"

if ($choice -eq "2") {
    Write-Host ""
    Write-Host "Detailed Breakdown:" -ForegroundColor Cyan
    Write-Host ""
    
    # Show Aaron's donations
    Write-Host "Aaron Dave Lim Sagan - Individual Donations:" -ForegroundColor Yellow
    $aaronQuery = @"
SELECT 
    d.id,
    d.amount,
    DATE_FORMAT(d.created_at, '%H:%i:%s') as time,
    CASE WHEN al.id IS NOT NULL THEN 'HAS LOG' ELSE 'MISSING' END as log_status
FROM donations d
JOIN users u ON u.id = d.donor_id
LEFT JOIN activity_logs al ON 
    al.action = 'donation_created' 
    AND JSON_EXTRACT(al.details, '$.donation_id') = d.id
WHERE u.name LIKE '%Aaron%Dave%'
ORDER BY d.created_at;
"@
    
    $aaronResult = Run-Query $aaronQuery
    if ($aaronResult) {
        $aaronResult -split "`n" | ForEach-Object {
            Write-Host "  $_" -ForegroundColor White
        }
    }
    
    Write-Host ""
    Write-Host "Press any key to continue to fix..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    $choice = "1"
}

if ($choice -eq "1") {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "RUNNING FIX" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "⚠ WARNING: This will create individual activity logs for each donation" -ForegroundColor Yellow
    Write-Host "Type 'FIX' to proceed: " -NoNewline
    $confirm = Read-Host
    
    if ($confirm -ne "FIX") {
        Write-Host "Fix cancelled." -ForegroundColor Yellow
        exit
    }
    
    Write-Host ""
    Write-Host "Creating backup..." -ForegroundColor Yellow
    Run-Query "CREATE TABLE IF NOT EXISTS activity_logs_backup_donations AS SELECT * FROM activity_logs WHERE action = 'donation_created';"
    Write-Host "✓ Backup created" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Deleting incorrect aggregated logs..." -ForegroundColor Yellow
    $deleteQuery = @"
DELETE al FROM activity_logs al
WHERE al.action = 'donation_created'
  AND (
    JSON_EXTRACT(al.details, '$.donation_id') IS NULL
    OR NOT EXISTS (
      SELECT 1 FROM donations d 
      WHERE d.id = JSON_EXTRACT(al.details, '$.donation_id')
    )
  );
"@
    Run-Query $deleteQuery
    Write-Host "✓ Invalid logs removed" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Creating individual activity logs..." -ForegroundColor Yellow
    $insertQuery = @"
INSERT INTO activity_logs (user_id, user_role, action, details, ip_address, user_agent, session_id, created_at, updated_at)
SELECT 
    d.donor_id,
    u.role,
    'donation_created',
    JSON_OBJECT(
        'donation_id', d.id,
        'amount', d.amount,
        'campaign_id', d.campaign_id,
        'charity_id', d.charity_id,
        'is_anonymous', d.is_anonymous,
        'is_recurring', d.is_recurring,
        'status', d.status,
        'timestamp', DATE_FORMAT(d.created_at, '%Y-%m-%dT%H:%i:%s.000000Z')
    ),
    '127.0.0.1',
    'System/Regenerated',
    NULL,
    d.created_at,
    d.created_at
FROM donations d
JOIN users u ON u.id = d.donor_id
WHERE NOT EXISTS (
    SELECT 1 FROM activity_logs al
    WHERE al.action = 'donation_created'
      AND al.user_id = d.donor_id
      AND JSON_EXTRACT(al.details, '$.donation_id') = d.id
);
"@
    Run-Query $insertQuery
    Write-Host "✓ Individual logs created!" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Verifying..." -ForegroundColor Yellow
    $newTotal = Run-Query "SELECT COUNT(*) FROM activity_logs WHERE action = 'donation_created' AND DATE(created_at) = '2025-10-28';"
    Write-Host "✓ Now have $newTotal activity logs for $totalDonations donations" -ForegroundColor Green
    Write-Host ""
    
    if ([int]$totalDonations -eq [int]$newTotal) {
        Write-Host "==========================================" -ForegroundColor Green
        Write-Host "SUCCESS!" -ForegroundColor Green
        Write-Host "==========================================" -ForegroundColor Green
        Write-Host "✓ Each donation now has its own activity log" -ForegroundColor Green
        Write-Host "✓ No more totaled amounts" -ForegroundColor Green
        Write-Host "✓ All donations show individually" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Restart backend server" -ForegroundColor White
        Write-Host "2. Clear browser cache (Ctrl+Shift+R)" -ForegroundColor White
        Write-Host "3. Check Action Logs page in admin dashboard" -ForegroundColor White
        Write-Host "4. Filter by 'Donation Created' to verify" -ForegroundColor White
    } else {
        Write-Host "⚠ Warning: Counts still don't match" -ForegroundColor Yellow
        Write-Host "  Donations: $totalDonations" -ForegroundColor White
        Write-Host "  Logs: $newTotal" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
