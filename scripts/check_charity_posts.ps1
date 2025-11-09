# ============================================
# Charity Posts Diagnostic Script
# ============================================
# This script checks the status of charity posts
# and helps diagnose issues with the dashboard
# ============================================

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Charity Posts Diagnostic Tool" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Change to backend directory
Set-Location -Path "$PSScriptRoot\..\capstone_backend"

Write-Host "Checking database connection..." -ForegroundColor Yellow
php artisan db:show 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Database connection OK" -ForegroundColor Green
} else {
    Write-Host "✗ Database connection failed" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Checking migrations..." -ForegroundColor Yellow
$migrationCheck = php artisan migrate:status | Select-String "add_counts_to_charity_posts"
if ($migrationCheck) {
    Write-Host "✓ Charity posts migration found" -ForegroundColor Green
} else {
    Write-Host "✗ Migration not found - Run: php artisan migrate" -ForegroundColor Red
}

Write-Host ""
Write-Host "Checking charity_posts table..." -ForegroundColor Yellow
$tableCheck = php artisan tinker --execute="echo Schema::hasTable('charity_posts') ? 'EXISTS' : 'MISSING';"
if ($tableCheck -match "EXISTS") {
    Write-Host "✓ charity_posts table exists" -ForegroundColor Green
} else {
    Write-Host "✗ charity_posts table missing" -ForegroundColor Red
}

Write-Host ""
Write-Host "Querying charity posts data..." -ForegroundColor Yellow
Write-Host ""

# Query total posts
$totalPosts = php artisan tinker --execute="echo DB::table('charity_posts')->count();"
Write-Host "Total Posts: $totalPosts" -ForegroundColor Cyan

# Query by status
$publishedPosts = php artisan tinker --execute="echo DB::table('charity_posts')->where('status', 'published')->count();"
Write-Host "Published Posts: $publishedPosts" -ForegroundColor Green

$draftPosts = php artisan tinker --execute="echo DB::table('charity_posts')->where('status', 'draft')->count();"
Write-Host "Draft Posts: $draftPosts" -ForegroundColor Yellow

Write-Host ""
Write-Host "Posts by Charity:" -ForegroundColor Cyan
$postsByCharity = php artisan tinker --execute="DB::table('charity_posts')->join('charities', 'charities.id', '=', 'charity_posts.charity_id')->select('charities.name', DB::raw('count(*) as count'))->groupBy('charities.name')->get()->each(function(\$item) { echo \$item->name . ': ' . \$item->count . PHP_EOL; });"
Write-Host $postsByCharity

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Recommendations:" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Cyan

if ([int]$totalPosts -eq 0) {
    Write-Host "⚠ No posts found in database" -ForegroundColor Yellow
    Write-Host "  → Run: php artisan db:seed --class=CharityPostSeeder" -ForegroundColor White
    Write-Host "  → Or use: scripts/add_test_charity_post.sql" -ForegroundColor White
} else {
    Write-Host "✓ Posts exist - Check frontend console for fetch issues" -ForegroundColor Green
}

if ([int]$publishedPosts -eq 0) {
    Write-Host "⚠ No published posts - Dashboard may show empty" -ForegroundColor Yellow
    Write-Host "  → Update posts: UPDATE charity_posts SET status='published', published_at=NOW();" -ForegroundColor White
}

Write-Host ""
Write-Host "Testing API endpoint..." -ForegroundColor Yellow
Write-Host "Run this in your browser console after logging in as charity admin:" -ForegroundColor White
Write-Host ""
Write-Host "fetch('/api/charities/YOUR_CHARITY_ID/posts', {" -ForegroundColor Cyan
Write-Host "  headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }" -ForegroundColor Cyan
Write-Host "}).then(r => r.json()).then(d => console.log(d))" -ForegroundColor Cyan
Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Check Laravel logs:" -ForegroundColor Yellow
Write-Host "  storage/logs/laravel.log" -ForegroundColor White
Write-Host "================================" -ForegroundColor Cyan
