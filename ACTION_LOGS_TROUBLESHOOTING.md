# Action Logs 404 Error - Troubleshooting Guide

## Current Issue

Getting 404 errors when trying to fetch action logs:
```
Failed to fetch action logs: Request failed with status code 404
Failed to fetch statistics: Request failed with status code 404
```

## Step-by-Step Fix

### Step 1: Restart Backend Server

The backend was just updated with new routes and needs to be restarted.

**Option A: Use PowerShell Script (Recommended)**
```powershell
# Run this from the project root
.\restart_backend.ps1
```

**Option B: Manual Restart**
```powershell
# 1. Find process on port 8000
netstat -ano | findstr :8000

# 2. Kill the process (replace PID with actual process ID)
taskkill /F /PID <PID>

# 3. Navigate to backend
cd capstone_backend

# 4. Clear cache
php artisan optimize:clear

# 5. Start server
php artisan serve
```

### Step 2: Verify Backend is Running

Open a browser and visit: http://127.0.0.1:8000/api/ping

Expected response:
```json
{
  "ok": true,
  "time": "2025-10-28 16:47:00"
}
```

### Step 3: Test the Routes Directly

**Test Statistics Endpoint:**
Open a new browser tab (make sure you're logged in as admin) and visit:
```
http://127.0.0.1:8000/api/admin/activity-logs/statistics
```

**Expected Response:** JSON with statistics data
**If you get 401:** You're not authenticated - login first
**If you get 404:** Routes still not registered - see Step 4

### Step 4: Verify Routes are Registered

```powershell
cd capstone_backend
php artisan route:list --path=activity-logs
```

**Expected Output:**
Should show routes like:
- GET api/admin/activity-logs
- GET api/admin/activity-logs/statistics  
- GET api/admin/activity-logs/export

**If routes don't appear:** Run this to clear and cache routes:
```powershell
php artisan route:clear
php artisan route:cache
php artisan optimize
```

### Step 5: Check Browser Console for Exact URL

1. Open browser DevTools (F12)
2. Go to Network tab
3. Refresh the action logs page
4. Look for the failed request
5. Check the **Request URL** 

**What to look for:**
- URL should be: `http://127.0.0.1:8000/api/admin/activity-logs`
- NOT: `http://localhost:8080/api/admin/activity-logs` (wrong port)
- Check the **Status** column (should show 404)
- Click the request to see **Response** tab for error details

### Step 6: Verify Environment Variables

**Frontend .env:**
```
c:\Users\ycel_\DamingRepoPunyeta\capstone_frontend\.env
```

Should contain:
```
VITE_API_URL=http://127.0.0.1:8000/api
```

**Backend .env:**
```
c:\Users\ycel_\DamingRepoPunyeta\capstone_backend\.env
```

Should contain:
```
APP_URL=http://127.0.0.1:8000
```

### Step 7: Hard Refresh Frontend

After backend is restarted:
1. Clear browser cache: `Ctrl + Shift + Delete`
2. Hard refresh: `Ctrl + Shift + R`
3. Or clear application data:
   - F12 → Application tab
   - Clear storage → Clear site data

## Common Issues and Solutions

### Issue: "Route not defined"
**Solution:** Backend routes need to be cached after update
```powershell
cd capstone_backend
php artisan route:clear
php artisan config:clear
php artisan cache:clear
```

### Issue: "Unauthenticated" (401)
**Solution:** Login again or check auth token
1. Logout completely
2. Login as admin
3. Try action logs page again

### Issue: CORS Error
**Solution:** Check backend CORS configuration
```powershell
cd capstone_backend
# Check config/cors.php
# Restart backend after any changes
```

### Issue: Wrong API URL
**Solution:** Frontend might be calling wrong URL
1. Check browser console Network tab
2. Verify request is going to http://127.0.0.1:8000
3. Check .env file has correct VITE_API_URL

## Verification Checklist

- [ ] Backend server restarted and running on port 8000
- [ ] `/api/ping` endpoint responds successfully
- [ ] Routes registered (checked with `php artisan route:list`)
- [ ] Frontend .env has correct VITE_API_URL
- [ ] Logged in as admin user
- [ ] Browser cache cleared
- [ ] No CORS errors in console
- [ ] Request going to correct URL (127.0.0.1:8000)

## If Still Not Working

### Get More Debug Info

**Check Laravel Logs:**
```powershell
cd capstone_backend
Get-Content storage\logs\laravel.log -Tail 50
```

**Enable Debug Mode:**
In `capstone_backend\.env`:
```
APP_DEBUG=true
```

**Test Route Manually with cURL:**
```powershell
# Get auth token from browser (F12 → Application → Local Storage → auth_token)
$token = "your_token_here"

# Test statistics endpoint
curl -X GET "http://127.0.0.1:8000/api/admin/activity-logs/statistics" `
  -H "Accept: application/json" `
  -H "Authorization: Bearer $token"
```

### Check Controller Exists

```powershell
cd capstone_backend
dir app\Http\Controllers\Admin\UserActivityLogController.php
```

Should show the file exists (7,579 bytes)

### Verify Database Has Data

```powershell
cd capstone_backend
php artisan tinker
# Then in tinker:
App\Models\ActivityLog::count();
# Should show: 34 (or more)
exit
```

## Quick Fix Commands

Run these in order if everything else fails:

```powershell
# Stop backend
taskkill /F /IM php.exe

# Clear everything
cd capstone_backend
php artisan optimize:clear
php artisan route:clear
php artisan config:clear
php artisan cache:clear
php artisan view:clear

# Start fresh
php artisan serve
```

## Status After Running Commands

Once backend is restarted:
- ✅ Routes should be loaded fresh
- ✅ Controller should be accessible
- ✅ API should respond with 200 OK
- ✅ Action logs page should display data

## Contact Points

If still having issues after all steps:
1. Check Laravel logs: `storage/logs/laravel.log`
2. Check browser console for detailed error
3. Verify database connection in `.env`
4. Check if seeder was run successfully
