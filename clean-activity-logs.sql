-- Clean Activity Logs - Remove Seeded/Fake Data
-- This script removes invalid activity logs that don't match actual database records

-- ============================================
-- BACKUP FIRST (IMPORTANT!)
-- ============================================
-- CREATE TABLE activity_logs_backup AS SELECT * FROM activity_logs;

-- ============================================
-- 1. CLEAN INVALID DONATION LOGS
-- ============================================
-- Remove donation logs where donation doesn't exist in donations table
DELETE al FROM activity_logs al
WHERE al.action IN ('donation_created', 'donation_confirmed', 'donation_rejected')
  AND JSON_EXTRACT(al.details, '$.donation_id') IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM donations d 
    WHERE d.id = JSON_EXTRACT(al.details, '$.donation_id')
  );

-- Remove donation logs where user doesn't exist
DELETE al FROM activity_logs al
WHERE al.action IN ('donation_created', 'donation_confirmed', 'donation_rejected')
  AND al.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM users u 
    WHERE u.id = al.user_id
  );

-- ============================================
-- 2. CLEAN INVALID CAMPAIGN LOGS
-- ============================================
-- Remove campaign logs where campaign doesn't exist
DELETE al FROM activity_logs al
WHERE al.action IN ('campaign_created', 'campaign_updated', 'campaign_deleted', 'campaign_activated', 'campaign_paused', 'campaign_completed')
  AND JSON_EXTRACT(al.details, '$.campaign_id') IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM campaigns c 
    WHERE c.id = JSON_EXTRACT(al.details, '$.campaign_id')
  );

-- Remove campaign logs where user is not a charity_admin
DELETE al FROM activity_logs al
WHERE al.action IN ('campaign_created', 'campaign_updated', 'campaign_deleted', 'campaign_activated', 'campaign_paused')
  AND al.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM users u 
    WHERE u.id = al.user_id AND u.role = 'charity_admin'
  );

-- ============================================
-- 3. CLEAN INVALID CHARITY LOGS
-- ============================================
-- Remove charity logs where charity doesn't exist
DELETE al FROM activity_logs al
WHERE al.action IN ('charity_created', 'charity_updated', 'charity_approved', 'charity_rejected', 'charity_suspended', 'charity_activated')
  AND JSON_EXTRACT(al.details, '$.charity_id') IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM charities ch 
    WHERE ch.id = JSON_EXTRACT(al.details, '$.charity_id')
  );

-- Remove charity approval logs where admin doesn't exist
DELETE al FROM activity_logs al
WHERE al.action IN ('charity_approved', 'charity_rejected', 'charity_suspended', 'charity_activated')
  AND al.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM users u 
    WHERE u.id = al.user_id AND u.role = 'admin'
  );

-- ============================================
-- 4. CLEAN INVALID USER LOGS
-- ============================================
-- Remove logs where user doesn't exist
DELETE al FROM activity_logs al
WHERE al.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM users u 
    WHERE u.id = al.user_id
  );

-- Remove user action logs where target user doesn't exist
DELETE al FROM activity_logs al
WHERE al.action IN ('user_suspended', 'user_activated')
  AND JSON_EXTRACT(al.details, '$.suspended_user_id') IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM users u 
    WHERE u.id = JSON_EXTRACT(al.details, '$.suspended_user_id')
  );

-- ============================================
-- 5. CLEAN INVALID COMMENT LOGS
-- ============================================
-- Remove comment logs where comment doesn't exist (if you have comments table)
-- DELETE al FROM activity_logs al
-- WHERE al.action IN ('comment_created', 'comment_updated', 'comment_deleted')
--   AND JSON_EXTRACT(al.details, '$.comment_id') IS NOT NULL
--   AND NOT EXISTS (
--     SELECT 1 FROM campaign_comments cc 
--     WHERE cc.id = JSON_EXTRACT(al.details, '$.comment_id')
--   );

-- ============================================
-- 6. CLEAN INVALID POST/UPDATE LOGS
-- ============================================
-- Remove post logs where post doesn't exist (if you have posts table)
-- DELETE al FROM activity_logs al
-- WHERE al.action IN ('post_created', 'post_updated', 'post_deleted', 'update_created', 'update_updated', 'update_deleted')
--   AND JSON_EXTRACT(al.details, '$.post_id') IS NOT NULL
--   AND NOT EXISTS (
--     SELECT 1 FROM charity_posts cp 
--     WHERE cp.id = JSON_EXTRACT(al.details, '$.post_id')
--   );

-- ============================================
-- 7. CLEAN INVALID FUND USAGE LOGS
-- ============================================
-- Remove fund usage logs where record doesn't exist
DELETE al FROM activity_logs al
WHERE al.action IN ('fund_usage_created', 'fund_usage_updated', 'fund_usage_deleted')
  AND JSON_EXTRACT(al.details, '$.fund_usage_id') IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM fund_usages fu 
    WHERE fu.id = JSON_EXTRACT(al.details, '$.fund_usage_id')
  );

-- ============================================
-- 8. CLEAN INVALID REFUND LOGS
-- ============================================
-- Remove refund logs where refund doesn't exist (if you have refunds table)
-- DELETE al FROM activity_logs al
-- WHERE al.action IN ('refund_requested', 'refund_approved', 'refund_rejected')
--   AND JSON_EXTRACT(al.details, '$.refund_id') IS NOT NULL
--   AND NOT EXISTS (
--     SELECT 1 FROM refunds r 
--     WHERE r.id = JSON_EXTRACT(al.details, '$.refund_id')
--   );

-- ============================================
-- 9. CLEAN INVALID DOCUMENT LOGS
-- ============================================
-- Remove document logs where document doesn't exist
DELETE al FROM activity_logs al
WHERE al.action IN ('document_uploaded', 'document_approved', 'document_rejected')
  AND JSON_EXTRACT(al.details, '$.document_id') IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM charity_documents cd 
    WHERE cd.id = JSON_EXTRACT(al.details, '$.document_id')
  );

-- ============================================
-- 10. CLEAN INVALID FOLLOW LOGS
-- ============================================
-- Remove follow logs where charity doesn't exist
DELETE al FROM activity_logs al
WHERE al.action IN ('charity_followed', 'charity_unfollowed')
  AND JSON_EXTRACT(al.details, '$.charity_id') IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM charities ch 
    WHERE ch.id = JSON_EXTRACT(al.details, '$.charity_id')
  );

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Show remaining activity log counts by action
SELECT 
    action,
    COUNT(*) as count,
    MIN(created_at) as first_log,
    MAX(created_at) as last_log
FROM activity_logs
GROUP BY action
ORDER BY count DESC;

-- Show logs with missing users
SELECT 
    al.id,
    al.action,
    al.user_id,
    al.created_at
FROM activity_logs al
LEFT JOIN users u ON u.id = al.user_id
WHERE al.user_id IS NOT NULL AND u.id IS NULL
LIMIT 10;

-- Show donation logs with missing donations
SELECT 
    al.id,
    al.action,
    JSON_EXTRACT(al.details, '$.donation_id') as donation_id,
    al.created_at
FROM activity_logs al
LEFT JOIN donations d ON d.id = JSON_EXTRACT(al.details, '$.donation_id')
WHERE al.action IN ('donation_created', 'donation_confirmed', 'donation_rejected')
  AND JSON_EXTRACT(al.details, '$.donation_id') IS NOT NULL
  AND d.id IS NULL
LIMIT 10;

-- Show campaign logs with missing campaigns
SELECT 
    al.id,
    al.action,
    JSON_EXTRACT(al.details, '$.campaign_id') as campaign_id,
    al.created_at
FROM activity_logs al
LEFT JOIN campaigns c ON c.id = JSON_EXTRACT(al.details, '$.campaign_id')
WHERE al.action LIKE 'campaign_%'
  AND JSON_EXTRACT(al.details, '$.campaign_id') IS NOT NULL
  AND c.id IS NULL
LIMIT 10;

-- Total logs before and after cleanup
SELECT 
    'Before Cleanup' as status,
    COUNT(*) as total_logs
FROM activity_logs_backup
UNION ALL
SELECT 
    'After Cleanup' as status,
    COUNT(*) as total_logs
FROM activity_logs;

-- ============================================
-- SUMMARY
-- ============================================
-- This script removes:
-- 1. Donation logs without actual donations
-- 2. Campaign logs without actual campaigns
-- 3. Charity logs without actual charities
-- 4. Logs with non-existent users
-- 5. Admin action logs by non-admin users
-- 6. Charity action logs by non-charity users
-- 7. All other orphaned logs

-- After running, only REAL activity logs remain that match actual database records.
