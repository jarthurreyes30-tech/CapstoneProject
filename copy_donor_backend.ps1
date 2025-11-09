# Copy donor backend controllers
$sourceBackend = "C:\Users\ycel_\capstone\DamingRepoPunyeta\capstone_backend\app\Http\Controllers"
$destBackend = "C:\Users\ycel_\capstone\DamingRepoPunyeta1\capstone_backend\app\Http\Controllers"

Write-Host "Copying DonorProfileController..." -ForegroundColor Green
Copy-Item -Path "$sourceBackend\API\DonorProfileController.php" -Destination "$destBackend\API\" -Force

Write-Host "Copying DonorAnalyticsController..." -ForegroundColor Green
Copy-Item -Path "$sourceBackend\DonorAnalyticsController.php" -Destination $destBackend -Force

Write-Host "Copying DonorRegistrationController..." -ForegroundColor Green
Copy-Item -Path "$sourceBackend\DonorRegistrationController.php" -Destination $destBackend -Force

Write-Host "Done! All donor backend files copied successfully." -ForegroundColor Cyan
