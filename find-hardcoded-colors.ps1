# PowerShell script to find remaining hardcoded colors that need fixing
# Run from repository root: .\find-hardcoded-colors.ps1

Write-Host "🔍 Scanning for hardcoded colors that may not be theme-responsive..." -ForegroundColor Cyan
Write-Host ""

$sourcePath = "capstone_frontend\src"

# Patterns to search for
$patterns = @(
    @{Pattern = "bg-white(?!\/)"; Description = "bg-white (should be bg-card or bg-background)"},
    @{Pattern = "bg-gray-(?!50\/|100\/|200\/)"; Description = "bg-gray-X (should use semantic tokens)"},
    @{Pattern = "text-gray-(?!500\/|600\/)"; Description = "text-gray-X (should be text-foreground or text-muted-foreground)"},
    @{Pattern = "border-gray-"; Description = "border-gray-X (should be border-border)"},
    @{Pattern = "bg-blue-\d+(?!\/)"; Description = "bg-blue-X (should be bg-primary or bg-secondary)"},
    @{Pattern = "text-blue-\d+"; Description = "text-blue-X (should be text-primary)"},
    @{Pattern = "text-green-\d+"; Description = "text-green-X (should be text-primary or custom)"},
    @{Pattern = "dark:bg-gray-(?!50\/|100\/)"; Description = "dark:bg-gray-X (remove, use semantic tokens)"},
    @{Pattern = "dark:text-gray-"; Description = "dark:text-gray-X (remove, use semantic tokens)"}
)

$totalIssues = 0

foreach ($patternObj in $patterns) {
    $pattern = $patternObj.Pattern
    $description = $patternObj.Description
    
    Write-Host "📝 Searching for: $description" -ForegroundColor Yellow
    
    try {
        $results = Get-ChildItem -Path $sourcePath -Include "*.tsx","*.jsx","*.ts","*.js" -Recurse -ErrorAction SilentlyContinue | 
            Select-String -Pattern $pattern -ErrorAction SilentlyContinue | 
            Select-Object -First 10
        
        if ($results) {
            $count = ($results | Measure-Object).Count
            $totalIssues += $count
            
            Write-Host "   Found $count matches:" -ForegroundColor Red
            foreach ($result in $results) {
                $relativePath = $result.Path -replace [regex]::Escape((Get-Location).Path + "\"), ""
                Write-Host "   - $relativePath : Line $($result.LineNumber)" -ForegroundColor Gray
            }
            Write-Host ""
        }
        else {
            Write-Host "   ✅ No issues found" -ForegroundColor Green
            Write-Host ""
        }
    }
    catch {
        Write-Host "   ⚠️  Error scanning: $($_.Exception.Message)" -ForegroundColor DarkYellow
        Write-Host ""
    }
}

Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
if ($totalIssues -eq 0) {
    Write-Host "✅ Perfect! No hardcoded color issues found!" -ForegroundColor Green
    Write-Host "   All components are using theme-responsive semantic tokens." -ForegroundColor Green
}
else {
    Write-Host "⚠️  Found approximately $totalIssues instances that may need review" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📖 Recommendation:" -ForegroundColor Cyan
    Write-Host "   Review the files above and replace hardcoded colors with:" -ForegroundColor White
    Write-Host "   • bg-white → bg-card or bg-background" -ForegroundColor White
    Write-Host "   • bg-gray-X → bg-muted or bg-card" -ForegroundColor White
    Write-Host "   • text-gray-X → text-foreground or text-muted-foreground" -ForegroundColor White
    Write-Host "   • text-blue-X → text-primary" -ForegroundColor White
    Write-Host "   • border-gray-X → border-border" -ForegroundColor White
    Write-Host "   • Remove dark: modifiers when using semantic tokens" -ForegroundColor White
}
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 For detailed guidance, see: THEME_RESPONSIVE_COLORS_FIXED.md" -ForegroundColor Cyan
