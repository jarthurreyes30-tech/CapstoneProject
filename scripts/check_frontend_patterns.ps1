# Check Frontend Files for Common Error Patterns
Write-Host "=====================================" -ForegroundColor Yellow
Write-Host "  FRONTEND ERROR PATTERN CHECKER" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Yellow

$issues = @()

# Pattern 1: Check for (data || []).filter patterns that might be problematic
Write-Host "`nChecking for potentially problematic .filter() patterns..." -ForegroundColor Cyan

$filterPattern = Get-ChildItem -Path "c:\Users\ycel_\Final\capstone_frontend\src" -Filter "*.tsx" -Recurse | 
    Select-String -Pattern "\(.*\|\|\s*\[\]\)\.filter" | 
    Where-Object { $_.Line -notmatch "Array\.isArray" }

if ($filterPattern) {
    Write-Host "Found $($filterPattern.Count) potential issues with .filter() usage:" -ForegroundColor Yellow
    $filterPattern | ForEach-Object {
        $relPath = $_.Path.Replace("c:\Users\ycel_\Final\capstone_frontend\", "")
        Write-Host "  $relPath : Line $($_.LineNumber)" -ForegroundColor Gray
        $issues += "Filter pattern: $relPath : Line $($_.LineNumber)"
    }
} else {
    Write-Host "No suspicious .filter() patterns found" -ForegroundColor Green
}

# Pattern 2: Check for missing imports
Write-Host "`nChecking for potentially missing imports..." -ForegroundColor Cyan

$missingImports = Get-ChildItem -Path "c:\Users\ycel_\Final\capstone_frontend\src" -Filter "*.tsx" -Recurse | 
    Select-String -Pattern "from '@/lib/api-client'"

if ($missingImports) {
    Write-Host "Found $($missingImports.Count) files using non-existent '@/lib/api-client':" -ForegroundColor Red
    $missingImports | ForEach-Object {
        $relPath = $_.Path.Replace("c:\Users\ycel_\Final\capstone_frontend\", "")
        Write-Host "  $relPath : Line $($_.LineNumber)" -ForegroundColor Gray
        $issues += "Missing import: $relPath : Line $($_.LineNumber)"
    }
} else {
    Write-Host "No missing '@/lib/api-client' imports found" -ForegroundColor Green
}

# Pattern 3: Check for incorrect API endpoints
Write-Host "`nChecking for incorrect API endpoints..." -ForegroundColor Cyan

$badEndpoints = Get-ChildItem -Path "c:\Users\ycel_\Final\capstone_frontend\src" -Filter "*.tsx" -Recurse | 
    Select-String -Pattern "(/donation-stats|/api/campaigns[^/{}]|/locations/provinces[^/])"

if ($badEndpoints) {
    Write-Host "Found $($badEndpoints.Count) files using incorrect endpoints:" -ForegroundColor Red
    $badEndpoints | ForEach-Object {
        $relPath = $_.Path.Replace("c:\Users\ycel_\Final\capstone_frontend\", "")
        Write-Host "  $relPath : Line $($_.LineNumber)" -ForegroundColor Gray
        $issues += "Bad endpoint: $relPath : Line $($_.LineNumber)"
    }
} else {
    Write-Host "No incorrect API endpoints found" -ForegroundColor Green
}

# Summary
Write-Host "`n=====================================" -ForegroundColor Yellow
Write-Host "  SUMMARY" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Yellow

if ($issues.Count -eq 0) {
    Write-Host "`nNo major issues detected!" -ForegroundColor Green
} else {
    Write-Host "`nFound $($issues.Count) potential issues" -ForegroundColor Yellow
    Write-Host "`nReview the items above for potential errors." -ForegroundColor Gray
}
