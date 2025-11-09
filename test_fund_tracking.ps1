# Fund Tracking Test Script
# This script helps test the Fund Tracking implementation

Write-Host "=== Fund Tracking System Test ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if backend is running
Write-Host "Test 1: Checking backend server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/ping" -Method GET -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Backend server is running" -ForegroundColor Green
    }
} catch {
    Write-Host "X Backend server is not running on http://localhost:8000" -ForegroundColor Red
    Write-Host "  Please start the backend server first: cd capstone_backend; php artisan serve" -ForegroundColor Yellow
    exit
}

Write-Host ""

# Test 2: Check if frontend is running
Write-Host "Test 2: Checking frontend server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080" -Method GET -UseBasicParsing -TimeoutSec 5
    Write-Host "✓ Frontend server is running" -ForegroundColor Green
} catch {
    Write-Host "X Frontend server is not running on http://localhost:8080" -ForegroundColor Red
    Write-Host "  Please start the frontend server first: cd capstone_frontend; npm run dev" -ForegroundColor Yellow
}

Write-Host ""

# Test 3: Check database connection
Write-Host "Test 3: Checking database..." -ForegroundColor Yellow
Write-Host "  Please verify manually that your database is running and configured in .env" -ForegroundColor Gray

Write-Host ""

# Instructions
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Clear seeded data (optional):" -ForegroundColor White
Write-Host "   cd capstone_backend" -ForegroundColor Gray
Write-Host "   php artisan db:seed --class=ClearDataSeeder" -ForegroundColor Gray
Write-Host ""

Write-Host "2. Create test donations:" -ForegroundColor White
Write-Host "   - Log in as a donor" -ForegroundColor Gray
Write-Host "   - Make some donations to charities" -ForegroundColor Gray
Write-Host "   - Have charities confirm the donations" -ForegroundColor Gray
Write-Host ""

Write-Host "3. Test Fund Tracking page:" -ForegroundColor White
Write-Host "   - Log in as admin (admin@example.com)" -ForegroundColor Gray
Write-Host "   - Navigate to: http://localhost:8080/admin/fund-tracking" -ForegroundColor Gray
Write-Host "   - Verify statistics show real data" -ForegroundColor Gray
Write-Host "   - Test charts, search, filters, and export" -ForegroundColor Gray
Write-Host ""

Write-Host "4. API Endpoints to test:" -ForegroundColor White
Write-Host "   GET /api/admin/fund-tracking/statistics?days=30" -ForegroundColor Gray
Write-Host "   GET /api/admin/fund-tracking/transactions?days=30" -ForegroundColor Gray
Write-Host "   GET /api/admin/fund-tracking/chart-data?days=30" -ForegroundColor Gray
Write-Host "   GET /api/admin/fund-tracking/export?days=30" -ForegroundColor Gray
Write-Host ""

Write-Host "=== Features Implemented ===" -ForegroundColor Cyan
Write-Host "[OK] Real-time statistics (Total Donations, Disbursements, Net Flow)" -ForegroundColor Green
Write-Host "[OK] Transaction list with search and filters" -ForegroundColor Green
Write-Host "[OK] Transaction trends chart (Line chart)" -ForegroundColor Green
Write-Host "[OK] Fund distribution chart (Pie chart)" -ForegroundColor Green
Write-Host "[OK] Time range filtering (7, 30, 90, 365 days)" -ForegroundColor Green
Write-Host "[OK] CSV export functionality" -ForegroundColor Green
Write-Host "[OK] Refresh button for manual updates" -ForegroundColor Green
Write-Host ""

Write-Host "For detailed documentation, see: FUND_TRACKING_IMPLEMENTATION.md" -ForegroundColor Cyan
Write-Host ""
