# Testing Guide for Fixed Issues

## Pre-Testing Checklist

1. **Backend Server Running**
   ```bash
   cd capstone_backend
   php artisan serve
   # Should be running on http://127.0.0.1:8000
   ```

2. **Frontend Server Running**
   ```bash
   cd capstone_frontend
   npm run dev
   # Should be running on http://localhost:8080 or http://localhost:5173
   ```

3. **Clear Browser Cache**
   - Press Ctrl+Shift+Delete
   - Clear cached images and files
   - Or use Incognito/Private mode

## Test 1: Storage File Access (CORS Fix)

### Test Steps:
1. Open browser and navigate to donor dashboard
2. Open Developer Tools (F12)
3. Go to Console tab
4. Navigate to "Browse Campaigns" page

### Expected Results:
- ✅ No "OpaqueResponseBlocking" errors
- ✅ Campaign cover images load successfully
- ✅ No CORS policy errors in console
- ✅ Network tab shows 200 OK for storage requests

### What to Look For:
```
Before Fix:
❌ A resource is blocked by OpaqueResponseBlocking
❌ GET http://127.0.0.1:8000/storage/campaign_covers/xxx.jpg [403 Forbidden]

After Fix:
✅ GET http://127.0.0.1:8000/storage/campaign_covers/xxx.jpg [200 OK]
✅ Response Headers include:
   - Access-Control-Allow-Origin: http://localhost:8080
   - Access-Control-Allow-Credentials: true
   - Cross-Origin-Resource-Policy: cross-origin
```

## Test 2: Charity Dashboard Images

### Test Steps:
1. Login as charity admin
2. Navigate to charity dashboard
3. Check Developer Console

### Expected Results:
- ✅ Charity cover photo loads
- ✅ Campaign thumbnails load
- ✅ Update images load
- ✅ No 403 Forbidden errors

### Network Tab Verification:
```
Request Headers:
  Origin: http://localhost:8080
  
Response Headers:
  Access-Control-Allow-Origin: http://localhost:8080
  Access-Control-Allow-Credentials: true
  Content-Type: image/jpeg (or image/png)
  Cache-Control: public, max-age=31536000
```

## Test 3: Campaign Filter Endpoints

### Test Steps:
1. Navigate to "Browse Campaigns" page
2. Open Developer Console
3. Click on "Filters" button
4. Check Network tab

### Expected Results:
- ✅ GET /api/campaigns/filter-options returns 200 OK
- ✅ Response contains filter options (types, regions, provinces, cities)
- ✅ GET /api/campaigns/filter returns campaign data
- ✅ No 404 errors

### Sample Response:
```json
// /api/campaigns/filter-options
{
  "types": [
    {"value": "medical", "label": "Medical"},
    {"value": "education", "label": "Education"}
  ],
  "regions": ["NCR", "Region IV-A"],
  "provinces": ["Metro Manila", "Laguna"],
  "cities": ["Manila", "Quezon City"]
}

// /api/campaigns/filter
{
  "data": [...campaigns...],
  "current_page": 1,
  "last_page": 5,
  "total": 50
}
```

## Test 4: Charity Profile Page

### Test Steps:
1. Login as charity admin
2. Navigate to charity profile page
3. Check console for errors

### Expected Results:
- ✅ Profile photo loads
- ✅ Cover photo loads
- ✅ No console errors about undefined properties
- ✅ Contact information displays correctly
- ✅ Debug logs show proper data structure

### Console Logs to Verify:
```
✅ Charity profile loaded successfully
📧 ProfileSidebar charity data: {email: "...", phone: "..."}
```

## Test 5: Analytics/Trends Data

### Test Steps:
1. Login as charity admin
2. Navigate to Reports/Analytics page
3. Check Trends & Timing tab
4. Open console

### Expected Results:
- ✅ Trends data loads successfully
- ✅ Charts display with data
- ✅ No empty arrays for campaign_activity or donation_trends
- ✅ Summary statistics show correctly

### Console Logs:
```
🔍 Fetching trends data with charityId: 1
📊 Trends data RAW response: {campaign_activity: [...], donation_trends: [...]}
📊 Summary: {busiest_month: "...", most_donations: "..."}
```

## Common Issues & Solutions

### Issue: Images still showing 403 Forbidden

**Solution:**
```bash
# 1. Check storage symlink
ls -la capstone_backend/public/storage

# 2. If missing, create it
cd capstone_backend
php artisan storage:link

# 3. Check file permissions
chmod -R 775 storage
chmod -R 775 bootstrap/cache

# 4. Verify files exist
ls storage/app/public/campaign_covers/
```

### Issue: CORS errors persist

**Solution:**
```bash
# 1. Clear all caches
cd capstone_backend
php artisan config:clear
php artisan route:clear
php artisan cache:clear

# 2. Restart backend server
# Stop current server (Ctrl+C)
php artisan serve

# 3. Clear browser cache completely
# Or use Incognito mode
```

### Issue: Filter endpoints return 404

**Solution:**
```bash
# 1. Verify routes exist
php artisan route:list | grep filter

# Expected output:
# GET|HEAD  api/campaigns/filter ........... AnalyticsController@filterCampaigns
# GET|HEAD  api/campaigns/filter-options ... AnalyticsController@filterOptions

# 2. Check authentication
# Ensure you're logged in and have a valid token
# Check Application > Local Storage > auth_token in DevTools

# 3. Verify API URL in frontend
# Check capstone_frontend/.env
# VITE_API_URL=http://127.0.0.1:8000/api
```

### Issue: Empty data in analytics

**Solution:**
```bash
# 1. Check if you have campaigns and donations
# Login to database and verify:
SELECT COUNT(*) FROM campaigns WHERE charity_id = 1;
SELECT COUNT(*) FROM donations WHERE status = 'completed';

# 2. Check backend logs
tail -f capstone_backend/storage/logs/laravel.log

# 3. Verify charity_id is being passed correctly
# Check browser console for API request URLs
```

## Verification Checklist

After running all tests, verify:

- [ ] No "OpaqueResponseBlocking" errors in console
- [ ] No 403 Forbidden errors for storage files
- [ ] No 404 errors for filter endpoints
- [ ] All images load successfully
- [ ] Campaign filters work correctly
- [ ] Analytics data displays properly
- [ ] Charity profile shows all information
- [ ] No undefined property warnings

## Performance Verification

Check Network tab for:
- Storage files: Should have `Cache-Control: public, max-age=31536000`
- API requests: Should complete in < 500ms
- Images: Should load from cache on subsequent visits

## Browser Compatibility

Test in:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)

All browsers should show same behavior with no CORS errors.

## Final Notes

If all tests pass:
1. ✅ CORS issues are resolved
2. ✅ Storage access is working
3. ✅ Filter endpoints are functional
4. ✅ All pages load without errors

The application is ready for use!
