# 🔧 REFUND SYSTEM TROUBLESHOOTING GUIDE

**Status**: Nothing changes when refund is approved  
**Date**: November 9, 2025

---

## 🚨 THE PROBLEM

When a charity approves a refund:
- ❌ Donation status stays "Completed" (should change to "Refunded")
- ❌ Campaign total doesn't decrease
- ❌ Charity total doesn't decrease
- ❌ Donor sees wrong status in history

---

## 🔍 COMPREHENSIVE DIAGNOSIS

### **RUN THIS FIRST:**

```powershell
cd c:\Users\ycel_\Final
.\diagnose-and-fix.ps1
```

This script will:
1. ✅ Run deep diagnosis to find ALL problems
2. ✅ Automatically fix what it can
3. ✅ Clear all caches
4. ✅ Verify the fixes worked
5. ✅ Generate detailed report files

---

## 📋 COMMON ISSUES & FIXES

### **Issue 1: Migrations Not Run** ⚠️

**Symptoms:**
- Error: "Unknown column 'is_refunded'"
- Error: "'refunded' is not a valid enum value"

**Diagnosis:**
```bash
cd capstone_backend
php diagnose_refund_problem.php
```

Look for:
```
❌ 'refunded' value is NOT in the ENUM!
❌ Migration '..._add_refund_fields_to_donations_table' NOT run!
```

**Fix:**
```bash
cd capstone_backend
php artisan migrate
php artisan migrate:status  # Verify migrations ran
```

**Verify:**
```bash
php diagnose_refund_problem.php
# Should now show:
# ✅ 'refunded' value IS in the ENUM
# ✅ Migration has been run
```

---

### **Issue 2: Laravel Cache** 🔄

**Symptoms:**
- Migrations run but still getting errors
- Old schema information cached

**Fix:**
```bash
cd capstone_backend
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
php artisan optimize:clear
```

**Restart Laravel:**
```bash
# Stop current server (Ctrl+C)
php artisan serve
```

---

### **Issue 3: Model Events Blocking Update** 🚫

**Symptoms:**
- Update appears to succeed but doesn't persist
- No error messages
- Database shows old status after update

**Diagnosis:**
```bash
cd capstone_backend
php diagnose_refund_problem.php
```

Look for:
```
❌ Eloquent update doesn't persist - possible model event blocking it
```

**Fix - Use Raw SQL Bypass:**
```bash
cd capstone_backend
php manual_force_update.php
```

This bypasses Eloquent entirely and uses raw SQL to force the update.

---

### **Issue 4: Fillable Property** 📝

**Symptoms:**
- Mass assignment exception
- Status/is_refunded not updating

**Check:**
Look in `app/Models/Donation.php` for:
```php
protected $fillable = [
    'status',           // Must be here
    'is_refunded',      // Must be here
    'refunded_at',      // Must be here
    // ... other fields
];
```

**Fix:**
If missing, add them to the `$fillable` array in `Donation.php`.

---

### **Issue 5: Database Constraints** 🔒

**Symptoms:**
- SQL error when updating
- "Data truncated for column 'status'"

**Diagnosis:**
```bash
cd capstone_backend
php diagnose_refund_problem.php
```

Look for:
```
❌ Cannot update status to 'refunded': [SQL error message]
```

**Fix:**
The ENUM doesn't include 'refunded'. Run the specific migration:
```bash
php artisan migrate --path=database/migrations/2025_11_08_150000_add_refunded_status_to_donations.php
```

---

### **Issue 6: CharityRefundController Not Updated** 🎛️

**Symptoms:**
- Refund approved but nothing happens
- No error in logs

**Check:**
Look in `app/Http/Controllers/CharityRefundController.php` around line 150.

**Should have:**
```php
if ($action === 'approve') {
    $donation = $refund->donation;
    
    $donation->update([
        'status' => 'refunded',      // Must be here
        'is_refunded' => true,        // Must be here
        'refunded_at' => now(),       // Must be here
    ]);
}
```

**If missing**, the controller was not updated with our fixes.

---

### **Issue 7: Frontend Caching** 💻

**Symptoms:**
- Backend shows correct status
- Frontend still shows "Completed"

**Fix:**
1. Hard refresh browser: **Ctrl + Shift + R** (or Ctrl + F5)
2. Clear browser cache
3. Check in Incognito/Private mode
4. Restart React dev server:
   ```bash
   cd capstone_frontend
   # Stop server (Ctrl+C)
   npm start
   ```

---

## 🛠️ STEP-BY-STEP FIX PROCEDURE

### **1. Run Complete Diagnosis**
```powershell
cd c:\Users\ycel_\Final
.\diagnose-and-fix.ps1
```

**This does everything automatically!**

### **2. If Automatic Fix Fails, Manual Steps:**

#### **A. Check Migrations**
```bash
cd capstone_backend
php artisan migrate:status
```

Look for:
- ✅ `2025_11_08_000001_add_refund_fields_to_donations_table` - Ran
- ✅ `2025_11_08_150000_add_refunded_status_to_donations` - Ran

If showing "Pending", run:
```bash
php artisan migrate
```

#### **B. Verify Database Schema**
```bash
php diagnose_refund_problem.php
```

Should show:
- ✅ 'refunded' value IS in the ENUM
- ✅ 'is_refunded' column exists

#### **C. Clear All Caches**
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

#### **D. Force Update with Raw SQL**
If nothing else works:
```bash
php manual_force_update.php
```

**WARNING:** This bypasses all Laravel safeguards but guarantees the update happens.

#### **E. Restart Everything**
```bash
# Stop Laravel (Ctrl+C)
php artisan serve

# In another terminal:
cd capstone_frontend
# Stop React (Ctrl+C)
npm start
```

#### **F. Hard Refresh Browser**
- Press **Ctrl + Shift + R** (Windows)
- Or **Ctrl + F5**
- Or clear browser cache completely

---

## 📊 VERIFICATION STEPS

### **1. Check Database Directly**

```sql
-- Check specific refund
SELECT 
    d.id,
    d.status,
    d.is_refunded,
    d.amount,
    rr.status as refund_status,
    c.title as campaign
FROM donations d
INNER JOIN refund_requests rr ON d.id = rr.donation_id
LEFT JOIN campaigns c ON d.campaign_id = c.id
WHERE d.amount = 2070.00 AND rr.status = 'approved';
```

**Expected Result:**
```
status: refunded
is_refunded: 1
refund_status: approved
```

### **2. Check Campaign Total**

```sql
-- Check IFL campaign
SELECT 
    title,
    total_donations_received,
    (SELECT SUM(amount) 
     FROM donations 
     WHERE campaign_id = campaigns.id 
       AND status = 'completed' 
       AND is_refunded = 0) as calculated_total
FROM campaigns
WHERE title LIKE '%IFL%';
```

**Expected:** `total_donations_received` should equal `calculated_total`

### **3. Run Verification Script**

```bash
cd capstone_backend
php check_specific_refunds.php
```

Should show:
```
✅ CORRECT: Properly refunded
  Donation Status: refunded ✅ Correct
  Is Refunded Flag: true ✅ Correct
```

---

## 🔥 NUCLEAR OPTION (Last Resort)

If **NOTHING** works, this will definitely fix it:

```bash
cd capstone_backend
php manual_force_update.php
```

This script:
- ✅ Uses raw SQL (bypasses everything)
- ✅ Updates donation status directly
- ✅ Recalculates all totals
- ✅ Verifies changes stuck
- ✅ Uses transactions (safe rollback)

---

## 📁 DIAGNOSTIC FILES

After running `diagnose-and-fix.ps1`, check these files:

1. **`diagnosis_detailed.txt`** - Full diagnostic report
   - Look for lines with ❌
   - Shows exact problem

2. **`verification_result.txt`** - Post-fix verification
   - Shows if fix worked
   - Current status of refunds

---

## 🎯 SPECIFIC ISSUE: Aeron's ₱2,070 Refund

### **Current State:**
- Refund ID: #3
- Donor: Aeron Mendoza Baguiu
- Amount: ₱2,070.00
- Campaign: IFL (Integrated Foundational Learning)
- Refund Status: **Approved** ✅
- Donation Status: **Completed** ❌ (Should be "Refunded")

### **Expected After Fix:**
- Donation Status: **Refunded** ✅
- Is Refunded: **true** ✅
- Campaign Total: **Reduced by ₱2,070**
- Charity Total: **Reduced**

### **Quick Fix:**
```bash
cd capstone_backend
php manual_force_update.php
```

---

## 📞 STILL NOT WORKING?

### **Check Laravel Logs:**
```bash
tail -f storage/logs/laravel.log
```

### **Enable Query Logging:**
Add to `app/Http/Controllers/CharityRefundController.php` in `respond()` method:
```php
\DB::enableQueryLog();

// ... your code ...

dd(\DB::getQueryLog());  // Shows all SQL queries
```

### **Check for Errors:**
Look in browser console for JavaScript errors that might prevent display updates.

---

## ✅ SUCCESS CRITERIA

You'll know it's working when:

1. ✅ Database shows `status = 'refunded'`
2. ✅ Database shows `is_refunded = 1`
3. ✅ Campaign total decreased by refund amount
4. ✅ Charity dashboard shows "Refunded" status
5. ✅ Donor history shows "Refunded" badge
6. ✅ `diagnose_refund_problem.php` shows no ❌
7. ✅ `test_refund_system.php` all tests pass

---

## 🚀 RECOMMENDED FIX ORDER

1. **Run**: `.\diagnose-and-fix.ps1` (tries everything)
2. **If fails**: `php manual_force_update.php` (nuclear option)
3. **Restart**: Laravel server + React dev server
4. **Refresh**: Browser (Ctrl+F5)
5. **Verify**: Check charity dashboard and donor history

---

## 📝 NOTES

- All scripts use database transactions (safe rollback on error)
- Raw SQL bypass is safe - just skips Eloquent
- Cache clearing is necessary after schema changes
- Browser cache can hide backend changes
- Check both frontend AND backend changes

---

**Last Updated**: November 9, 2025  
**Scripts Location**: `c:\Users\ycel_\Final\`  
**Backend Location**: `c:\Users\ycel_\Final\capstone_backend\`
