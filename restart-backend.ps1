#!/usr/bin/env pwsh
# Restart Laravel Backend Server

Write-Host "Stopping existing PHP processes..." -ForegroundColor Yellow

# Stop all PHP processes
Get-Process | Where-Object {$_.ProcessName -like "*php*"} | Stop-Process -Force

Start-Sleep -Seconds 2

Write-Host "Starting Laravel server..." -ForegroundColor Cyan

# Navigate to backend directory and start server
Set-Location capstone_backend

# Start the server in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "php artisan serve"

Write-Host ""
Write-Host "✓ Laravel server started at http://127.0.0.1:8000" -ForegroundColor Green
Write-Host ""
Write-Host "Test the storage route by visiting:" -ForegroundColor Cyan
Write-Host "http://127.0.0.1:8000/storage/charity_logos/7q8eiSHo0G4dxvEA0fFaLXdsD375i8gXO6MuXA70.jpg" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C in the server window to stop it." -ForegroundColor Gray
