# Restart Backend Server Script
Write-Host "Stopping any existing backend server on port 8000..." -ForegroundColor Yellow

# Find and kill process on port 8000
$port = 8000
$process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($process) {
    Stop-Process -Id $process -Force
    Write-Host "Stopped process $process" -ForegroundColor Green
    Start-Sleep -Seconds 2
}

# Navigate to backend directory
Set-Location "c:\Users\ycel_\DamingRepoPunyeta\capstone_backend"

# Clear Laravel cache
Write-Host "`nClearing Laravel cache..." -ForegroundColor Yellow
php artisan optimize:clear

# Start the server
Write-Host "`nStarting Laravel server on http://127.0.0.1:8000..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server`n" -ForegroundColor Yellow
php artisan serve
