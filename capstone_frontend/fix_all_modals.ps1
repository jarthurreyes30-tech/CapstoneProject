# PowerShell script to list all modal files that need fixing

Write-Host "Finding all modals with custom sizing..." -ForegroundColor Cyan

$files = Get-ChildItem -Path "src" -Recurse -Include "*.tsx","*.ts" | 
    Select-String -Pattern 'DialogContent className=".*max-w' | 
    Select-Object -ExpandProperty Path -Unique

Write-Host "`nFiles with custom modal sizing:" -ForegroundColor Yellow
$files | ForEach-Object {
    Write-Host "  - $_" -ForegroundColor White
}

Write-Host "`nTotal files to fix: $($files.Count)" -ForegroundColor Green
