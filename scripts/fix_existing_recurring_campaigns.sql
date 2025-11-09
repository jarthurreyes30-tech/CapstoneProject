-- Fix Existing Recurring Campaigns with NULL recurrence_interval
-- This script updates any existing campaigns that have null recurrence_interval

-- Step 1: Check for campaigns with issues
SELECT 
    id,
    title,
    donation_type,
    is_recurring,
    recurrence_type,
    recurrence_interval,
    recurrence_start_date,
    next_occurrence_date
FROM campaigns
WHERE donation_type = 'recurring' 
  AND (recurrence_interval IS NULL OR recurrence_type IS NULL);

-- Step 2: Fix campaigns with null recurrence_interval
UPDATE campaigns
SET 
    recurrence_interval = 1,
    recurrence_type = COALESCE(recurrence_type, 'monthly'),
    is_recurring = true,
    auto_publish = COALESCE(auto_publish, true)
WHERE donation_type = 'recurring' 
  AND (recurrence_interval IS NULL OR recurrence_type IS NULL);

-- Step 3: Verify the fix
SELECT 
    id,
    title,
    donation_type,
    is_recurring,
    recurrence_type,
    recurrence_interval,
    recurrence_start_date,
    next_occurrence_date,
    auto_publish
FROM campaigns
WHERE donation_type = 'recurring';

-- Step 4: Check for any remaining issues
SELECT 
    COUNT(*) as issue_count,
    'Campaigns with null recurrence_interval' as issue_type
FROM campaigns
WHERE donation_type = 'recurring' AND recurrence_interval IS NULL

UNION ALL

SELECT 
    COUNT(*) as issue_count,
    'Campaigns with null recurrence_type' as issue_type
FROM campaigns
WHERE donation_type = 'recurring' AND recurrence_type IS NULL

UNION ALL

SELECT 
    COUNT(*) as issue_count,
    'Campaigns with is_recurring = false but donation_type = recurring' as issue_type
FROM campaigns
WHERE donation_type = 'recurring' AND is_recurring = false;

-- Expected result: All counts should be 0
