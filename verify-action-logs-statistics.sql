-- Verify Action Logs Statistics Accuracy
-- Run these queries to ensure stats match actual database records

-- ============================================
-- 1. TOTAL ACTIVITIES (Should match the card)
-- ============================================
SELECT 
    'Total Activities' as metric,
    COUNT(*) as count,
    'All valid activity logs with existing users' as description
FROM activity_logs al
WHERE EXISTS (SELECT 1 FROM users u WHERE u.id = al.user_id);

-- Breakdown by user role
SELECT 
    u.role,
    COUNT(*) as activity_count
FROM activity_logs al
JOIN users u ON u.id = al.user_id
GROUP BY u.role
ORDER BY activity_count DESC;

-- ============================================
-- 2. DONATIONS (Should match the Donations card)
-- ============================================
-- Count all donation-related actions
SELECT 
    'Donation Actions' as metric,
    COUNT(*) as count,
    'All donation_created, donation_confirmed, donation_rejected' as description
FROM activity_logs al
WHERE al.action IN ('donation_created', 'donation_confirmed', 'donation_rejected')
  AND EXISTS (SELECT 1 FROM users u WHERE u.id = al.user_id);

-- Breakdown by donation action type
SELECT 
    al.action,
    COUNT(*) as count
FROM activity_logs al
WHERE al.action IN ('donation_created', 'donation_confirmed', 'donation_rejected')
  AND EXISTS (SELECT 1 FROM users u WHERE u.id = al.user_id)
GROUP BY al.action;

-- Verify donation logs match actual donations
SELECT 
    'Actual Donations in Database' as source,
    COUNT(*) as count
FROM donations
UNION ALL
SELECT 
    'donation_created Logs' as source,
    COUNT(*) as count
FROM activity_logs
WHERE action = 'donation_created'
  AND EXISTS (SELECT 1 FROM users u WHERE u.id = user_id);

-- ============================================
-- 3. CAMPAIGNS CREATED (Should match the Campaigns card)
-- ============================================
SELECT 
    'Campaigns Created' as metric,
    COUNT(*) as count,
    'All campaign_created actions by charity_admin users' as description
FROM activity_logs al
WHERE al.action = 'campaign_created'
  AND EXISTS (SELECT 1 FROM users u WHERE u.id = al.user_id);

-- Verify campaign logs match actual campaigns
SELECT 
    'Actual Campaigns in Database' as source,
    COUNT(*) as count
FROM campaigns
UNION ALL
SELECT 
    'campaign_created Logs' as source,
    COUNT(*) as count
FROM activity_logs
WHERE action = 'campaign_created'
  AND EXISTS (SELECT 1 FROM users u WHERE u.id = user_id);

-- Check if any campaign logs are by non-charity users (SHOULD BE 0)
SELECT 
    'Campaign logs by NON-charity users (SHOULD BE 0)' as issue,
    COUNT(*) as count
FROM activity_logs al
JOIN users u ON u.id = al.user_id
WHERE al.action = 'campaign_created'
  AND u.role != 'charity_admin';

-- ============================================
-- 4. NEW REGISTRATIONS (Should match Registrations card)
-- ============================================
SELECT 
    'New Registrations' as metric,
    COUNT(*) as count,
    'All register and user_registered actions' as description
FROM activity_logs al
WHERE al.action IN ('register', 'user_registered')
  AND EXISTS (SELECT 1 FROM users u WHERE u.id = al.user_id);

-- Breakdown by role
SELECT 
    u.role,
    COUNT(*) as registrations
FROM activity_logs al
JOIN users u ON u.id = al.user_id
WHERE al.action IN ('register', 'user_registered')
GROUP BY u.role;

-- Verify registration logs match actual users
SELECT 
    'Total Users in Database' as source,
    COUNT(*) as count
FROM users
UNION ALL
SELECT 
    'Registration Logs' as source,
    COUNT(*) as count
FROM activity_logs
WHERE action IN ('register', 'user_registered')
  AND EXISTS (SELECT 1 FROM users u WHERE u.id = user_id);

-- ============================================
-- 5. OVERALL ACCURACY CHECK
-- ============================================

-- Compare what Admin Dashboard shows vs what's in database
SELECT 
    'DASHBOARD STATISTICS VERIFICATION' as report_title;

SELECT 
    'Total Activities' as card,
    (SELECT COUNT(*) FROM activity_logs al WHERE EXISTS (SELECT 1 FROM users u WHERE u.id = al.user_id)) as should_show;

SELECT 
    'Donations' as card,
    (SELECT COUNT(*) FROM activity_logs al 
     WHERE al.action IN ('donation_created', 'donation_confirmed', 'donation_rejected')
     AND EXISTS (SELECT 1 FROM users u WHERE u.id = al.user_id)) as should_show;

SELECT 
    'Campaigns Created' as card,
    (SELECT COUNT(*) FROM activity_logs al 
     WHERE al.action = 'campaign_created'
     AND EXISTS (SELECT 1 FROM users u WHERE u.id = al.user_id)) as should_show;

SELECT 
    'New Registrations' as card,
    (SELECT COUNT(*) FROM activity_logs al 
     WHERE al.action IN ('register', 'user_registered')
     AND EXISTS (SELECT 1 FROM users u WHERE u.id = al.user_id)) as should_show;

-- ============================================
-- 6. CHECK FOR DATA ISSUES
-- ============================================

-- Issue 1: Logs with deleted users (SHOULD BE 0 after cleanup)
SELECT 
    'Logs with DELETED users (should be 0)' as issue,
    COUNT(*) as problem_count
FROM activity_logs al
LEFT JOIN users u ON u.id = al.user_id
WHERE al.user_id IS NOT NULL AND u.id IS NULL;

-- Issue 2: Donation logs without actual donations
SELECT 
    'Donation logs WITHOUT actual donations' as issue,
    COUNT(*) as problem_count
FROM activity_logs al
LEFT JOIN donations d ON d.id = JSON_EXTRACT(al.details, '$.donation_id')
WHERE al.action = 'donation_created'
  AND JSON_EXTRACT(al.details, '$.donation_id') IS NOT NULL
  AND d.id IS NULL;

-- Issue 3: Campaign logs without actual campaigns
SELECT 
    'Campaign logs WITHOUT actual campaigns' as issue,
    COUNT(*) as problem_count
FROM activity_logs al
LEFT JOIN campaigns c ON c.id = JSON_EXTRACT(al.details, '$.campaign_id')
WHERE al.action = 'campaign_created'
  AND JSON_EXTRACT(al.details, '$.campaign_id') IS NOT NULL
  AND c.id IS NULL;

-- ============================================
-- 7. DETAILED BREAKDOWN BY ACTION TYPE
-- ============================================

SELECT 
    'ACTION TYPE DISTRIBUTION' as report_title;

SELECT 
    al.action,
    COUNT(*) as count,
    COUNT(DISTINCT al.user_id) as unique_users,
    MIN(al.created_at) as first_occurrence,
    MAX(al.created_at) as last_occurrence
FROM activity_logs al
WHERE EXISTS (SELECT 1 FROM users u WHERE u.id = al.user_id)
GROUP BY al.action
ORDER BY count DESC;

-- ============================================
-- 8. RECENT ACTIVITY (LAST 24 HOURS)
-- ============================================

SELECT 
    'RECENT ACTIVITY (LAST 24 HOURS)' as report_title;

SELECT 
    al.action,
    u.name as user_name,
    u.role as user_role,
    al.created_at
FROM activity_logs al
JOIN users u ON u.id = al.user_id
WHERE al.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
ORDER BY al.created_at DESC
LIMIT 50;

-- ============================================
-- 9. ACTIVITY BY DATE (LAST 7 DAYS)
-- ============================================

SELECT 
    'DAILY ACTIVITY (LAST 7 DAYS)' as report_title;

SELECT 
    DATE(al.created_at) as date,
    COUNT(*) as total_actions,
    COUNT(DISTINCT al.user_id) as unique_users,
    SUM(CASE WHEN al.action IN ('donation_created', 'donation_confirmed') THEN 1 ELSE 0 END) as donations,
    SUM(CASE WHEN al.action = 'campaign_created' THEN 1 ELSE 0 END) as campaigns,
    SUM(CASE WHEN al.action IN ('register', 'user_registered') THEN 1 ELSE 0 END) as registrations
FROM activity_logs al
WHERE al.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
  AND EXISTS (SELECT 1 FROM users u WHERE u.id = al.user_id)
GROUP BY DATE(al.created_at)
ORDER BY date DESC;

-- ============================================
-- 10. VERIFY EACH STATISTIC CARD
-- ============================================

SELECT '========================================' as divider;
SELECT 'FINAL VERIFICATION - WHAT ADMIN SHOULD SEE' as report_title;
SELECT '========================================' as divider;

-- Card 1: Total Activities
SELECT 
    '1. Total Activities Card' as card_name,
    COUNT(*) as current_value,
    'Should match dashboard' as note
FROM activity_logs al
WHERE EXISTS (SELECT 1 FROM users u WHERE u.id = al.user_id);

-- Card 2: Donations
SELECT 
    '2. Donations Card' as card_name,
    COUNT(*) as current_value,
    'Should match dashboard' as note
FROM activity_logs al
WHERE al.action IN ('donation_created', 'donation_confirmed', 'donation_rejected')
  AND EXISTS (SELECT 1 FROM users u WHERE u.id = al.user_id);

-- Card 3: Campaigns Created
SELECT 
    '3. Campaigns Created Card' as card_name,
    COUNT(*) as current_value,
    'Should match dashboard' as note
FROM activity_logs al
WHERE al.action = 'campaign_created'
  AND EXISTS (SELECT 1 FROM users u WHERE u.id = al.user_id);

-- Card 4: New Registrations
SELECT 
    '4. New Registrations Card' as card_name,
    COUNT(*) as current_value,
    'Should match dashboard' as note
FROM activity_logs al
WHERE al.action IN ('register', 'user_registered')
  AND EXISTS (SELECT 1 FROM users u WHERE u.id = al.user_id);

-- ============================================
-- SUMMARY
-- ============================================

SELECT '========================================' as divider;
SELECT 'If numbers above match Admin Dashboard, data is ACCURATE' as summary;
SELECT 'If numbers differ, run clean-activity-logs.sql to fix' as action;
SELECT '========================================' as divider;
