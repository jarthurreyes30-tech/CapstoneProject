# Check Approved Refunds in Database
# This script runs SQL queries to check the current state of refunds

Write-Host "=============================================="  -ForegroundColor Cyan
Write-Host "   CHECKING APPROVED REFUNDS IN DATABASE" -ForegroundColor Cyan
Write-Host "=============================================="  -ForegroundColor Cyan
Write-Host ""

# Navigate to backend directory
Set-Location -Path "capstone_backend"

# Check if .env file exists
if (!(Test-Path ".env")) {
    Write-Host "❌ ERROR: .env file not found!" -ForegroundColor Red
    Write-Host "Please make sure you're in the correct directory." -ForegroundColor Yellow
    Set-Location -Path ".."
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Read database credentials from .env
Write-Host "Reading database configuration..." -ForegroundColor Yellow
$envContent = Get-Content ".env"
$dbHost = ($envContent | Select-String "DB_HOST=(.*)").Matches.Groups[1].Value
$dbPort = ($envContent | Select-String "DB_PORT=(.*)").Matches.Groups[1].Value
$dbDatabase = ($envContent | Select-String "DB_DATABASE=(.*)").Matches.Groups[1].Value
$dbUsername = ($envContent | Select-String "DB_USERNAME=(.*)").Matches.Groups[1].Value
$dbPassword = ($envContent | Select-String "DB_PASSWORD=(.*)").Matches.Groups[1].Value

if (!$dbHost) { $dbHost = "127.0.0.1" }
if (!$dbPort) { $dbPort = "3306" }

Write-Host "✓ Database: $dbDatabase on $dbHost`:$dbPort" -ForegroundColor Green
Write-Host ""

# Create temporary SQL file with queries
$sqlFile = "temp_check_refunds.sql"
$sqlContent = @"
-- Query 1: All Approved Refunds with Status Check
SELECT 
    CONCAT('Refund #', rr.id) AS refund,
    u.name AS donor_name,
    CONCAT('₱', FORMAT(d.amount, 2)) AS amount,
    c.title AS campaign,
    d.status AS donation_status,
    CASE WHEN d.is_refunded = 1 THEN 'YES' ELSE 'NO' END AS is_refunded_flag,
    CASE 
        WHEN rr.status = 'approved' AND d.status != 'refunded' THEN '❌ WRONG STATUS'
        WHEN rr.status = 'approved' AND d.is_refunded = 0 THEN '❌ FLAG NOT SET'
        WHEN rr.status = 'approved' AND d.status = 'refunded' AND d.is_refunded = 1 THEN '✅ CORRECT'
        ELSE '⚠️ CHECK'
    END AS status
FROM refund_requests rr
INNER JOIN donations d ON rr.donation_id = d.id
INNER JOIN users u ON rr.user_id = u.id
LEFT JOIN campaigns c ON d.campaign_id = c.id
WHERE rr.status = 'approved'
ORDER BY rr.reviewed_at DESC;

-- Query 2: Summary Count
SELECT 
    'SUMMARY' AS '',
    COUNT(*) AS total_approved,
    SUM(CASE WHEN d.status != 'refunded' THEN 1 ELSE 0 END) AS wrong_status,
    SUM(CASE WHEN d.is_refunded = 0 THEN 1 ELSE 0 END) AS flag_not_set,
    SUM(CASE WHEN d.status = 'refunded' AND d.is_refunded = 1 THEN 1 ELSE 0 END) AS correct
FROM refund_requests rr
INNER JOIN donations d ON rr.donation_id = d.id
WHERE rr.status = 'approved';
"@

Set-Content -Path $sqlFile -Value $sqlContent

Write-Host "=============================================="  -ForegroundColor Cyan
Write-Host "APPROVED REFUNDS STATUS" -ForegroundColor Cyan
Write-Host "=============================================="  -ForegroundColor Cyan
Write-Host ""

# Run the SQL query
try {
    if ($dbPassword) {
        mysql -h $dbHost -P $dbPort -u $dbUsername -p"$dbPassword" $dbDatabase < $sqlFile
    } else {
        mysql -h $dbHost -P $dbPort -u $dbUsername $dbDatabase < $sqlFile
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "=============================================="  -ForegroundColor Green
        Write-Host "✅ Query completed successfully!" -ForegroundColor Green
        Write-Host "=============================================="  -ForegroundColor Green
        Write-Host ""
        Write-Host "If you see '❌ WRONG STATUS' or '❌ FLAG NOT SET', run the fix script:" -ForegroundColor Yellow
        Write-Host "  .\fix-refund-donations.ps1" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "=============================================="  -ForegroundColor Red
        Write-Host "❌ Query failed. Check MySQL is installed and running." -ForegroundColor Red
        Write-Host "=============================================="  -ForegroundColor Red
        Write-Host ""
        Write-Host "Alternative: Run the SQL file manually:" -ForegroundColor Yellow
        Write-Host "  1. Open your MySQL client (phpMyAdmin, MySQL Workbench, etc.)" -ForegroundColor White
        Write-Host "  2. Connect to database: $dbDatabase" -ForegroundColor White
        Write-Host "  3. Run the queries in: check-approved-refunds.sql" -ForegroundColor White
    }
} catch {
    Write-Host "❌ ERROR: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: Use PHP script instead:" -ForegroundColor Yellow
    Write-Host "  php database/scripts/verify_refund_status.php" -ForegroundColor White
}

# Clean up
Remove-Item $sqlFile -ErrorAction SilentlyContinue

# Return to parent directory
Set-Location -Path ".."

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
