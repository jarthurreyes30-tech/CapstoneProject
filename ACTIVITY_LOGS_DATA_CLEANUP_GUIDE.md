# Activity Logs Data Cleanup Guide

## Problem

The activity logs table contains **seeded/fake data** that doesn't match actual database records:
- ❌ Donation logs for donations that don't exist
- ❌ Campaign logs for campaigns that don't exist  
- ❌ Charity logs for charities that don't exist
- ❌ Logs by users that no longer exist
- ❌ Campaign actions by non-charity users
- ❌ Admin actions by non-admin users

This causes filters in the Action Logs page to show incorrect or misleading data.

## Solution

We've created 3 tools to clean and verify your activity logs:

### 1. **clean-activity-logs.sql** - Cleanup Script
Removes all invalid activity logs that don't match database records.

### 2. **verify-activity-logs-integrity.sql** - Verification Script
Checks data integrity and identifies orphaned records.

### 3. **clean-and-verify-activity-logs.ps1** - Interactive Tool
User-friendly PowerShell script to run cleanup with safety checks.

---

## Step-by-Step Cleanup Process

### STEP 1: Verify Current State

Run the verification script to see what needs cleaning:

```sql
-- Run this in your MySQL client
SOURCE c:/Users/ycel_/Final/verify-activity-logs-integrity.sql;
```

**Or use PowerShell tool:**
```powershell
cd c:\Users\ycel_\Final
.\clean-and-verify-activity-logs.ps1
# Choose Option 1: Verify Data Integrity
```

**Expected Output:**
```
Logs with missing users: 45
Orphaned donation logs: 23
Orphaned campaign logs: 67
Orphaned charity logs: 12
```

### STEP 2: Backup Activity Logs

**CRITICAL: Always backup before cleanup!**

```sql
-- Create backup table
CREATE TABLE activity_logs_backup AS SELECT * FROM activity_logs;

-- Verify backup
SELECT COUNT(*) FROM activity_logs_backup;
```

**Or use PowerShell tool:**
```powershell
# Choose Option 2: Backup Activity Logs
```

### STEP 3: Clean Seeded Data

**Method A: Using SQL Script**
```sql
-- Run the cleanup script
SOURCE c:/Users/ycel_/Final/clean-activity-logs.sql;
```

**Method B: Using PowerShell Tool (RECOMMENDED)**
```powershell
# Choose Option 3: Clean Seeded/Invalid Data
# Type 'YES' to confirm
```

### STEP 4: Verify Cleanup

Check that invalid logs are removed:

```sql
-- Should return 0 orphaned logs
SELECT COUNT(*) as orphaned_count
FROM activity_logs al
LEFT JOIN users u ON u.id = al.user_id
WHERE al.user_id IS NOT NULL AND u.id IS NULL;
```

**Or use PowerShell tool:**
```powershell
# Choose Option 4: Verify After Cleanup
```

### STEP 5: Test Admin Dashboard

1. Login as admin
2. Go to Action Logs page
3. Test each filter:
   - **Donation Created** - Should show only real donations
   - **Donation Confirmed** - Should show only approved donations
   - **Campaign Created** - Should show only real campaigns by charities
   - **All other actions** - Should show accurate data

---

## What Gets Cleaned

### ✅ Removed Records:

1. **Invalid Donation Logs**
   - Logs where donation_id doesn't exist in `donations` table
   - Logs where user doesn't exist
   
2. **Invalid Campaign Logs**
   - Logs where campaign_id doesn't exist in `campaigns` table
   - Campaign logs by non-charity users (role != 'charity_admin')
   
3. **Invalid Charity Logs**
   - Logs where charity_id doesn't exist in `charities` table
   - Charity approval/rejection logs by non-admin users
   
4. **Orphaned User Logs**
   - Logs where user_id doesn't exist in `users` table
   
5. **Invalid Admin Action Logs**
   - User suspension/activation logs by non-admin users
   - Logs for users that don't exist
   
6. **Invalid Fund Usage Logs**
   - Logs where fund_usage_id doesn't exist
   
7. **Invalid Document Logs**
   - Logs where document_id doesn't exist
   
8. **Invalid Follow Logs**
   - Logs where charity_id doesn't exist

### ✅ Kept Records:

- All logs that match actual database records
- All logs with valid user references
- All logs with valid resource references (campaigns, donations, etc.)
- All logs where action type matches user role

---

## Backend Controller Fix

**File:** `capstone_backend/app/Http/Controllers/Admin/UserActivityLogController.php`

**Change Made:**
```php
// OLD - could return logs for deleted users
$query = ActivityLog::with('user:id,name,email,role')
    ->orderBy('created_at', 'desc');

// NEW - only returns logs for existing users
$query = ActivityLog::with('user:id,name,email,role')
    ->whereHas('user') // ✅ Filter out orphaned logs
    ->orderBy('created_at', 'desc');
```

This ensures the API never returns logs for users that no longer exist.

---

## Verification Queries

### Check Donation Log Accuracy

```sql
-- Verify donation_created logs match actual donations
SELECT 
    COUNT(DISTINCT d.id) as actual_donations,
    COUNT(DISTINCT al.id) as logged_donations,
    COUNT(DISTINCT d.id) - COUNT(DISTINCT al.id) as missing_logs
FROM donations d
LEFT JOIN activity_logs al ON 
    al.action = 'donation_created' 
    AND JSON_EXTRACT(al.details, '$.donation_id') = d.id
WHERE d.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY);
```

**Expected:** `missing_logs` should be 0 (all donations are logged)

### Check Campaign Log Accuracy

```sql
-- Verify campaign_created logs match actual campaigns
SELECT 
    COUNT(DISTINCT c.id) as actual_campaigns,
    COUNT(DISTINCT al.id) as logged_campaigns
FROM campaigns c
LEFT JOIN activity_logs al ON 
    al.action = 'campaign_created' 
    AND JSON_EXTRACT(al.details, '$.campaign_id') = c.id
WHERE c.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY);
```

### Check for Role Mismatches

```sql
-- Campaign logs should only be by charity_admin users
SELECT 
    al.action,
    u.role,
    COUNT(*) as count
FROM activity_logs al
JOIN users u ON u.id = al.user_id
WHERE al.action LIKE 'campaign_%'
GROUP BY al.action, u.role;
```

**Expected:** All campaign actions should be by `charity_admin` role only

### Check Overall Health

```sql
-- Summary of activity logs
SELECT 
    'Total Logs' as metric,
    COUNT(*) as count
FROM activity_logs
UNION ALL
SELECT 
    'Valid User Logs',
    COUNT(DISTINCT al.id)
FROM activity_logs al
JOIN users u ON u.id = al.user_id
UNION ALL
SELECT 
    'Orphaned Logs',
    COUNT(DISTINCT al.id)
FROM activity_logs al
LEFT JOIN users u ON u.id = al.user_id
WHERE al.user_id IS NOT NULL AND u.id IS NULL;
```

**Expected:** Orphaned Logs = 0

---

## Testing Checklist

After cleanup, test each action type:

### Authentication Actions:
- [ ] Login logs show only real logins
- [ ] Logout logs show only real logouts
- [ ] Registration logs match user creation dates

### Donation Actions:
- [ ] `donation_created` - Shows only actual donations from `donations` table
- [ ] `donation_confirmed` - Shows only confirmed donations (status = 'confirmed')
- [ ] `donation_rejected` - Shows only rejected donations (if any)
- [ ] All donation logs link to valid donors (role = 'donor')

### Campaign Actions:
- [ ] `campaign_created` - Shows only actual campaigns from `campaigns` table
- [ ] `campaign_updated` - Shows campaign edit history
- [ ] `campaign_activated` - Shows activation events
- [ ] `campaign_paused` - Shows pause events
- [ ] All campaign logs link to charity users (role = 'charity_admin')

### Charity Actions:
- [ ] `charity_created` - Shows charity registration
- [ ] `charity_updated` - Shows profile updates
- [ ] `charity_approved` - Shows admin approvals
- [ ] `charity_rejected` - Shows admin rejections
- [ ] Admin actions only by users with role = 'admin'

### Profile Actions:
- [ ] `profile_updated` - Shows real profile changes with details
- [ ] `password_changed` - Shows password update events
- [ ] `email_changed` - Shows email update events

### Account Actions:
- [ ] `account_deactivated` - Shows deactivation events
- [ ] `account_reactivated` - Shows reactivation events
- [ ] `account_deleted` - Shows deletion events

---

## Common Issues & Solutions

### Issue 1: Script says "mysql command not found"

**Solution:**
```powershell
# Add MySQL to PATH or use full path
$env:Path += ";C:\Program Files\MySQL\MySQL Server 8.0\bin"
```

### Issue 2: Permission denied

**Solution:** Run PowerShell as Administrator

### Issue 3: Backup table already exists

**Solution:**
```sql
-- Drop old backup and create new one
DROP TABLE IF EXISTS activity_logs_backup;
CREATE TABLE activity_logs_backup AS SELECT * FROM activity_logs;
```

### Issue 4: Still seeing orphaned logs after cleanup

**Solution:** Re-run the cleanup script - some logs might reference each other

```sql
-- Run cleanup twice to catch cascading orphans
SOURCE c:/Users/ycel_/Final/clean-activity-logs.sql;
SOURCE c:/Users/ycel_/Final/clean-activity-logs.sql;
```

---

## Restore from Backup

If cleanup removes too much data:

```sql
-- Restore from backup
DROP TABLE activity_logs;
CREATE TABLE activity_logs AS SELECT * FROM activity_logs_backup;

-- Verify restoration
SELECT COUNT(*) FROM activity_logs;
```

**Or use PowerShell tool:**
```powershell
# Choose Option 6: Restore from Backup
# Type 'RESTORE' to confirm
```

---

## Preventing Future Seeded Data

### ✅ Ensure All Controllers Log Actions

Update these controllers to use `ActivityLogService`:

```php
// Example: DonationController.php
use App\Services\ActivityLogService;

public function store(Request $request) {
    $donation = Donation::create([...]);
    
    // ✅ LOG THE ACTION
    ActivityLogService::logDonationCreated(
        auth()->id(),
        $donation->id,
        $donation->amount,
        $donation->campaign_id
    );
    
    return response()->json($donation, 201);
}
```

### ✅ Never Insert Activity Logs Manually

❌ **DON'T:**
```php
ActivityLog::create([
    'user_id' => 999, // Fake user
    'action' => 'donation_created',
    'details' => ['donation_id' => 888] // Fake donation
]);
```

✅ **DO:**
```php
// Only log after successful action
ActivityLogService::logDonationCreated(
    auth()->id(),        // Real authenticated user
    $donation->id,       // Real donation ID from database
    $donation->amount,
    $donation->campaign_id
);
```

---

## Files Created

1. **clean-activity-logs.sql** - SQL script to remove invalid logs
2. **verify-activity-logs-integrity.sql** - SQL queries to check data
3. **clean-and-verify-activity-logs.ps1** - Interactive PowerShell tool
4. **ACTIVITY_LOGS_DATA_CLEANUP_GUIDE.md** - This documentation

---

## Summary

### Before Cleanup:
- ❌ Activity logs contain seeded/fake data
- ❌ Logs reference non-existent records
- ❌ Admin dashboard shows misleading information
- ❌ Filters show incomplete or wrong data

### After Cleanup:
- ✅ All activity logs match actual database records
- ✅ No orphaned logs (users, donations, campaigns all exist)
- ✅ Admin dashboard shows accurate data
- ✅ All filters work correctly with real data
- ✅ Donation logs show only real donor donations
- ✅ Campaign logs show only real charity campaigns
- ✅ All action types display accurate information

---

## Quick Start

```powershell
# Run the interactive tool
cd c:\Users\ycel_\Final
.\clean-and-verify-activity-logs.ps1

# Follow the steps:
# 1. Verify Data Integrity (see what needs cleaning)
# 2. Backup Activity Logs (create safety backup)
# 3. Clean Seeded/Invalid Data (remove bad records)
# 4. Verify After Cleanup (confirm cleanup worked)
# 5. Test in admin dashboard
```

---

## Support

If you encounter issues:
1. Check the backup table exists before cleanup
2. Run verification queries to identify problems
3. Review the SQL scripts before executing
4. Test with a small dataset first
5. Always keep a backup before major changes

**Your activity logs will now accurately reflect real user actions! 🎉**
