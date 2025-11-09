# Test Donor Profile Fix
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "  DONOR PROFILE - DIAGNOSTIC TEST" -ForegroundColor Yellow
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

$backendPath = "capstone_backend"
$frontendPath = "capstone_frontend"

# Test 1: Check if backend is running
Write-Host "1. Checking backend server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/health" -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
    Write-Host "   SUCCESS: Backend is running" -ForegroundColor Green
} catch {
    Write-Host "   WARNING: Backend may not be running on port 8000" -ForegroundColor Red
    Write-Host "   Please run: cd $backendPath && php artisan serve" -ForegroundColor White
}

# Test 2: Check storage symlink
Write-Host "`n2. Checking storage symlink..." -ForegroundColor Yellow
cd $backendPath
if (Test-Path "public\storage") {
    Write-Host "   SUCCESS: Storage symlink exists" -ForegroundColor Green
} else {
    Write-Host "   WARNING: Storage symlink missing" -ForegroundColor Red
    Write-Host "   Running: php artisan storage:link" -ForegroundColor White
    php artisan storage:link
}

# Test 3: Check donor profile API route
Write-Host "`n3. Checking API routes..." -ForegroundColor Yellow
$routes = php artisan route:list --path=donors --columns=Method,URI,Name
if ($routes -match "GET.*donors/{id}") {
    Write-Host "   SUCCESS: Donor profile routes exist" -ForegroundColor Green
} else {
    Write-Host "   ERROR: Donor profile routes not found" -ForegroundColor Red
}

# Test 4: Check if DonorProfileController exists
Write-Host "`n4. Checking controllers..." -ForegroundColor Yellow
if (Test-Path "app\Http\Controllers\API\DonorProfileController.php") {
    Write-Host "   SUCCESS: DonorProfileController exists" -ForegroundColor Green
} else {
    Write-Host "   ERROR: DonorProfileController not found" -ForegroundColor Red
}

# Test 5: Check if DonorProfileResource exists
Write-Host "`n5. Checking resources..." -ForegroundColor Yellow
if (Test-Path "app\Http\Resources\DonorProfileResource.php") {
    Write-Host "   SUCCESS: DonorProfileResource exists" -ForegroundColor Green
} else {
    Write-Host "   ERROR: DonorProfileResource not found" -ForegroundColor Red
}

# Test 6: Check frontend hook
cd ..
Write-Host "`n6. Checking frontend hooks..." -ForegroundColor Yellow
if (Test-Path "$frontendPath\src\hooks\useDonorProfile.ts") {
    Write-Host "   SUCCESS: useDonorProfile hook exists" -ForegroundColor Green
    
    # Check if hook has been updated
    $hookContent = Get-Content "$frontendPath\src\hooks\useDonorProfile.ts" -Raw
    if ($hookContent -match "donorId, user") {
        Write-Host "   SUCCESS: Hook dependencies fixed" -ForegroundColor Green
    } else {
        Write-Host "   WARNING: Hook may need dependency fix" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ERROR: useDonorProfile hook not found" -ForegroundColor Red
}

# Test 7: Check for donors in database
Write-Host "`n7. Checking database for donors..." -ForegroundColor Yellow
cd $backendPath
try {
    $donors = php artisan tinker --execute="echo User::where('role', 'donor')->count();"
    if ($donors -gt 0) {
        Write-Host "   SUCCESS: Found $donors donor(s) in database" -ForegroundColor Green
    } else {
        Write-Host "   WARNING: No donors found in database" -ForegroundColor Yellow
        Write-Host "   You need to register a donor account first" -ForegroundColor White
    }
} catch {
    Write-Host "   INFO: Could not query database (tinker may not work)" -ForegroundColor Cyan
}

# Summary
Write-Host "`n=====================================================================" -ForegroundColor Cyan
Write-Host "  DIAGNOSTIC SUMMARY" -ForegroundColor Yellow
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps to Test:" -ForegroundColor Yellow
Write-Host "  1. Ensure backend is running: php artisan serve" -ForegroundColor White
Write-Host "  2. Ensure frontend is running: npm run dev" -ForegroundColor White
Write-Host "  3. Login as a donor account" -ForegroundColor White
Write-Host "  4. Navigate to: http://localhost:8080/donor/profile" -ForegroundColor White
Write-Host "  5. Open browser console (F12) to see debug logs" -ForegroundColor White
Write-Host ""
Write-Host "Expected Console Logs:" -ForegroundColor Yellow
Write-Host "  - 'Fetching donor profile from API: /donors/X'" -ForegroundColor Cyan
Write-Host "  - 'Donor profile fetched successfully'" -ForegroundColor Cyan
Write-Host ""
Write-Host "If images don't show:" -ForegroundColor Yellow
Write-Host "  - Upload profile/cover image by clicking on them" -ForegroundColor White
Write-Host "  - Check browser Network tab for 404 errors" -ForegroundColor White
Write-Host "  - Verify storage symlink: ls public/storage" -ForegroundColor White
Write-Host ""
Write-Host "Read DONOR_PROFILE_FIX_COMPLETE.md for full details" -ForegroundColor Green
Write-Host ""

cd ..
