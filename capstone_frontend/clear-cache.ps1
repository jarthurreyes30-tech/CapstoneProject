# Clear Vite/React cache and rebuild
Write-Host "🧹 Clearing frontend cache..." -ForegroundColor Yellow

# Remove cache directories
Remove-Item -Path "node_modules\.vite" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "dist" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "✅ Cache cleared!" -ForegroundColor Green
Write-Host "🔨 Rebuilding..." -ForegroundColor Yellow

# Rebuild
npm run build

Write-Host "✅ Done! Now run: npm run dev" -ForegroundColor Green
