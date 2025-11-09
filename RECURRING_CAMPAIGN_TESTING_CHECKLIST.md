# Recurring Campaign - Complete Testing Checklist

## Pre-Testing Setup

### 1. Verify Migrations
```bash
cd capstone_backend
php artisan migrate:status
```
✅ Verify these migrations are present and run:
- `2025_10_31_add_recurring_fields_to_campaigns`
- `2025_11_02_183501_make_recurrence_interval_nullable_in_campaigns_table`

### 2. Start Servers
```bash
# Terminal 1 - Backend
cd capstone_backend
php artisan serve

# Terminal 2 - Frontend
cd capstone_frontend
npm run dev
```

### 3. Prepare Test Data
- Have a charity account ready
- Have at least one donation channel configured
- Have test beneficiary categories selected

---

## Test Suite 1: Create Recurring Campaign (Happy Path)

### Test 1.1: Monthly Recurring Campaign
**Steps:**
1. Login as charity user
2. Navigate to Campaign Management
3. Click "Create Campaign"
4. Fill in required fields:
   - Title: "Monthly Food Distribution Program"
   - Description: "Providing monthly food packages to families in need"
   - Problem: (50+ chars) "Many families in our community struggle to afford basic food necessities on a monthly basis..."
   - Solution: (50+ chars) "We will distribute food packages containing rice, canned goods, and vegetables to 100 families..."
   - Expected Outcome: "100 families will receive nutritious food monthly"
   - Target Amount: 25000
   - Beneficiary Categories: Select "Low Income Families"
   - Location: Select Region, Province, City, Barangay
   - Campaign Type: Feeding Program
5. Select **Donation Type: "Recurring"**
6. Verify:
   - ✅ "Enable Recurring Campaign" checkbox is AUTO-CHECKED
   - ✅ Recurring settings section is visible
7. Configure recurring settings:
   - Recurrence Pattern: Monthly
   - Repeat Every: 1
   - First Occurrence Date: (Select next month's 1st day)
   - Auto-publish: ✅ Checked
8. Select donation channels
9. Click "Create Campaign"

**Expected Results:**
- ✅ Campaign created successfully
- ✅ Success toast notification appears
- ✅ Campaign appears in campaign list
- ✅ Campaign details show:
  - `donation_type`: "recurring"
  - `is_recurring`: true
  - `recurrence_type`: "monthly"
  - `recurrence_interval`: 1
  - `next_occurrence_date`: calculated correctly
  - `auto_publish`: true

**Database Verification:**
```sql
SELECT id, title, donation_type, is_recurring, recurrence_type, 
       recurrence_interval, recurrence_start_date, next_occurrence_date
FROM campaigns 
WHERE title = 'Monthly Food Distribution Program';
```

---

### Test 1.2: Quarterly Medical Mission
**Steps:**
1. Create campaign with:
   - Title: "Quarterly Medical Mission"
   - Donation Type: Recurring
   - Recurrence Pattern: Quarterly
   - Repeat Every: 1
   - First Occurrence: 3 months from now
2. Submit

**Expected Results:**
- ✅ Campaign created
- ✅ `recurrence_type`: "quarterly"
- ✅ `next_occurrence_date`: 3 months from start date

---

### Test 1.3: Weekly Food Distribution
**Steps:**
1. Create campaign with:
   - Title: "Weekly Food Distribution"
   - Donation Type: Recurring
   - Recurrence Pattern: Weekly
   - Repeat Every: 1
   - First Occurrence: Next week
2. Submit

**Expected Results:**
- ✅ Campaign created
- ✅ `recurrence_type`: "weekly"
- ✅ `next_occurrence_date`: 1 week from start date

---

### Test 1.4: Bi-Weekly Program
**Steps:**
1. Create campaign with:
   - Recurrence Pattern: Weekly
   - Repeat Every: 2
2. Submit

**Expected Results:**
- ✅ Campaign created
- ✅ `recurrence_interval`: 2
- ✅ `next_occurrence_date`: 2 weeks from start date

---

## Test Suite 2: Validation Tests

### Test 2.1: Missing First Occurrence Date
**Steps:**
1. Create recurring campaign
2. Select Donation Type: Recurring
3. Leave "First Occurrence Date" empty
4. Click "Create Campaign"

**Expected Results:**
- ❌ Validation error displayed
- ❌ Error message: "First occurrence date is required for recurring campaigns"
- ❌ Campaign NOT created

---

### Test 2.2: Invalid End Date
**Steps:**
1. Create recurring campaign
2. Set First Occurrence Date: 2025-12-01
3. Set Stop Recurring After: 2025-11-01 (before start date)
4. Click "Create Campaign"

**Expected Results:**
- ❌ Validation error displayed
- ❌ Error message: "End date must be after start date"
- ❌ Campaign NOT created

---

### Test 2.3: Missing Required Fields
**Steps:**
1. Create recurring campaign
2. Leave Title empty
3. Click "Create Campaign"

**Expected Results:**
- ❌ Validation error for title
- ❌ Campaign NOT created

---

## Test Suite 3: One-Time Campaign Tests

### Test 3.1: Create One-Time Campaign
**Steps:**
1. Create campaign
2. Select Donation Type: "One-Time"
3. Fill all required fields
4. Click "Create Campaign"

**Expected Results:**
- ✅ Campaign created successfully
- ✅ `donation_type`: "one_time"
- ✅ `is_recurring`: false
- ✅ All recurring fields are NULL:
  - `recurrence_type`: NULL
  - `recurrence_interval`: NULL
  - `recurrence_start_date`: NULL
  - `next_occurrence_date`: NULL
  - `auto_publish`: NULL

**Database Verification:**
```sql
SELECT id, title, donation_type, is_recurring, recurrence_type, recurrence_interval
FROM campaigns 
WHERE donation_type = 'one_time'
ORDER BY created_at DESC
LIMIT 1;
```

---

### Test 3.2: Switch from Recurring to One-Time
**Steps:**
1. Start creating campaign
2. Select Donation Type: "Recurring"
3. Configure recurring settings
4. Change Donation Type to "One-Time"
5. Submit

**Expected Results:**
- ✅ Campaign created as one-time
- ✅ All recurring fields ignored/set to NULL

---

## Test Suite 4: Edit Campaign Tests

### Test 4.1: Edit Existing Recurring Campaign
**Steps:**
1. Open existing recurring campaign
2. Click "Edit"
3. Change recurrence interval from 1 to 2
4. Click "Update Campaign"

**Expected Results:**
- ✅ Campaign updated successfully
- ✅ `recurrence_interval`: 2
- ✅ `next_occurrence_date`: recalculated

---

### Test 4.2: Convert One-Time to Recurring
**Steps:**
1. Open existing one-time campaign
2. Click "Edit"
3. Change Donation Type to "Recurring"
4. Configure recurring settings
5. Click "Update Campaign"

**Expected Results:**
- ✅ Campaign updated successfully
- ✅ `donation_type`: "recurring"
- ✅ `is_recurring`: true
- ✅ All recurring fields populated

---

### Test 4.3: Convert Recurring to One-Time
**Steps:**
1. Open existing recurring campaign
2. Click "Edit"
3. Change Donation Type to "One-Time"
4. Click "Update Campaign"

**Expected Results:**
- ✅ Campaign updated successfully
- ✅ `donation_type`: "one_time"
- ✅ `is_recurring`: false
- ✅ All recurring fields set to NULL

---

## Test Suite 5: Edge Cases

### Test 5.1: Recurring Campaign Without Checkbox
**Steps:**
1. Create campaign
2. Select Donation Type: "Recurring"
3. Manually uncheck "Enable Recurring Campaign"
4. Try to submit

**Expected Results:**
- ✅ Checkbox is AUTO-RE-ENABLED by useEffect
- ✅ Cannot submit without recurring settings

---

### Test 5.2: Very Long Interval
**Steps:**
1. Create recurring campaign
2. Set Repeat Every: 12
3. Submit

**Expected Results:**
- ✅ Campaign created
- ✅ `recurrence_interval`: 12
- ✅ `next_occurrence_date`: calculated correctly (12 months/weeks/etc from start)

---

### Test 5.3: Past Start Date
**Steps:**
1. Create recurring campaign
2. Set First Occurrence Date to yesterday
3. Submit

**Expected Results:**
- ✅ Campaign created (no validation preventing past dates)
- ✅ Ready for immediate processing by cron job

---

### Test 5.4: Indefinite Recurrence
**Steps:**
1. Create recurring campaign
2. Leave "Stop Recurring After" empty
3. Submit

**Expected Results:**
- ✅ Campaign created
- ✅ `recurrence_end_date`: NULL
- ✅ Will recur indefinitely until manually stopped

---

## Test Suite 6: Backend API Tests

### Test 6.1: Direct API Call - Recurring Campaign
```bash
# Use the test script
cd scripts
./test_recurring_campaign.ps1
```

**Expected Results:**
- ✅ Campaign created via API
- ✅ No null constraint errors
- ✅ All recurring fields populated

---

### Test 6.2: API Call Without is_recurring Field
**Test Data:**
```json
{
  "title": "Test Campaign",
  "donation_type": "recurring",
  "recurrence_type": "monthly",
  "recurrence_start_date": "2025-12-01"
  // Note: is_recurring NOT included
}
```

**Expected Results:**
- ✅ Backend auto-sets `is_recurring` to true
- ✅ Campaign created successfully

---

### Test 6.3: API Call With Null recurrence_interval
**Test Data:**
```json
{
  "title": "Test Campaign",
  "donation_type": "recurring",
  "is_recurring": true,
  "recurrence_type": "monthly",
  "recurrence_interval": null,
  "recurrence_start_date": "2025-12-01"
}
```

**Expected Results:**
- ✅ Backend sets `recurrence_interval` to 1 (default)
- ✅ Campaign created successfully

---

## Test Suite 7: Database Integrity Tests

### Test 7.1: Check Existing Campaigns
```sql
-- Run this query
SELECT 
    COUNT(*) as total_recurring,
    SUM(CASE WHEN recurrence_interval IS NULL THEN 1 ELSE 0 END) as null_intervals,
    SUM(CASE WHEN recurrence_type IS NULL THEN 1 ELSE 0 END) as null_types
FROM campaigns
WHERE donation_type = 'recurring';
```

**Expected Results:**
- ✅ `null_intervals`: 0
- ✅ `null_types`: 0

---

### Test 7.2: Fix Existing Campaigns
```bash
# Run the fix script
cd capstone_backend
php artisan tinker < ../scripts/check_recurring_campaigns.php
```

**Expected Results:**
- ✅ All campaigns fixed
- ✅ No null values in recurring fields

---

## Test Suite 8: Console Command Tests

### Test 8.1: Manual Processing
```bash
cd capstone_backend
php artisan campaigns:process-recurring
```

**Expected Results:**
- ✅ Command runs without errors
- ✅ Shows "Processing recurring campaigns..."
- ✅ Creates new occurrences for due campaigns

---

### Test 8.2: Scheduled Task
```bash
php artisan schedule:list
```

**Expected Results:**
- ✅ Shows `campaigns:process-recurring` scheduled daily at midnight
- ✅ Shows next run time

---

## Test Suite 9: UI/UX Tests

### Test 9.1: Auto-Enable Checkbox
**Steps:**
1. Open Create Campaign modal
2. Select Donation Type: "Recurring"
3. Observe checkbox

**Expected Results:**
- ✅ "Enable Recurring Campaign" checkbox is automatically checked
- ✅ Recurring settings section appears immediately

---

### Test 9.2: Error Display
**Steps:**
1. Create recurring campaign
2. Leave First Occurrence Date empty
3. Click "Create Campaign"

**Expected Results:**
- ✅ Red error message appears under the date field
- ✅ Error message is clear and helpful
- ✅ Field is highlighted in red

---

### Test 9.3: Form Reset
**Steps:**
1. Open Create Campaign modal
2. Fill in some fields
3. Close modal
4. Reopen modal

**Expected Results:**
- ✅ All fields are reset to defaults
- ✅ No data persists from previous session

---

## Test Suite 10: Performance Tests

### Test 10.1: Multiple Campaigns
**Steps:**
1. Create 10 recurring campaigns in succession
2. Monitor server response times

**Expected Results:**
- ✅ All campaigns created successfully
- ✅ No performance degradation
- ✅ No memory issues

---

### Test 10.2: Large Interval Values
**Steps:**
1. Create campaign with interval: 12
2. Create campaign with interval: 1
3. Compare processing times

**Expected Results:**
- ✅ Both campaigns created in similar time
- ✅ No performance difference

---

## Summary Checklist

### Critical Tests (Must Pass)
- [ ] Test 1.1: Monthly Recurring Campaign
- [ ] Test 2.1: Missing First Occurrence Date (Validation)
- [ ] Test 3.1: Create One-Time Campaign
- [ ] Test 4.1: Edit Existing Recurring Campaign
- [ ] Test 5.1: Auto-enable checkbox
- [ ] Test 6.1: Direct API Call
- [ ] Test 7.1: Database Integrity
- [ ] Test 9.1: Auto-Enable Checkbox

### Important Tests (Should Pass)
- [ ] Test 1.2: Quarterly Medical Mission
- [ ] Test 1.3: Weekly Food Distribution
- [ ] Test 2.2: Invalid End Date
- [ ] Test 4.2: Convert One-Time to Recurring
- [ ] Test 5.4: Indefinite Recurrence
- [ ] Test 8.1: Manual Processing

### Nice-to-Have Tests (Good to Pass)
- [ ] Test 1.4: Bi-Weekly Program
- [ ] Test 5.2: Very Long Interval
- [ ] Test 5.3: Past Start Date
- [ ] Test 10.1: Multiple Campaigns

---

## Bug Reporting Template

If you find any issues during testing, report them using this template:

```markdown
### Bug Report

**Test Case**: [Test number and name]
**Severity**: [Critical / High / Medium / Low]

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Result**:
- 

**Actual Result**:
- 

**Screenshots/Logs**:
[Attach if available]

**Environment**:
- Browser: 
- OS: 
- Backend Version: 
- Frontend Version: 
```

---

## Testing Sign-Off

**Tester Name**: ___________________  
**Date**: ___________________  
**Tests Passed**: ___ / ___  
**Tests Failed**: ___ / ___  
**Critical Issues Found**: ___  

**Overall Status**: [ ] PASS [ ] FAIL [ ] NEEDS REVIEW

**Notes**:
_______________________________________
_______________________________________
_______________________________________

---

**Document Version**: 1.0  
**Last Updated**: November 2, 2025  
**Status**: Ready for Testing ✅
