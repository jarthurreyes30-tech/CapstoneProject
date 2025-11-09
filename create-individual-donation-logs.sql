-- Create Individual Activity Logs for Each Donation
-- This script ensures each donation has its own activity log entry

-- ============================================
-- STEP 1: CHECK CURRENT STATE
-- ============================================

SELECT '=== CURRENT STATE ===' as section;

SELECT 
    'Total Donations' as metric,
    COUNT(*) as count
FROM donations;

SELECT 
    'Total donation_created Logs' as metric,
    COUNT(*) as count
FROM activity_logs
WHERE action = 'donation_created';

SELECT 
    'Donations WITHOUT activity logs' as issue,
    COUNT(*) as count
FROM donations d
LEFT JOIN activity_logs al ON 
    al.action = 'donation_created' 
    AND JSON_EXTRACT(al.details, '$.donation_id') = d.id
WHERE al.id IS NULL;

-- ============================================
-- STEP 2: BACKUP EXISTING LOGS
-- ============================================

-- Create backup if not exists
CREATE TABLE IF NOT EXISTS activity_logs_backup_donations AS 
SELECT * FROM activity_logs WHERE action = 'donation_created';

SELECT 
    'Backup created' as status,
    COUNT(*) as backed_up_logs
FROM activity_logs_backup_donations;

-- ============================================
-- STEP 3: DELETE INCORRECT AGGREGATED LOGS
-- ============================================

-- This removes logs that show totaled amounts instead of individual donations
-- We'll regenerate them properly

-- First, identify potential aggregated logs (logs with no matching donation_id)
SELECT '=== IDENTIFYING AGGREGATED LOGS ===' as section;

SELECT 
    al.id,
    u.name,
    JSON_EXTRACT(al.details, '$.amount') as logged_amount,
    JSON_EXTRACT(al.details, '$.donation_id') as donation_id,
    al.created_at
FROM activity_logs al
JOIN users u ON u.id = al.user_id
WHERE al.action = 'donation_created'
  AND (
    JSON_EXTRACT(al.details, '$.donation_id') IS NULL
    OR NOT EXISTS (
      SELECT 1 FROM donations d 
      WHERE d.id = JSON_EXTRACT(al.details, '$.donation_id')
    )
  );

-- Delete logs without valid donation_id
DELETE al FROM activity_logs al
WHERE al.action = 'donation_created'
  AND (
    JSON_EXTRACT(al.details, '$.donation_id') IS NULL
    OR NOT EXISTS (
      SELECT 1 FROM donations d 
      WHERE d.id = JSON_EXTRACT(al.details, '$.donation_id')
    )
  );

SELECT 'Invalid logs deleted' as status;

-- ============================================
-- STEP 4: CREATE MISSING ACTIVITY LOGS
-- ============================================

SELECT '=== CREATING INDIVIDUAL ACTIVITY LOGS ===' as section;

-- Insert activity log for each donation that doesn't have one
INSERT INTO activity_logs (user_id, user_role, action, details, ip_address, user_agent, session_id, created_at, updated_at)
SELECT 
    d.donor_id as user_id,
    u.role as user_role,
    'donation_created' as action,
    JSON_OBJECT(
        'donation_id', d.id,
        'amount', d.amount,
        'campaign_id', d.campaign_id,
        'charity_id', d.charity_id,
        'is_anonymous', d.is_anonymous,
        'is_recurring', d.is_recurring,
        'status', d.status,
        'timestamp', DATE_FORMAT(d.created_at, '%Y-%m-%dT%H:%i:%s.000000Z')
    ) as details,
    '127.0.0.1' as ip_address,
    'System/Regenerated' as user_agent,
    NULL as session_id,
    d.created_at as created_at,
    d.created_at as updated_at
FROM donations d
JOIN users u ON u.id = d.donor_id
WHERE NOT EXISTS (
    SELECT 1 FROM activity_logs al
    WHERE al.action = 'donation_created'
      AND al.user_id = d.donor_id
      AND JSON_EXTRACT(al.details, '$.donation_id') = d.id
);

SELECT 'Individual activity logs created!' as status;

-- ============================================
-- STEP 5: VERIFY RESULTS
-- ============================================

SELECT '=== VERIFICATION ===' as section;

-- Check if all donations now have activity logs
SELECT 
    'Total Donations' as metric,
    COUNT(*) as count
FROM donations;

SELECT 
    'Total donation_created Logs' as metric,
    COUNT(*) as count
FROM activity_logs
WHERE action = 'donation_created';

SELECT 
    'Donations WITHOUT activity logs (should be 0)' as issue,
    COUNT(*) as count
FROM donations d
LEFT JOIN activity_logs al ON 
    al.action = 'donation_created' 
    AND JSON_EXTRACT(al.details, '$.donation_id') = d.id
WHERE al.id IS NULL;

-- ============================================
-- STEP 6: SHOW INDIVIDUAL DONATIONS
-- ============================================

SELECT '=== INDIVIDUAL DONATIONS BY AARON ===' as section;

SELECT 
    d.id as donation_id,
    d.amount,
    d.campaign_id,
    DATE_FORMAT(d.created_at, '%Y-%m-%d %H:%i:%s') as donation_date,
    al.id as log_id,
    JSON_EXTRACT(al.details, '$.amount') as logged_amount
FROM donations d
JOIN users u ON u.id = d.donor_id
LEFT JOIN activity_logs al ON 
    al.action = 'donation_created' 
    AND JSON_EXTRACT(al.details, '$.donation_id') = d.id
WHERE u.name LIKE '%Aaron%Dave%'
ORDER BY d.created_at;

-- Count Aaron's individual donations
SELECT 
    'Aaron - Individual Donations' as donor,
    COUNT(d.id) as donation_count,
    SUM(d.amount) as total_amount,
    GROUP_CONCAT(CONCAT('₱', FORMAT(d.amount, 2)) ORDER BY d.created_at SEPARATOR ', ') as individual_amounts
FROM donations d
JOIN users u ON u.id = d.donor_id
WHERE u.name LIKE '%Aaron%Dave%';

SELECT '=== INDIVIDUAL DONATIONS BY AERON ===' as section;

SELECT 
    d.id as donation_id,
    d.amount,
    d.campaign_id,
    DATE_FORMAT(d.created_at, '%Y-%m-%d %H:%i:%s') as donation_date
FROM donations d
JOIN users u ON u.id = d.donor_id
WHERE u.name LIKE '%Aeron%Mendoza%'
ORDER BY d.created_at;

SELECT '=== INDIVIDUAL DONATIONS BY REGIE ===' as section;

SELECT 
    d.id as donation_id,
    d.amount,
    d.campaign_id,
    DATE_FORMAT(d.created_at, '%Y-%m-%d %H:%i:%s') as donation_date
FROM donations d
JOIN users u ON u.id = d.donor_id
WHERE u.name LIKE '%Regie%Shaine%'
ORDER BY d.created_at;

-- ============================================
-- STEP 7: WHAT ADMIN SHOULD SEE NOW
-- ============================================

SELECT '=== WHAT ADMIN DASHBOARD SHOULD SHOW ===' as section;

-- Show individual donation logs (not totaled)
SELECT 
    CONCAT(u.name, ' (', u.role, ')') as user_info,
    'donation_created' as action,
    CONCAT('Made a donation of ₱', FORMAT(d.amount, 2), 
           CASE WHEN d.campaign_id IS NOT NULL 
                THEN CONCAT(' (Campaign ID: ', d.campaign_id, ')')
                ELSE ''
           END) as description,
    DATE_FORMAT(d.created_at, '%Y-%m-%d, %l:%i:%s %p') as formatted_date,
    '127.0.0.1' as ip_address
FROM donations d
JOIN users u ON u.id = d.donor_id
WHERE DATE(d.created_at) = '2025-10-28'
ORDER BY d.created_at DESC;

-- ============================================
-- SUMMARY
-- ============================================

SELECT '==========================================' as divider;
SELECT 'SUMMARY' as title;
SELECT '==========================================' as divider;

-- Final counts
SELECT 
    'Donations in Database' as metric,
    COUNT(*) as value
FROM donations
WHERE DATE(created_at) = '2025-10-28';

SELECT 
    'Activity Logs (donation_created)' as metric,
    COUNT(*) as value
FROM activity_logs
WHERE action = 'donation_created'
  AND DATE(created_at) = '2025-10-28';

-- By donor
SELECT 
    u.name as donor,
    COUNT(d.id) as donations,
    SUM(d.amount) as total,
    COUNT(al.id) as activity_logs
FROM donations d
JOIN users u ON u.id = d.donor_id
LEFT JOIN activity_logs al ON 
    al.action = 'donation_created' 
    AND JSON_EXTRACT(al.details, '$.donation_id') = d.id
WHERE DATE(d.created_at) = '2025-10-28'
GROUP BY u.id, u.name
ORDER BY donations DESC;

SELECT '==========================================' as divider;
SELECT '✓ Each donation now has its own activity log entry!' as result;
SELECT '✓ No more totaled amounts - all individual donations shown' as result;
SELECT '==========================================' as divider;
