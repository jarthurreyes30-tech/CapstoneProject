Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  PHP ZIP EXTENSION ENABLER" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Get PHP info
Write-Host "[1/5] Checking PHP configuration..." -ForegroundColor Yellow
$phpIniPath = & php -r "echo php_ini_loaded_file();" 2>&1

if ($phpIniPath -and (Test-Path $phpIniPath)) {
    Write-Host "[OK] Found php.ini at: $phpIniPath" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Could not find php.ini file" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please manually locate your php.ini file and uncomment this line:" -ForegroundColor Yellow
    Write-Host "  extension=zip" -ForegroundColor White
    Write-Host ""
    Write-Host "Common locations:" -ForegroundColor Yellow
    Write-Host "  - C:\php\php.ini" -ForegroundColor White
    Write-Host "  - C:\xampp\php\php.ini" -ForegroundColor White
    Write-Host "  - C:\wamp\bin\php\php8.x.x\php.ini" -ForegroundColor White
    Write-Host "  - C:\laragon\bin\php\php8.x.x\php.ini" -ForegroundColor White
    exit 1
}

# Check if zip extension is already enabled
Write-Host ""
Write-Host "[2/5] Checking if ZIP extension is loaded..." -ForegroundColor Yellow
$zipLoaded = & php -m | Select-String -Pattern "^zip$"

if ($zipLoaded) {
    Write-Host "[OK] ZIP extension is already enabled!" -ForegroundColor Green
    Write-Host ""
    Write-Host "If you're still getting errors, restart your PHP server:" -ForegroundColor Yellow
    Write-Host "  1. Stop: Ctrl+C in the terminal running 'php artisan serve'" -ForegroundColor White
    Write-Host "  2. Start: php artisan serve" -ForegroundColor White
    exit 0
}

Write-Host "[ERROR] ZIP extension is NOT loaded" -ForegroundColor Red

# Backup php.ini
Write-Host ""
Write-Host "[3/5] Creating backup of php.ini..." -ForegroundColor Yellow
$backupPath = "$phpIniPath.backup." + (Get-Date -Format "yyyyMMdd_HHmmss")
try {
    Copy-Item -Path $phpIniPath -Destination $backupPath -Force
    Write-Host "[OK] Backup created: $backupPath" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Failed to create backup: $_" -ForegroundColor Red
    exit 1
}

# Read php.ini content
Write-Host ""
Write-Host "[4/5] Enabling ZIP extension in php.ini..." -ForegroundColor Yellow
try {
    $content = Get-Content -Path $phpIniPath -Raw
    $modified = $false
    
    # Check if extension=zip is commented out
    if ($content -match ";extension=zip") {
        Write-Host "  > Found commented line: ;extension=zip" -ForegroundColor Cyan
        $content = $content -replace ";extension=zip", "extension=zip"
        $modified = $true
    }
    # Check if extension_dir has zip commented
    elseif ($content -match ";.*extension=zip") {
        Write-Host "  > Found commented line with extension=zip" -ForegroundColor Cyan
        $content = $content -replace ";(.*extension=zip)", "`$1"
        $modified = $true
    }
    # Add new line if not found
    else {
        Write-Host "  > Adding new line: extension=zip" -ForegroundColor Cyan
        # Find the [Extensions] section or add after other extensions
        if ($content -match "\[Extensions\]") {
            $content = $content -replace "(\[Extensions\])", "`$1`r`nextension=zip"
        } elseif ($content -match "extension=") {
            # Add after the first extension found
            $content = $content -replace "(extension=.*)", "`$1`r`nextension=zip"
        } else {
            # Append at the end
            $content += "`r`nextension=zip`r`n"
        }
        $modified = $true
    }
    
    if ($modified) {
        Set-Content -Path $phpIniPath -Value $content -NoNewline
        Write-Host "[OK] php.ini updated successfully" -ForegroundColor Green
    } else {
        Write-Host "[WARN] No changes needed (extension=zip might already be present)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[ERROR] Failed to modify php.ini: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please manually edit: $phpIniPath" -ForegroundColor Yellow
    Write-Host "Find this line: ;extension=zip" -ForegroundColor White
    Write-Host "Change it to:   extension=zip" -ForegroundColor White
    exit 1
}

# Verify the change
Write-Host ""
Write-Host "[5/5] Verifying ZIP extension..." -ForegroundColor Yellow
Write-Host "  > Note: You must restart PHP for changes to take effect" -ForegroundColor Cyan

Write-Host ""
Write-Host "===============================================" -ForegroundColor Green
Write-Host "  [SUCCESS] ZIP EXTENSION CONFIGURED!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "  1. RESTART your Laravel server:" -ForegroundColor White
Write-Host "     - Press Ctrl+C to stop 'php artisan serve'" -ForegroundColor Gray
Write-Host "     - Run: php artisan serve" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Test the download feature again" -ForegroundColor White
Write-Host ""
Write-Host "  3. Verify ZIP is loaded by running:" -ForegroundColor White
Write-Host "     php -m | Select-String zip" -ForegroundColor Gray
Write-Host ""
