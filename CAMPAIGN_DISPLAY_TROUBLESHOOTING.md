# Campaign Display Troubleshooting Guide

## Current Situation

Based on database analysis:
- **Total campaigns in database**: 6
- **Published campaigns**: 1 (School Kits 2025)
- **Closed campaigns**: 4
- **Draft campaigns**: 1

## User Accounts & Their Campaigns

| User ID | Name | Email | Charity | Campaigns |
|---------|------|-------|---------|-----------|
| 6 | Robin A Villaruz | Robin.Villaruz17@gmail.com | BUKLOD-SAMAHAN | 3 (2 closed, 1 draft) |
| 8 | Joana Marie A Guillemer | iflicdmi.staff@gmail.com | IFL-ICDMI | 2 (both closed) |
| 9 | Shaun Maverik O Gomez | contact@charity.org | Bayanihan Care | 0 campaigns |
| 12 | Test Charity Admin | charity@example.com | **NO CHARITY** | N/A |
| 13 | Charity Admin | charityadmin@example.com | HopeWorks Foundation | 1 (published) |

## Why You See "0 Campaigns"

### Scenario 1: Logged in as User 9 (Shaun)
- **Charity**: Bayanihan Care Foundation
- **Campaigns**: 0
- **Expected behavior**: Shows "No campaigns yet" message
- **Solution**: Create a campaign for this charity

### Scenario 2: Logged in as User 12 (Test)
- **Charity**: NONE
- **Campaigns**: N/A
- **Expected behavior**: Shows error "No charity found for this user"
- **Solution**: Either:
  1. Create a charity for this user, OR
  2. Log in as a different user who owns a charity

### Scenario 3: Logged in as User 6, 8, or 13
- **Should see campaigns**: Yes
- **If not showing**: Check browser console for errors

## Step-by-Step Troubleshooting

### Step 1: Verify Which User You're Logged In As

1. Open browser DevTools (F12)
2. Go to Console tab
3. Type: `localStorage.getItem('auth_token')` or `sessionStorage.getItem('auth_token')`
4. Copy the token
5. Go to https://jwt.io and paste the token to decode it
6. Check the `sub` field - this is your user ID

### Step 2: Check If That User Owns a Charity

Run this script:
```powershell
cd scripts
php diagnose_charity_campaigns.php
```

Look for your user ID and check:
- Does the user own a charity?
- How many campaigns does that charity have?

### Step 3: Test the API Directly

#### Test Donor Browse (Public)
```powershell
cd scripts
powershell -File test_campaigns_simple.ps1
```
Expected: Should show 1 published campaign

#### Test Charity Campaigns (Authenticated)
1. Get your auth token from browser (Step 1)
2. Run in PowerShell:
```powershell
$token = "YOUR_TOKEN_HERE"
$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/json"
}
Invoke-RestMethod -Uri "http://localhost:8000/api/charity/campaigns" -Headers $headers | ConvertTo-Json -Depth 3
```

### Step 4: Check Browser Console

1. Open the charity campaigns page
2. Open DevTools → Console
3. Look for these logs:
   - `API Response:` - Shows the raw API response
   - `Backend campaigns:` - Shows the parsed campaigns array
   - `Filtered campaigns:` - Shows campaigns after filtering

### Step 5: Check Network Tab

1. Open DevTools → Network tab
2. Refresh the campaigns page
3. Look for `/api/charity/campaigns` request
4. Check:
   - **Status**: Should be 200 (or 404 if no charity)
   - **Response**: Should contain campaign data
   - **Headers**: Should include `Authorization: Bearer ...`

## Solutions

### Solution 1: Log In as a User with Campaigns

**Recommended test accounts:**
- **User 6** (Robin): Has 3 campaigns
- **User 13** (Charity Admin): Has 1 published campaign

### Solution 2: Create Campaigns for Current User

If logged in as User 9 (Shaun):
1. Click "Create Campaign" button
2. Fill in campaign details
3. Save as draft or publish

### Solution 3: Create a Charity for User 12

If logged in as User 12 (Test):
1. This user needs a charity created in the database
2. Run this SQL or use the charity registration flow:
```sql
INSERT INTO charities (owner_id, name, ...) VALUES (12, 'Test Charity', ...);
```

### Solution 4: Check Frontend Build

If campaigns should show but don't:
```bash
cd capstone_frontend
npm run build
npm run dev
```

## Expected Behavior After Fix

### For User 6 (Robin) - Charity Campaigns Page
```
Total Campaigns: 3
Published Campaigns: 0
Total Raised: ₱0

Campaigns:
- [Completed] Classroom Renovation Project
- [Completed] Teach to Reach: Empowering Young Minds
- [Pending] Wheels of Hope: Mobility Aid for Persons with Disabilities
```

### For User 13 (Charity Admin) - Charity Campaigns Page
```
Total Campaigns: 1
Published Campaigns: 1
Total Raised: ₱0

Campaigns:
- [Active] School Kits 2025
```

### For Any Donor - Browse Campaigns Page
```
1 campaigns available

Campaigns:
- School Kits 2025 (HopeWorks Foundation)
```

## Common Issues

### Issue: "No campaigns yet" but database has campaigns
**Cause**: Logged in as wrong user or user's charity has no campaigns
**Fix**: Check which user you're logged in as (Step 1)

### Issue: Error "No charity found for this user"
**Cause**: User account is not associated with a charity
**Fix**: Create a charity for this user or log in as different user

### Issue: API returns 401 Unauthorized
**Cause**: Auth token is missing or expired
**Fix**: Log out and log back in

### Issue: Campaigns show in API but not in UI
**Cause**: Frontend parsing error
**Fix**: Check browser console for JavaScript errors

## Quick Test Commands

```powershell
# Check if backend is running
curl http://localhost:8000/api/ping

# Check database campaigns
cd scripts
php check_campaigns.php

# Check user-charity associations
php diagnose_charity_campaigns.php

# Test public campaigns endpoint
powershell -File test_campaigns_simple.ps1
```

## Need More Help?

1. Check browser console for errors
2. Check Laravel logs: `capstone_backend/storage/logs/laravel.log`
3. Enable debug mode in `.env`: `APP_DEBUG=true`
4. Check network requests in DevTools
