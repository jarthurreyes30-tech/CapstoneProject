# Test Admin Dashboard Charts and Action Logs
# This script tests all the new endpoints we created

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Testing Admin Dashboard & Action Logs" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8000/api"

# Get admin token (you need to replace this with a valid admin token)
Write-Host "Step 1: Login as admin..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@charityhub.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "✓ Admin login successful" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "✗ Admin login failed: $_" -ForegroundColor Red
    Write-Host "Please ensure admin account exists or update credentials in script" -ForegroundColor Yellow
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/json"
}

# Test 1: Dashboard Metrics
Write-Host "Test 1: Fetching dashboard metrics..." -ForegroundColor Yellow
try {
    $metrics = Invoke-RestMethod -Uri "$baseUrl/metrics" -Method Get -Headers $headers
    Write-Host "✓ Metrics retrieved successfully" -ForegroundColor Green
    Write-Host "  - Total Users: $($metrics.total_users)" -ForegroundColor White
    Write-Host "  - Total Donors: $($metrics.total_donors)" -ForegroundColor White
    Write-Host "  - Total Charity Admins: $($metrics.total_charity_admins)" -ForegroundColor White
    Write-Host "  - Approved Charities: $($metrics.charities)" -ForegroundColor White
    Write-Host "  - Pending Verifications: $($metrics.pending_verifications)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "✗ Failed to fetch metrics: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 2: Registrations Trend
Write-Host "Test 2: Fetching registrations trend..." -ForegroundColor Yellow
try {
    $regTrend = Invoke-RestMethod -Uri "$baseUrl/admin/dashboard/registrations-trend" -Method Get -Headers $headers
    Write-Host "✓ Registrations trend retrieved successfully" -ForegroundColor Green
    Write-Host "  Data points: $($regTrend.data.Count)" -ForegroundColor White
    if ($regTrend.data.Count -gt 0) {
        $latest = $regTrend.data[-1]
        Write-Host "  Latest month ($($latest.month)): $($latest.charities) charities, $($latest.donors) donors" -ForegroundColor White
    }
    Write-Host ""
} catch {
    Write-Host "✗ Failed to fetch registrations trend: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 3: Donations Trend
Write-Host "Test 3: Fetching donations trend..." -ForegroundColor Yellow
try {
    $donTrend = Invoke-RestMethod -Uri "$baseUrl/admin/dashboard/donations-trend" -Method Get -Headers $headers
    Write-Host "✓ Donations trend retrieved successfully" -ForegroundColor Green
    Write-Host "  Data points: $($donTrend.data.Count)" -ForegroundColor White
    if ($donTrend.data.Count -gt 0) {
        $latest = $donTrend.data[-1]
        Write-Host "  Latest month ($($latest.month)): ₱$($latest.amount) from $($latest.count) donations" -ForegroundColor White
    }
    Write-Host ""
} catch {
    Write-Host "✗ Failed to fetch donations trend: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 4: Combined Charts Data
Write-Host "Test 4: Fetching combined charts data..." -ForegroundColor Yellow
try {
    $chartsData = Invoke-RestMethod -Uri "$baseUrl/admin/dashboard/charts-data" -Method Get -Headers $headers
    Write-Host "✓ Combined charts data retrieved successfully" -ForegroundColor Green
    Write-Host "  Registration data points: $($chartsData.registrations.Count)" -ForegroundColor White
    Write-Host "  Donation data points: $($chartsData.donations.Count)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "✗ Failed to fetch combined charts data: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 5: Activity Logs
Write-Host "Test 5: Fetching activity logs..." -ForegroundColor Yellow
try {
    $logs = Invoke-RestMethod -Uri "$baseUrl/admin/activity-logs" -Method Get -Headers $headers
    Write-Host "✓ Activity logs retrieved successfully" -ForegroundColor Green
    Write-Host "  Total logs: $($logs.total)" -ForegroundColor White
    Write-Host "  Current page: $($logs.current_page) of $($logs.last_page)" -ForegroundColor White
    Write-Host "  Logs on this page: $($logs.data.Count)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "✗ Failed to fetch activity logs: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 6: Activity Logs Statistics
Write-Host "Test 6: Fetching activity logs statistics..." -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "$baseUrl/admin/activity-logs/statistics" -Method Get -Headers $headers
    Write-Host "✓ Activity logs statistics retrieved successfully" -ForegroundColor Green
    Write-Host "  Total activities: $($stats.total)" -ForegroundColor White
    Write-Host "  Donations: $($stats.donations)" -ForegroundColor White
    Write-Host "  Campaigns: $($stats.campaigns)" -ForegroundColor White
    Write-Host "  Registrations: $($stats.registrations)" -ForegroundColor White
    Write-Host "  Logins today: $($stats.logins_today)" -ForegroundColor White
    Write-Host "  Unique action types: $($stats.unique_actions.Count)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "✗ Failed to fetch activity logs statistics: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 7: Activity Logs with Filters
Write-Host "Test 7: Fetching activity logs with filters..." -ForegroundColor Yellow
try {
    $filteredLogs = Invoke-RestMethod -Uri "$baseUrl/admin/activity-logs?action_type=login&target_type=donor" -Method Get -Headers $headers
    Write-Host "✓ Filtered activity logs retrieved successfully" -ForegroundColor Green
    Write-Host "  Filtered results: $($filteredLogs.data.Count)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "✗ Failed to fetch filtered activity logs: $_" -ForegroundColor Red
    Write-Host ""
}

# Summary
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "All critical endpoints have been tested." -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Start your backend: cd capstone_backend && php artisan serve" -ForegroundColor White
Write-Host "2. Start your frontend: cd capstone_frontend && npm run dev" -ForegroundColor White
Write-Host "3. Login as admin and navigate to:" -ForegroundColor White
Write-Host "   - Dashboard: http://localhost:5173/admin/dashboard" -ForegroundColor Cyan
Write-Host "   - Action Logs: http://localhost:5173/admin/action-logs" -ForegroundColor Cyan
Write-Host "4. Verify charts are showing real data (not mock data)" -ForegroundColor White
Write-Host "5. Test all filters in Action Logs page" -ForegroundColor White
Write-Host ""
