# Clear all seeded data except admin@example.com account

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Clear Seeded Data (Keep Admin Only)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$confirmation = Read-Host "This will DELETE ALL DATA except admin@example.com. Continue? (yes/no)"

if ($confirmation -ne "yes") {
    Write-Host "Operation cancelled." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "Clearing data..." -ForegroundColor Yellow

Set-Location capstone_backend

# Run the clear data seeder
php artisan db:seed --class=ClearDataSeeder

Write-Host ""
Write-Host "Done! All seeded data removed except admin@example.com" -ForegroundColor Green
Write-Host ""
Write-Host "Admin credentials:" -ForegroundColor Cyan
Write-Host "  Email: admin@example.com" -ForegroundColor White
Write-Host "  Password: password" -ForegroundColor White
Write-Host ""
