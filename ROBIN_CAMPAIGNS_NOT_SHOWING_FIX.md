# Fix: Robin's 3 Campaigns Not Showing

## Problem
- Database shows Robin (User 6) has 3 campaigns
- When logging in as Robin, charity campaigns page shows 0 campaigns
- Donor browse page shows only 1 campaign (School Kits 2025) - This is CORRECT

## Database Verification ✓

Robin's campaigns confirmed in database:
1. **Campaign ID 6**: Wheels of Hope (draft) - Created Nov 2, 2025
2. **Campaign ID 2**: Teach to Reach (closed) - Created Oct 27, 2025  
3. **Campaign ID 1**: Classroom Renovation Project (closed) - Created Oct 27, 2025

## Changes Made

### Enhanced Logging (`CampaignsPageModern.tsx`)
Added detailed console logging at every step to diagnose the issue:
- STEP 1: API request initiation
- STEP 2-3: API response parsing
- STEP 4-5: Campaign mapping
- STEP 6-7: Filtering logic
- STEP 8-10: State update

## Testing Instructions

###  Step 1: Start Both Servers

**Backend:**
```powershell
cd capstone_backend
php artisan serve
```

**Frontend:**
```powershell
cd capstone_frontend
npm run dev
```

### Step 2: Log In as Robin

1. Open browser: `http://localhost:8080`
2. Log in with Robin's credentials:
   - Email: `Robin.Villaruz17@gmail.com`
   - Password: (your password)

### Step 3: Check Browser Console

1. **BEFORE** navigating to Campaigns page:
   - Press F12 to open DevTools
   - Go to Console tab
   - Clear console (trash icon)

2. Navigate to Campaigns page

3. Look for the detailed logs:
   ```
   [STEP 1] Fetching campaigns...
   [STEP 2] API Response received: {...}
   [STEP 3] Backend campaigns extracted: [...]
   [STEP 4] Starting to map campaigns...
   [STEP 5] Mapped campaigns count: 3
   [STEP 8] Final filtered campaigns: [...]
   [STEP 10] ✓ Campaigns state set successfully!
   ```

### Step 4: Diagnose Based on Console Output

#### Scenario A: No console logs at all
**Problem**: Page not loading or JavaScript error  
**Solution**: Check for errors in console, refresh page

#### Scenario B: Error at STEP 2
**Problem**: API request failed  
**Possible causes**:
- Backend not running
- Authentication token expired
- Network error

**Check**:
1. Is backend running? Visit `http://localhost:8000/api/ping`
2. Check Network tab for `/api/charity/campaigns` request
3. Look for HTTP status code (should be 200)

**Solution**:
- If 401: Log out and log back in
- If 404: User doesn't own a charity (wrong account)
- If 500: Check Laravel logs

#### Scenario C: STEP 3 shows 0 campaigns
**Problem**: API returns empty array  
**Possible causes**:
- Logged in as wrong user
- User doesn't own a charity

**Verify**:
```powershell
cd scripts
php who_am_i.php "YOUR_AUTH_TOKEN"
```

**Solution**: Log in as the correct user (Robin)

#### Scenario D: STEP 5 shows 3 campaigns, but STEP 8 shows 0
**Problem**: Filtering is removing campaigns  
**Check**: Status filter dropdown value

**Solution**:
- Ensure filter is set to "All Campaigns"
- If set to "Active", it will filter out closed/draft campaigns
- Change to "All Campaigns" to see all 3

#### Scenario E: All steps complete, but no campaigns display
**Problem**: React rendering issue or CampaignCard component error

**Check**:
- Look for React errors in console
- Check if there are errors about missing props

**Solution**:
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Restart frontend dev server

## Expected Console Output

When working correctly, you should see:

```
[STEP 1] Fetching campaigns with status: undefined
[STEP 2] API Response received: {data: Array(3), current_page: 1, ...}
[STEP 2a] Response type: object
[STEP 2b] Response.data type: object
[STEP 2c] Response.data: Array(3)
[STEP 3] Backend campaigns extracted: Array(3)
[STEP 3a] Campaigns count: 3
[STEP 3b] First campaign: {id: 6, title: "Wheels of Hope...", ...}
[STEP 4] Starting to map campaigns...
[STEP 4a] Filtering campaign: 6 Wheels of Hope...
[STEP 4b] Mapping campaign: 6 Wheels of Hope...
[STEP 4c] Mapped campaign result: {id: 6, title: "Wheels of Hope...", status: "draft", ...}
[STEP 4a] Filtering campaign: 2 Teach to Reach...
[STEP 4b] Mapping campaign: 2 Teach to Reach...
[STEP 4c] Mapped campaign result: {id: 2, title: "Teach to Reach...", status: "completed", ...}
[STEP 4a] Filtering campaign: 1 Classroom Renovation...
[STEP 4b] Mapping campaign: 1 Classroom Renovation...
[STEP 4c] Mapped campaign result: {id: 1, title: "Classroom Renovation...", status: "completed", ...}
[STEP 5] Mapped campaigns count: 3
[STEP 5a] Mapped campaigns: Array(3)
[STEP 8] Final filtered campaigns: Array(3)
[STEP 8a] Final count: 3
[STEP 9] Setting campaigns state...
[STEP 10] ✓ Campaigns state set successfully!
=== CAMPAIGN LOADING COMPLETE ===========
```

## Expected Results

### Charity Campaigns Page (Robin logged in)
**Stats Cards:**
- Total Campaigns: **3**
- Active Campaigns: **0** (no published campaigns)
- Total Raised: **₱45,000** (₱35,000 + ₱10,000)
- Total Donors: **3** (2 + 1 + 0)

**Campaign Cards:**
1. ✅ **Wheels of Hope** (Draft/Pending)
   - Target: ₱25,000
   - Raised: ₱0
   - Status: Pending

2. ✅ **Teach to Reach** (Completed)
   - Target: ₱10,000
   - Raised: ₱10,000
   - Status: Completed

3. ✅ **Classroom Renovation** (Completed)
   - Target: ₱20,000
   - Raised: ₱35,000
   - Status: Completed

### Donor Browse Page
**Should show:** 1 campaign (School Kits 2025)  
**This is correct** - only published campaigns are visible to donors

## Quick Diagnostic Commands

```powershell
# 1. Check if backend is running
curl http://localhost:8000/api/ping

# 2. Verify Robin's campaigns in database
cd scripts
php check_campaigns.php

# 3. Test API response format
php test_robin_campaigns.php

# 4. Check which user you're logged in as
php who_am_i.php "YOUR_AUTH_TOKEN"

# 5. Test public campaigns (donor view)
powershell -File test_campaigns_simple.ps1
```

## Still Not Working?

If campaigns still don't show after following these steps:

### 1. Verify You're Logged In as Robin
```powershell
cd scripts
# Get token from browser: localStorage.getItem('auth_token')
php who_am_i.php "YOUR_TOKEN_HERE"
```

Should show:
```
User ID: 6
Name: Robin A Villaruz
Email: Robin.Villaruz17@gmail.com
Charity: BUKLOD-SAMAHAN NG NAGKAKAISANG MAY KAPANSANAN NG MAMATID
Total Campaigns: 3
```

### 2. Test API Directly
```powershell
cd scripts
# Get your auth token first
.\test_api_charity_campaigns.ps1 -Token "YOUR_TOKEN"
```

Should return 3 campaigns.

### 3. Clear Everything and Restart
```powershell
# Clear browser data
# In browser: Ctrl+Shift+Delete -> Clear cache and cookies

# Restart backend
cd capstone_backend
# Press Ctrl+C to stop
php artisan serve

# Restart frontend
cd capstone_frontend
# Press Ctrl+C to stop
npm run dev

# Log out and log back in
```

### 4. Check Laravel Logs
```powershell
cd capstone_backend
cat storage/logs/laravel.log | Select-Object -Last 50
```

Look for any errors related to campaigns or authentication.

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| No campaigns, no console logs | JavaScript error | Check console for red errors, refresh page |
| 401 Unauthorized | Token expired | Log out and log back in |
| 404 Not Found | Wrong user or no charity | Verify you're logged in as Robin |
| Empty array returned | Database empty | Run seeder or check database |
| Shows 0 after filter | Status filter active | Change filter to "All Campaigns" |
| API works, but UI empty | React rendering issue | Clear cache, hard refresh |

## Testing Different Users

### User 6 (Robin) - Should see 3 campaigns
```
Email: Robin.Villaruz17@gmail.com
Expected: 3 campaigns (0 active, 2 completed, 1 draft)
```

### User 13 (Charity Admin) - Should see 1 campaign
```
Email: charityadmin@example.com
Expected: 1 campaign (1 active, 0 completed, 0 draft)
```

### User 8 (Joana) - Should see 2 campaigns
```
Email: iflicdmi.staff@gmail.com
Expected: 2 campaigns (0 active, 2 completed, 0 draft)
```

### User 9 (Shaun) - Should see 0 campaigns (CORRECT)
```
Email: contact@charity.org
Expected: 0 campaigns (This is correct - no campaigns created yet)
```

## Next Steps

1. Follow the testing instructions above
2. Share console output if issues persist
3. Check Network tab for API requests
4. Verify auth token is being sent

The enhanced logging will help identify exactly where the process is failing.
