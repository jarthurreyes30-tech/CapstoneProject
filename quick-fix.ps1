# Quick Fix for 404 Errors
# This clears all Laravel caches and restarts the server

Write-Host "Fixing 404 errors..." -ForegroundColor Cyan

Set-Location capstone_backend

php artisan optimize:clear

Write-Host "Cache cleared! Starting server..." -ForegroundColor Green
Write-Host "Visit: http://localhost:8080/donor/campaigns/browse" -ForegroundColor Yellow
Write-Host ""

php artisan serve
