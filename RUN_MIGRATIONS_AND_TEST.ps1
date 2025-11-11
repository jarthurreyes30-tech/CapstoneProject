# Comprehensive System Setup and Testing Script
# Run this from the Final directory

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Comprehensive System Setup & Testing" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to backend
Set-Location capstone_backend

Write-Host "Step 1: Running Database Migrations..." -ForegroundColor Yellow
php artisan migrate --force
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Migration failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Migrations completed" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Clearing Application Cache..." -ForegroundColor Yellow
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
Write-Host "✅ Cache cleared" -ForegroundColor Green
Write-Host ""

Write-Host "Step 3: Creating Storage Link..." -ForegroundColor Yellow
php artisan storage:link
Write-Host "✅ Storage link created" -ForegroundColor Green
Write-Host ""

Write-Host "Step 4: Checking Database Connection..." -ForegroundColor Yellow
php artisan db:show
Write-Host "✅ Database connected" -ForegroundColor Green
Write-Host ""

Write-Host "Step 5: Testing Email Configuration..." -ForegroundColor Yellow
Write-Host "Email settings from .env:" -ForegroundColor Cyan
Get-Content .env | Select-String "MAIL_"
Write-Host ""

Write-Host "Step 6: Restarting Queue Worker..." -ForegroundColor Yellow
php artisan queue:restart
Write-Host "✅ Queue restarted (start worker with: php artisan queue:work)" -ForegroundColor Green
Write-Host ""

Write-Host "Step 7: Database Integrity Check..." -ForegroundColor Yellow
Write-Host "Checking for orphaned records..." -ForegroundColor Cyan

# Run diagnostic SQL
$diagnosticSQL = @"
-- Check charity officers
SELECT COUNT(*) as total_officers FROM charity_officers;

-- Check campaign volunteers  
SELECT COUNT(*) as total_volunteers FROM campaign_volunteers;

-- Check refund statistics
SELECT 
    COUNT(*) as total_refunds,
    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
    SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
    SUM(CASE WHEN status = 'denied' THEN 1 ELSE 0 END) as denied
FROM refund_requests;

-- Check donation totals accuracy (should be empty if all correct)
SELECT 
    c.id,
    c.name,
    c.total_donations_received as stored,
    COALESCE(SUM(CASE WHEN d.status = 'completed' AND (d.is_refunded = 0 OR d.is_refunded IS NULL) THEN d.amount ELSE 0 END), 0) as calculated,
    (c.total_donations_received - COALESCE(SUM(CASE WHEN d.status = 'completed' AND (d.is_refunded = 0 OR d.is_refunded IS NULL) THEN d.amount ELSE 0 END), 0)) as difference
FROM charities c
LEFT JOIN donations d ON c.id = d.charity_id
GROUP BY c.id, c.name, c.total_donations_received
HAVING ABS(difference) > 0.01;
"@

$diagnosticSQL | Set-Content -Path "temp_diagnostic.sql"
Write-Host "SQL diagnostic queries written to temp_diagnostic.sql" -ForegroundColor Green
Write-Host ""

Write-Host "Step 8: API Route Check..." -ForegroundColor Yellow
Write-Host "New routes added:" -ForegroundColor Cyan
php artisan route:list | Select-String "charity-officers"
php artisan route:list | Select-String "volunteer"
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Start queue worker: php artisan queue:work" -ForegroundColor White
Write-Host "2. Start backend server: php artisan serve" -ForegroundColor White
Write-Host "3. Test API endpoints using Postman or frontend" -ForegroundColor White
Write-Host "4. Check COMPREHENSIVE_SYSTEM_TEST.md for testing checklist" -ForegroundColor White
Write-Host ""
Write-Host "Important Notes:" -ForegroundColor Yellow
Write-Host "- Email notifications require queue worker to be running" -ForegroundColor White
Write-Host "- New tables created: charity_officers, campaign_volunteers" -ForegroundColor White
Write-Host "- Campaigns now support volunteer-based mode (no target amount)" -ForegroundColor White
Write-Host "- Charity total_raised is hidden from donors for privacy" -ForegroundColor White
Write-Host "- Report management now includes profile pictures and logos" -ForegroundColor White
Write-Host ""

# Return to root
Set-Location ..

Write-Host "Press any key to continue..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
