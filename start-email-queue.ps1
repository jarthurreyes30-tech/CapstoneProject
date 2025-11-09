# Start Email Queue Worker
# This script starts the Laravel queue worker to process email jobs

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "   STARTING EMAIL QUEUE WORKER" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "What this does:" -ForegroundColor Yellow
Write-Host "  - Processes queued email notifications" -ForegroundColor White
Write-Host "  - Sends donation and refund emails" -ForegroundColor White
Write-Host "  - Runs in the background" -ForegroundColor White
Write-Host ""

Write-Host "Email notifications that will be sent:" -ForegroundColor Yellow
Write-Host "  ✉️  Donation created → Confirmation to donor" -ForegroundColor White
Write-Host "  ✉️  Donation created → Alert to charity" -ForegroundColor White
Write-Host "  ✉️  Donation approved → Verification to donor" -ForegroundColor White
Write-Host "  ✉️  Donation rejected → Rejection to donor" -ForegroundColor White
Write-Host "  ✉️  Refund requested → Confirmation to donor" -ForegroundColor White
Write-Host "  ✉️  Refund requested → Alert to charity" -ForegroundColor White
Write-Host "  ✉️  Refund approved/denied → Response to donor" -ForegroundColor White
Write-Host ""

Write-Host "===============================================" -ForegroundColor Green
Write-Host "KEEP THIS WINDOW OPEN!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host "The queue worker must run continuously to send emails." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the queue worker." -ForegroundColor Yellow
Write-Host ""

Write-Host "Starting queue worker in 3 seconds..." -ForegroundColor White
Start-Sleep -Seconds 3

# Navigate to backend directory
Set-Location -Path "capstone_backend"

Write-Host ""
Write-Host "Queue worker is now running..." -ForegroundColor Green
Write-Host "Watching for email jobs..." -ForegroundColor White
Write-Host ""

# Start the queue worker
php artisan queue:work --verbose

# This will run indefinitely until Ctrl+C is pressed
