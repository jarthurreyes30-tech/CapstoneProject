# Frontend Diagnostic Script
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Frontend Diagnostic Test" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$frontendPath = "c:\Users\ycel_\Final\capstone_frontend"

# Check if frontend directory exists
if (Test-Path $frontendPath) {
    Write-Host "✅ Frontend directory found" -ForegroundColor Green
    
    # Check package.json
    if (Test-Path "$frontendPath\package.json") {
        Write-Host "✅ package.json exists" -ForegroundColor Green
        
        # Check if node_modules exists
        if (Test-Path "$frontendPath\node_modules") {
            Write-Host "✅ node_modules installed" -ForegroundColor Green
        } else {
            Write-Host "⚠️  node_modules not found - run 'npm install'" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ package.json not found" -ForegroundColor Red
    }
    
    # Check critical frontend files
    Write-Host ""
    Write-Host "Checking critical pages..." -ForegroundColor Cyan
    
    $pages = @(
        "src\pages\donor\Notifications.tsx",
        "src\pages\charity\Notifications.tsx",
        "src\pages\admin\Notifications.tsx",
        "src\pages\donor\MakeDonation.tsx",
        "src\pages\campaigns\CampaignPage.tsx",
        "src\components\ReceiptUploader.tsx"
    )
    
    foreach ($page in $pages) {
        if (Test-Path "$frontendPath\$page") {
            Write-Host "  ✅ $page" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $page NOT FOUND" -ForegroundColor Red
        }
    }
    
    # Check .env file
    Write-Host ""
    if (Test-Path "$frontendPath\.env") {
        Write-Host "✅ .env file exists" -ForegroundColor Green
        
        # Check if VITE_API_URL is set
        $envContent = Get-Content "$frontendPath\.env" -Raw
        if ($envContent -match "VITE_API_URL") {
            Write-Host "✅ VITE_API_URL configured" -ForegroundColor Green
        } else {
            Write-Host "⚠️  VITE_API_URL not found in .env" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  .env file not found - copy from .env.example" -ForegroundColor Yellow
    }
    
} else {
    Write-Host "❌ Frontend directory not found at: $frontendPath" -ForegroundColor Red
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Diagnostic Complete" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
