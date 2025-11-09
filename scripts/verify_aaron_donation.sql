-- Verify Aaron Dave Sagan's Anonymous Donation
-- ============================================

-- Step 1: Find Aaron's user account
SELECT 
    id as user_id,
    name,
    email,
    created_at
FROM users 
WHERE name LIKE '%Aaron%' OR name LIKE '%Dave%' OR name LIKE '%Sagan%'
ORDER BY created_at DESC;

-- Expected output should show Aaron's user ID and email

-- Step 2: Find the 15000 anonymous donation
SELECT 
    id as donation_id,
    donor_id,
    donor_name,
    donor_email,
    amount,
    is_anonymous,
    status,
    charity_id,
    campaign_id,
    donated_at,
    created_at
FROM donations 
WHERE amount = 15000 
  AND is_anonymous = true
ORDER BY created_at DESC;

-- Expected: Should show the donation with donor_id = NULL or Aaron's user_id

-- Step 3: Check if donation can be matched (IMPORTANT!)
-- Replace USER_EMAIL with Aaron's actual email from Step 1
SET @aaron_email = 'aarondavesagan@email.com';  -- UPDATE THIS!
SET @aaron_user_id = 1;  -- UPDATE THIS with actual user_id from Step 1!

SELECT 
    d.id as donation_id,
    d.amount,
    d.is_anonymous,
    d.donor_id,
    d.donor_email,
    d.status,
    c.name as charity_name,
    CASE 
        WHEN d.donor_id = @aaron_user_id THEN 'Matched by donor_id'
        WHEN d.donor_id IS NULL AND d.donor_email = @aaron_email THEN 'Matched by email'
        ELSE 'NOT MATCHED'
    END as match_type
FROM donations d
LEFT JOIN charities c ON d.charity_id = c.id
WHERE d.amount = 15000 
  AND d.is_anonymous = true
  AND (
      d.donor_id = @aaron_user_id
      OR (d.donor_id IS NULL AND d.donor_email = @aaron_email)
  );

-- Expected: Should return the donation with match_type showing how it matched

-- Step 4: If donation is NOT matched, check why
SELECT 
    id,
    donor_id,
    donor_email,
    amount,
    is_anonymous,
    CASE
        WHEN donor_id IS NOT NULL THEN 'Has donor_id (should work)'
        WHEN donor_email IS NOT NULL THEN 'Has email (should work if matches)'
        ELSE 'NO DONOR_ID AND NO EMAIL - CANNOT MATCH!'
    END as status_check
FROM donations
WHERE amount = 15000 
  AND is_anonymous = true;

-- Step 5: If donor_email is NULL, UPDATE it (ONLY if you're sure it's Aaron's donation)
-- UNCOMMENT AND RUN ONLY AFTER VERIFYING IT'S THE RIGHT DONATION!
/*
UPDATE donations 
SET donor_email = 'aarondavesagan@email.com'  -- Aaron's email from Step 1
WHERE id = 123  -- Donation ID from Step 2
  AND amount = 15000 
  AND is_anonymous = true
  AND donor_email IS NULL;
*/

-- Step 6: Verify the fix worked
-- After running the UPDATE (if needed), check again:
/*
SELECT 
    d.id,
    d.amount,
    d.donor_id,
    d.donor_email,
    d.is_anonymous,
    d.status,
    'NOW MATCHES!' as result
FROM donations d
WHERE d.amount = 15000 
  AND d.is_anonymous = true
  AND (
      d.donor_id = @aaron_user_id
      OR (d.donor_id IS NULL AND d.donor_email = @aaron_email)
  );
*/

-- ==============================================
-- TROUBLESHOOTING GUIDE
-- ==============================================

-- If donation still doesn't match:

-- 1. Check if email is different:
SELECT 
    u.email as user_email,
    d.donor_email as donation_email,
    CASE 
        WHEN u.email = d.donor_email THEN 'EMAILS MATCH ✓'
        ELSE 'EMAILS DO NOT MATCH ✗'
    END as comparison
FROM users u
CROSS JOIN donations d
WHERE u.name LIKE '%Aaron%'
  AND d.amount = 15000
  AND d.is_anonymous = true;

-- 2. Check for case sensitivity:
SELECT 
    donor_email,
    LOWER(donor_email) as lowercase_email,
    'Check if email has uppercase letters' as note
FROM donations 
WHERE amount = 15000 AND is_anonymous = true;

-- 3. Check for extra spaces:
SELECT 
    donor_email,
    LENGTH(donor_email) as email_length,
    TRIM(donor_email) as trimmed_email,
    'Check for spaces' as note
FROM donations 
WHERE amount = 15000 AND is_anonymous = true;

-- ==============================================
-- QUICK FIX (If all else fails)
-- ==============================================

-- If you need to manually link the donation to Aaron:
/*
-- Get Aaron's user_id
SET @aaron_id = (SELECT id FROM users WHERE name LIKE '%Aaron%Dave%Sagan%' LIMIT 1);

-- Update the donation to have donor_id
UPDATE donations 
SET donor_id = @aaron_id
WHERE id = [DONATION_ID]  -- Replace with actual donation ID
  AND amount = 15000
  AND is_anonymous = true;

-- Verify
SELECT 
    id, donor_id, amount, is_anonymous, status,
    'FIXED - Now has donor_id!' as result
FROM donations 
WHERE id = [DONATION_ID];
*/
