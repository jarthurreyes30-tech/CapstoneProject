# Restart Frontend Development Server
Write-Host "=== Restarting Frontend Dev Server ===" -ForegroundColor Cyan
Write-Host ""

# Find and stop the process on port 8080
Write-Host "Step 1: Stopping current dev server on port 8080..." -ForegroundColor Yellow
$processes = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($processes) {
    foreach ($pid in $processes) {
        Write-Host "  Stopping process ID: $pid" -ForegroundColor Red
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
    Write-Host "  ✓ Stopped" -ForegroundColor Green
    Start-Sleep -Seconds 2
} else {
    Write-Host "  No process found on port 8080" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 2: Clearing Vite cache..." -ForegroundColor Yellow
$viteCachePath = "capstone_frontend\node_modules\.vite"
if (Test-Path $viteCachePath) {
    Remove-Item -Recurse -Force $viteCachePath -ErrorAction SilentlyContinue
    Write-Host "  ✓ Cache cleared" -ForegroundColor Green
} else {
    Write-Host "  No cache found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 3: Starting dev server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Opening new terminal window..." -ForegroundColor Green
Write-Host ""

# Start new terminal with dev server
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\..\capstone_frontend'; Write-Host 'Starting frontend dev server...' -ForegroundColor Cyan; npm run dev"

Write-Host ""
Write-Host "=== Instructions ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. A new terminal window has opened with the dev server" -ForegroundColor White
Write-Host "2. Wait for it to show: 'Local: http://localhost:8080'" -ForegroundColor White
Write-Host "3. Open your browser to: http://localhost:8080/charity/documents" -ForegroundColor White
Write-Host "4. Hard refresh the page: Ctrl+Shift+R" -ForegroundColor White
Write-Host "5. Open browser console (F12) to see debug logs" -ForegroundColor White
Write-Host ""
Write-Host "Expected console output:" -ForegroundColor Yellow
Write-Host "  - Fetching documents for charity ID: X" -ForegroundColor Gray
Write-Host "  - Raw API response: [...]" -ForegroundColor Gray
Write-Host "  - Total documents: X" -ForegroundColor Gray
Write-Host "  - Approved: X" -ForegroundColor Gray
Write-Host "  - Pending: X" -ForegroundColor Gray
Write-Host "  - Rejected: X" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to exit this window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
