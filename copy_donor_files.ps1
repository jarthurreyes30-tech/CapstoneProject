# Copy all donor components
$sourceComponents = "C:\Users\ycel_\capstone\DamingRepoPunyeta\capstone_frontend\src\components\donor"
$destComponents = "C:\Users\ycel_\capstone\DamingRepoPunyeta1\capstone_frontend\src\components\donor"

Write-Host "Copying donor components..." -ForegroundColor Green
Copy-Item -Path "$sourceComponents\*" -Destination $destComponents -Recurse -Force

# Copy all donor pages
$sourcePages = "C:\Users\ycel_\capstone\DamingRepoPunyeta\capstone_frontend\src\pages\donor"
$destPages = "C:\Users\ycel_\capstone\DamingRepoPunyeta1\capstone_frontend\src\pages\donor"

Write-Host "Copying donor pages..." -ForegroundColor Green
Copy-Item -Path "$sourcePages\*" -Destination $destPages -Recurse -Force

Write-Host "Done! All donor files copied successfully." -ForegroundColor Cyan
