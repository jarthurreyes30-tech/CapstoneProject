# Donor Charities Page - JSON Parse Error Fix

## Problem
When visiting `http://localhost:8080/donor/charities`, the browser console shows:
- "Filter options error: SyntaxError: JSON.parse: unexpected character at line 1 column 1"
- "Campaigns error: SyntaxError: JSON.parse: unexpected character at line 1 column 1"

## Root Cause
The errors are coming from the `BrowseCampaignsFiltered` component (not `BrowseCharities`), which makes API calls to:
- `/api/campaigns/filter-options`
- `/api/campaigns/filter`

These endpoints are returning HTML error pages instead of JSON, causing the JSON parse error.

## Fixes Applied

### 1. Frontend Error Handling (BrowseCampaignsFiltered.tsx)
Added comprehensive error handling to:
- Check for auth token before making requests
- Validate HTTP response status
- Check content-type header before parsing JSON
- Provide better error messages to help diagnose issues

### 2. Diagnostic Steps

#### Check if Backend is Running
```powershell
# In capstone_backend directory
php artisan serve
```
The backend should be running on `http://127.0.0.1:8000`

#### Check if Frontend is Running
```powershell
# In capstone_frontend directory
npm run dev
```
The frontend should be running on `http://localhost:8080` or similar

#### Test Backend Endpoints Directly
```powershell
# Test if backend is responding
curl http://127.0.0.1:8000/api/ping

# Test filter options endpoint (requires auth token)
$token = "YOUR_AUTH_TOKEN_HERE"
curl -H "Authorization: Bearer $token" http://127.0.0.1:8000/api/campaigns/filter-options
```

## Why This Might Be Happening

### Scenario 1: Backend Not Running
If the Laravel backend is not running on port 8000, the requests will fail.

**Solution**: Start the backend with `php artisan serve`

### Scenario 2: Authentication Issue
The endpoints require authentication. If the user is not logged in or the token is invalid, Laravel might return an HTML error page.

**Solution**: Ensure you're logged in as a donor user

### Scenario 3: Database Issue
If there's a database connection issue, Laravel will throw an exception and return an HTML error page.

**Solution**: Check database connection in `.env` file

### Scenario 4: Laravel Error
If there's a PHP error in the controller, Laravel will return an HTML error page.

**Solution**: Check Laravel logs at `capstone_backend/storage/logs/laravel.log`

## Testing the Fix

1. **Start the backend**:
   ```powershell
   cd capstone_backend
   php artisan serve
   ```

2. **Start the frontend**:
   ```powershell
   cd capstone_frontend
   npm run dev
   ```

3. **Log in as a donor** and navigate to `/donor/charities`

4. **Check browser console** - you should now see more informative error messages instead of JSON parse errors

5. **If you see "No auth token found"** - you need to log in

6. **If you see "Failed to load campaigns: 500"** - check Laravel logs for PHP errors

7. **If you see "Server returned invalid response"** - the backend is returning HTML instead of JSON

## Additional Notes

- The `/donor/charities` route loads `BrowseCharities.tsx`, which only fetches charities
- The errors might be from a different page or component that was previously loaded
- Clear browser cache and reload if issues persist
- Check Network tab in browser DevTools to see the actual API responses

## Next Steps

If errors persist after applying these fixes:
1. Check the Network tab in browser DevTools
2. Look at the actual response from the failing API calls
3. Check Laravel logs for backend errors
4. Verify database connection and migrations
5. Ensure all required environment variables are set in both `.env` files
