-- Activity Logs Data Integrity Check
-- This script verifies that all activity logs match actual database records

-- ============================================
-- 1. CHECK DONATION LOGS ACCURACY
-- ============================================

-- Count donation logs
SELECT 
    'Donation Logs' as check_name,
    COUNT(*) as total_logs
FROM activity_logs
WHERE action IN ('donation_created', 'donation_confirmed', 'donation_rejected');

-- Verify donation_created logs match actual donations
SELECT 
    'donation_created accuracy' as check_name,
    COUNT(DISTINCT al.id) as logs_count,
    COUNT(DISTINCT d.id) as actual_donations,
    COUNT(DISTINCT d.id) - COUNT(DISTINCT al.id) as missing_logs
FROM donations d
LEFT JOIN activity_logs al ON 
    al.action = 'donation_created' 
    AND JSON_EXTRACT(al.details, '$.donation_id') = d.id
WHERE d.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Check for orphaned donation logs (logs without actual donations)
SELECT 
    'Orphaned donation logs' as check_name,
    COUNT(*) as orphaned_count
FROM activity_logs al
LEFT JOIN donations d ON d.id = JSON_EXTRACT(al.details, '$.donation_id')
WHERE al.action IN ('donation_created', 'donation_confirmed', 'donation_rejected')
  AND JSON_EXTRACT(al.details, '$.donation_id') IS NOT NULL
  AND d.id IS NULL;

-- Show sample orphaned donation logs
SELECT 
    al.id,
    al.action,
    al.user_id,
    JSON_EXTRACT(al.details, '$.donation_id') as donation_id,
    al.created_at
FROM activity_logs al
LEFT JOIN donations d ON d.id = JSON_EXTRACT(al.details, '$.donation_id')
WHERE al.action IN ('donation_created', 'donation_confirmed', 'donation_rejected')
  AND JSON_EXTRACT(al.details, '$.donation_id') IS NOT NULL
  AND d.id IS NULL
LIMIT 10;

-- ============================================
-- 2. CHECK CAMPAIGN LOGS ACCURACY
-- ============================================

-- Count campaign logs
SELECT 
    'Campaign Logs' as check_name,
    COUNT(*) as total_logs
FROM activity_logs
WHERE action LIKE 'campaign_%';

-- Verify campaign_created logs match actual campaigns
SELECT 
    'campaign_created accuracy' as check_name,
    COUNT(DISTINCT al.id) as logs_count,
    COUNT(DISTINCT c.id) as actual_campaigns,
    COUNT(DISTINCT c.id) - COUNT(DISTINCT al.id) as missing_logs
FROM campaigns c
LEFT JOIN activity_logs al ON 
    al.action = 'campaign_created' 
    AND JSON_EXTRACT(al.details, '$.campaign_id') = c.id
WHERE c.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Check for orphaned campaign logs
SELECT 
    'Orphaned campaign logs' as check_name,
    COUNT(*) as orphaned_count
FROM activity_logs al
LEFT JOIN campaigns c ON c.id = JSON_EXTRACT(al.details, '$.campaign_id')
WHERE al.action LIKE 'campaign_%'
  AND JSON_EXTRACT(al.details, '$.campaign_id') IS NOT NULL
  AND c.id IS NULL;

-- Show sample orphaned campaign logs
SELECT 
    al.id,
    al.action,
    al.user_id,
    JSON_EXTRACT(al.details, '$.campaign_id') as campaign_id,
    JSON_EXTRACT(al.details, '$.campaign_title') as campaign_title,
    al.created_at
FROM activity_logs al
LEFT JOIN campaigns c ON c.id = JSON_EXTRACT(al.details, '$.campaign_id')
WHERE al.action LIKE 'campaign_%'
  AND JSON_EXTRACT(al.details, '$.campaign_id') IS NOT NULL
  AND c.id IS NULL
LIMIT 10;

-- ============================================
-- 3. CHECK CHARITY LOGS ACCURACY
-- ============================================

-- Count charity logs
SELECT 
    'Charity Logs' as check_name,
    COUNT(*) as total_logs
FROM activity_logs
WHERE action LIKE 'charity_%';

-- Check for orphaned charity logs
SELECT 
    'Orphaned charity logs' as check_name,
    COUNT(*) as orphaned_count
FROM activity_logs al
LEFT JOIN charities ch ON ch.id = JSON_EXTRACT(al.details, '$.charity_id')
WHERE al.action LIKE 'charity_%'
  AND JSON_EXTRACT(al.details, '$.charity_id') IS NOT NULL
  AND ch.id IS NULL;

-- ============================================
-- 4. CHECK USER ROLE MISMATCHES
-- ============================================

-- Campaign actions by non-charity users
SELECT 
    'Campaign logs by non-charity users' as check_name,
    COUNT(*) as mismatch_count
FROM activity_logs al
JOIN users u ON u.id = al.user_id
WHERE al.action IN ('campaign_created', 'campaign_updated', 'campaign_deleted', 'campaign_activated', 'campaign_paused')
  AND u.role != 'charity_admin';

-- Admin actions by non-admin users
SELECT 
    'Admin actions by non-admin users' as check_name,
    COUNT(*) as mismatch_count
FROM activity_logs al
JOIN users u ON u.id = al.user_id
WHERE al.action IN ('charity_approved', 'charity_rejected', 'user_suspended', 'user_activated')
  AND u.role != 'admin';

-- ============================================
-- 5. CHECK FOR LOGS WITH MISSING USERS
-- ============================================

SELECT 
    'Logs with missing users' as check_name,
    COUNT(*) as orphaned_count
FROM activity_logs al
LEFT JOIN users u ON u.id = al.user_id
WHERE al.user_id IS NOT NULL 
  AND u.id IS NULL;

-- Show sample logs with missing users
SELECT 
    al.id,
    al.action,
    al.user_id,
    al.user_role,
    al.created_at
FROM activity_logs al
LEFT JOIN users u ON u.id = al.user_id
WHERE al.user_id IS NOT NULL 
  AND u.id IS NULL
LIMIT 10;

-- ============================================
-- 6. OVERALL SUMMARY
-- ============================================

SELECT 
    'SUMMARY' as report_section,
    '' as check_name,
    NULL as count;

SELECT 
    'Total Activity Logs' as metric,
    COUNT(*) as count
FROM activity_logs
UNION ALL
SELECT 
    'Logs with Valid Users' as metric,
    COUNT(DISTINCT al.id) as count
FROM activity_logs al
JOIN users u ON u.id = al.user_id
UNION ALL
SELECT 
    'Logs with Missing Users' as metric,
    COUNT(DISTINCT al.id) as count
FROM activity_logs al
LEFT JOIN users u ON u.id = al.user_id
WHERE al.user_id IS NOT NULL AND u.id IS NULL
UNION ALL
SELECT 
    'Donation Logs' as metric,
    COUNT(*) as count
FROM activity_logs
WHERE action IN ('donation_created', 'donation_confirmed', 'donation_rejected')
UNION ALL
SELECT 
    'Campaign Logs' as metric,
    COUNT(*) as count
FROM activity_logs
WHERE action LIKE 'campaign_%'
UNION ALL
SELECT 
    'Charity Logs' as metric,
    COUNT(*) as count
FROM activity_logs
WHERE action LIKE 'charity_%'
UNION ALL
SELECT 
    'Profile Update Logs' as metric,
    COUNT(*) as count
FROM activity_logs
WHERE action = 'profile_updated';

-- ============================================
-- 7. ACTION TYPE DISTRIBUTION
-- ============================================

SELECT 
    al.action,
    COUNT(*) as count,
    COUNT(DISTINCT al.user_id) as unique_users,
    MIN(al.created_at) as first_occurrence,
    MAX(al.created_at) as last_occurrence
FROM activity_logs al
JOIN users u ON u.id = al.user_id
GROUP BY al.action
ORDER BY count DESC;

-- ============================================
-- 8. RECENT ACTIVITY (LAST 7 DAYS)
-- ============================================

SELECT 
    DATE(al.created_at) as date,
    al.action,
    COUNT(*) as count
FROM activity_logs al
JOIN users u ON u.id = al.user_id
WHERE al.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(al.created_at), al.action
ORDER BY date DESC, count DESC;

-- ============================================
-- 9. IDENTIFY SEEDED DATA PATTERNS
-- ============================================

-- Look for suspicious patterns (e.g., too many actions in same second)
SELECT 
    al.action,
    DATE_FORMAT(al.created_at, '%Y-%m-%d %H:%i:%s') as exact_time,
    COUNT(*) as simultaneous_actions
FROM activity_logs al
GROUP BY al.action, exact_time
HAVING COUNT(*) > 5
ORDER BY simultaneous_actions DESC
LIMIT 20;

-- ============================================
-- RECOMMENDED ACTIONS
-- ============================================

SELECT 
    'RECOMMENDATIONS' as section,
    'Run clean-activity-logs.sql to remove orphaned/seeded data' as action,
    (SELECT COUNT(*) FROM activity_logs al LEFT JOIN users u ON u.id = al.user_id WHERE u.id IS NULL) as records_to_clean;
