-- Fix Anonymous Donations to Appear in Donor History
-- ====================================================
-- 
-- This script updates existing anonymous donations to preserve donor_id
-- so they appear in the donor's personal history while remaining anonymous
-- to charities and the public.
--
-- IMPORTANT: Only run this if you need to restore donor attribution
-- for existing anonymous donations. New donations will work automatically.

-- Step 1: Check current state of anonymous donations
SELECT 
    COUNT(*) as total_anonymous,
    COUNT(donor_id) as with_donor_id,
    COUNT(*) - COUNT(donor_id) as without_donor_id,
    COUNT(donor_email) as with_email
FROM donations 
WHERE is_anonymous = true;

-- Step 2: Preview donations that can be fixed (have email but no donor_id)
SELECT 
    d.id,
    d.donor_name,
    d.donor_email,
    d.amount,
    d.donated_at,
    u.id as matching_user_id,
    u.name as matching_user_name
FROM donations d
LEFT JOIN users u ON u.email = d.donor_email
WHERE d.is_anonymous = true 
  AND d.donor_id IS NULL 
  AND d.donor_email IS NOT NULL
LIMIT 20;

-- Step 3: Update anonymous donations to restore donor_id
-- (Uncomment to execute)
/*
UPDATE donations 
SET donor_id = (
    SELECT id FROM users 
    WHERE users.email = donations.donor_email
    LIMIT 1
)
WHERE is_anonymous = true 
  AND donor_id IS NULL 
  AND donor_email IS NOT NULL
  AND EXISTS (
      SELECT 1 FROM users 
      WHERE users.email = donations.donor_email
  );
*/

-- Step 4: Verify the fix
-- (Run after Step 3)
/*
SELECT 
    COUNT(*) as total_anonymous,
    COUNT(donor_id) as with_donor_id,
    COUNT(*) - COUNT(donor_id) as still_without_donor_id
FROM donations 
WHERE is_anonymous = true;
*/

-- Step 5: Check specific donor's anonymous donations now appear
-- Replace USER_ID with actual user ID
/*
SELECT 
    id,
    amount,
    is_anonymous,
    charity_id,
    campaign_id,
    donated_at,
    status
FROM donations
WHERE donor_id = USER_ID
  AND is_anonymous = true
ORDER BY donated_at DESC;
*/

-- ====================================================
-- NOTES:
-- ====================================================
-- 
-- 1. This script only works for anonymous donations where:
--    - The donor was logged in when donating
--    - The donor_email field was captured
--    - A matching user account exists
--
-- 2. Anonymous donations from:
--    - Guest users (not logged in)
--    - Deleted user accounts
--    - Donations without email
--    Will remain without donor_id and won't appear in history
--
-- 3. After running this script:
--    - Donors can see their anonymous donations in history
--    - Charities still see "Anonymous" (due to is_anonymous flag)
--    - Public views still show "Anonymous"
--
-- 4. Going forward:
--    - New anonymous donations will automatically preserve donor_id
--    - This script is only for existing legacy data
