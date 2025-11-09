# Fix 404 Errors - Clear Laravel Cache and Restart Server
# Run this script to fix "404 Not Found" errors for campaign filter endpoints

Write-Host "=== Fixing 404 Errors ===" -ForegroundColor Cyan
Write-Host ""

# Navigate to backend directory
Set-Location -Path "capstone_backend"

Write-Host "1. Clearing Laravel route cache..." -ForegroundColor Yellow
php artisan route:clear

Write-Host "2. Clearing Laravel config cache..." -ForegroundColor Yellow
php artisan config:clear

Write-Host "3. Clearing Laravel application cache..." -ForegroundColor Yellow
php artisan cache:clear

Write-Host "4. Optimizing routes..." -ForegroundColor Yellow
php artisan route:cache

Write-Host ""
Write-Host "=== Cache Cleared Successfully ===" -ForegroundColor Green
Write-Host ""
Write-Host "Now starting Laravel development server..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Start the server
php artisan serve
