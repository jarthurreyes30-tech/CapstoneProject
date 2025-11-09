# Fix 404 Campaign Filter Errors

## Current Error
```
Filter options fetch failed: 404 Not Found
Campaigns fetch failed: 404 Not Found
```

When visiting: `http://localhost:8080/donor/campaigns/browse`

## Problem
The endpoints `/api/campaigns/filter` and `/api/campaigns/filter-options` are returning 404 errors even though they exist in the code.

## Root Causes

### 1. Laravel Route Cache
Laravel may have cached old routes. When routes are added or modified, the cache needs to be cleared.

### 2. Backend Server Not Running
The Laravel development server might not be running or might have crashed.

### 3. Route Registration Issue
The routes might not be properly registered due to a syntax error or middleware issue.

## Quick Fix (Recommended)

### Option 1: Use the Fix Script
```powershell
.\fix-404-errors.ps1
```

This script will:
1. Clear route cache
2. Clear config cache
3. Clear application cache
4. Rebuild route cache
5. Start the Laravel server

### Option 2: Manual Fix
```powershell
cd capstone_backend

# Clear all caches
php artisan route:clear
php artisan config:clear
php artisan cache:clear

# Rebuild route cache
php artisan route:cache

# Start server
php artisan serve
```

## Verify Routes Exist

Check if the routes are registered:
```powershell
cd capstone_backend
php artisan route:list | Select-String "campaigns/filter"
```

You should see:
```
GET|HEAD  api/campaigns/filter .................. AnalyticsController@filterCampaigns
GET|HEAD  api/campaigns/filter-options .......... AnalyticsController@filterOptions
```

## Test the Endpoints

### Test Filter Options
```powershell
# Get your auth token first (from browser DevTools → Application → Local Storage)
$token = "YOUR_TOKEN_HERE"

# Test the endpoint
curl -H "Authorization: Bearer $token" http://127.0.0.1:8000/api/campaigns/filter-options
```

Expected response:
```json
{
  "regions": [...],
  "provinces": [...],
  "cities": [...],
  "types": [...]
}
```

### Test Campaign Filter
```powershell
curl -H "Authorization: Bearer $token" "http://127.0.0.1:8000/api/campaigns/filter?per_page=12"
```

Expected response:
```json
{
  "current_page": 1,
  "data": [...],
  "last_page": 1,
  "total": 0
}
```

## Common Issues & Solutions

### Issue 1: "404 Not Found" persists
**Solution**: 
```powershell
# Stop the server (Ctrl+C)
# Clear everything
php artisan optimize:clear
# Restart
php artisan serve
```

### Issue 2: "Route not found"
**Solution**: Check if AnalyticsController exists
```powershell
Test-Path capstone_backend\app\Http\Controllers\AnalyticsController.php
```
Should return `True`

### Issue 3: "Authentication required"
**Solution**: Make sure you're logged in as a donor
- Visit `http://localhost:8080/auth/login`
- Log in with donor credentials
- Token will be stored in localStorage

### Issue 4: "Method not allowed"
**Solution**: Check if you're using GET, not POST
```javascript
// Correct
fetch('/api/campaigns/filter-options', { method: 'GET' })

// Wrong
fetch('/api/campaigns/filter-options', { method: 'POST' })
```

## Debugging Steps

### Step 1: Check Backend Server
```powershell
# Check if server is running
netstat -ano | findstr :8000
```

If nothing shows, the server isn't running. Start it:
```powershell
cd capstone_backend
php artisan serve
```

### Step 2: Check Laravel Logs
```powershell
Get-Content capstone_backend\storage\logs\laravel.log -Tail 50
```

Look for errors related to:
- Route not found
- Controller not found
- Method not found
- Authentication errors

### Step 3: Check Route Registration
```powershell
cd capstone_backend
php artisan route:list --path=campaigns
```

Should show:
```
GET|HEAD  api/campaigns/filter
GET|HEAD  api/campaigns/filter-options
```

### Step 4: Test Without Authentication
The routes require authentication. Test if the auth middleware is working:
```powershell
# Without token (should get 401)
curl http://127.0.0.1:8000/api/campaigns/filter-options

# Expected: 401 Unauthorized or redirect
```

### Step 5: Check Frontend API URL
In `capstone_frontend\.env`:
```
VITE_API_URL=http://127.0.0.1:8000/api
```

Make sure it's correct and restart the frontend:
```powershell
cd capstone_frontend
npm run dev
```

## Frontend Code Check

The frontend code in `BrowseCampaignsFiltered.tsx` should look like this:

```typescript
const fetchFilterOptions = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      console.warn('No auth token found');
      return;
    }
    
    const res = await fetch(buildApiUrl('/campaigns/filter-options'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!res.ok) {
      console.error(`Filter options fetch failed: ${res.status} ${res.statusText}`);
      return;
    }
    
    const data = await res.json();
    setFilterOptions(data);
  } catch (error) {
    console.error('Filter options error:', error);
  }
};
```

## Expected Behavior After Fix

1. ✅ No 404 errors in console
2. ✅ Filter options load successfully
3. ✅ Campaigns list displays
4. ✅ Filters work correctly

## If Still Not Working

### Check Database
```powershell
cd capstone_backend
php artisan migrate:status
```

Make sure all migrations are run.

### Check .env File
```powershell
Get-Content capstone_backend\.env | Select-String "DB_"
```

Verify database connection settings.

### Restart Everything
```powershell
# Terminal 1: Backend
cd capstone_backend
php artisan optimize:clear
php artisan serve

# Terminal 2: Frontend
cd capstone_frontend
npm run dev
```

### Clear Browser Cache
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

## Summary

The 404 errors are caused by Laravel route cache issues. Running the fix script or manually clearing caches should resolve the problem.

**Quick Fix Command:**
```powershell
cd capstone_backend && php artisan optimize:clear && php artisan serve
```

After fixing, the campaign browse page should work correctly with filters and search functionality.
