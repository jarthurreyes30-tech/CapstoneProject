-- Check Individual Donations vs Activity Logs
-- This verifies that each donation has its own activity log entry

-- ============================================
-- 1. CHECK AARON'S DONATIONS
-- ============================================

SELECT '=== AARON DAVE LIM SAGAN - INDIVIDUAL DONATIONS ===' as section;

-- Get all donations by Aaron
SELECT 
    d.id as donation_id,
    d.amount,
    d.campaign_id,
    d.status,
    DATE_FORMAT(d.created_at, '%Y-%m-%d %H:%i:%s') as donation_date
FROM donations d
JOIN users u ON u.id = d.donor_id
WHERE u.name LIKE '%Aaron%Dave%Lim%Sagan%'
ORDER BY d.created_at;

-- Count Aaron's donations
SELECT 
    'Total Donations by Aaron' as metric,
    COUNT(*) as count,
    SUM(d.amount) as total_amount
FROM donations d
JOIN users u ON u.id = d.donor_id
WHERE u.name LIKE '%Aaron%Dave%Lim%Sagan%';

-- Get activity logs for Aaron's donations
SELECT 
    al.id as log_id,
    JSON_EXTRACT(al.details, '$.donation_id') as donation_id,
    JSON_EXTRACT(al.details, '$.amount') as logged_amount,
    DATE_FORMAT(al.created_at, '%Y-%m-%d %H:%i:%s') as log_date
FROM activity_logs al
JOIN users u ON u.id = al.user_id
WHERE u.name LIKE '%Aaron%Dave%Lim%Sagan%'
  AND al.action = 'donation_created'
ORDER BY al.created_at;

-- Count activity logs for Aaron
SELECT 
    'Total Activity Logs by Aaron' as metric,
    COUNT(*) as count,
    SUM(CAST(JSON_EXTRACT(al.details, '$.amount') AS DECIMAL(10,2))) as total_logged
FROM activity_logs al
JOIN users u ON u.id = al.user_id
WHERE u.name LIKE '%Aaron%Dave%Lim%Sagan%'
  AND al.action = 'donation_created';

-- ============================================
-- 2. CHECK AERON'S DONATIONS
-- ============================================

SELECT '=== AERON MENDOZA BAGUNUDO - INDIVIDUAL DONATIONS ===' as section;

SELECT 
    d.id as donation_id,
    d.amount,
    d.campaign_id,
    d.status,
    DATE_FORMAT(d.created_at, '%Y-%m-%d %H:%i:%s') as donation_date
FROM donations d
JOIN users u ON u.id = d.donor_id
WHERE u.name LIKE '%Aeron%Mendoza%'
ORDER BY d.created_at;

SELECT 
    'Total Donations by Aeron' as metric,
    COUNT(*) as count,
    SUM(d.amount) as total_amount
FROM donations d
JOIN users u ON u.id = d.donor_id
WHERE u.name LIKE '%Aeron%Mendoza%';

-- ============================================
-- 3. CHECK REGIE'S DONATIONS
-- ============================================

SELECT '=== REGIE SHAINE RECTO ASI - INDIVIDUAL DONATIONS ===' as section;

SELECT 
    d.id as donation_id,
    d.amount,
    d.campaign_id,
    d.status,
    DATE_FORMAT(d.created_at, '%Y-%m-%d %H:%i:%s') as donation_date
FROM donations d
JOIN users u ON u.id = d.donor_id
WHERE u.name LIKE '%Regie%Shaine%'
ORDER BY d.created_at;

SELECT 
    'Total Donations by Regie' as metric,
    COUNT(*) as count,
    SUM(d.amount) as total_amount
FROM donations d
JOIN users u ON u.id = d.donor_id
WHERE u.name LIKE '%Regie%Shaine%';

-- ============================================
-- 4. CHECK ALL DONATIONS ON 2025-10-28
-- ============================================

SELECT '=== ALL DONATIONS ON 2025-10-28 ===' as section;

SELECT 
    u.name as donor_name,
    d.id as donation_id,
    d.amount,
    d.campaign_id,
    d.status,
    DATE_FORMAT(d.created_at, '%Y-%m-%d %H:%i:%s') as donation_date
FROM donations d
JOIN users u ON u.id = d.donor_id
WHERE DATE(d.created_at) = '2025-10-28'
ORDER BY d.created_at;

-- Count by donor on that date
SELECT 
    u.name as donor_name,
    COUNT(*) as donation_count,
    SUM(d.amount) as total_amount,
    GROUP_CONCAT(d.amount ORDER BY d.created_at SEPARATOR ' + ') as individual_amounts
FROM donations d
JOIN users u ON u.id = d.donor_id
WHERE DATE(d.created_at) = '2025-10-28'
GROUP BY u.id, u.name
ORDER BY total_amount DESC;

-- ============================================
-- 5. CHECK ACTIVITY LOGS FOR THOSE DONATIONS
-- ============================================

SELECT '=== ACTIVITY LOGS FOR 2025-10-28 DONATIONS ===' as section;

SELECT 
    u.name as donor_name,
    al.id as log_id,
    al.action,
    JSON_EXTRACT(al.details, '$.donation_id') as donation_id,
    JSON_EXTRACT(al.details, '$.amount') as amount,
    DATE_FORMAT(al.created_at, '%Y-%m-%d %H:%i:%s') as log_date
FROM activity_logs al
JOIN users u ON u.id = al.user_id
WHERE al.action = 'donation_created'
  AND DATE(al.created_at) = '2025-10-28'
ORDER BY al.created_at;

-- Count activity logs by donor
SELECT 
    u.name as donor_name,
    COUNT(*) as log_count,
    SUM(CAST(JSON_EXTRACT(al.details, '$.amount') AS DECIMAL(10,2))) as total_logged
FROM activity_logs al
JOIN users u ON u.id = al.user_id
WHERE al.action = 'donation_created'
  AND DATE(al.created_at) = '2025-10-28'
GROUP BY u.id, u.name
ORDER BY total_logged DESC;

-- ============================================
-- 6. IDENTIFY THE PROBLEM
-- ============================================

SELECT '=== PROBLEM IDENTIFICATION ===' as section;

-- Check if donations have corresponding activity logs
SELECT 
    'Donations WITHOUT activity logs' as issue,
    COUNT(*) as count
FROM donations d
LEFT JOIN activity_logs al ON 
    al.action = 'donation_created' 
    AND JSON_EXTRACT(al.details, '$.donation_id') = d.id
WHERE al.id IS NULL
  AND DATE(d.created_at) = '2025-10-28';

-- Check if activity logs match donation amounts
SELECT 
    d.id as donation_id,
    d.amount as actual_amount,
    CAST(JSON_EXTRACT(al.details, '$.amount') AS DECIMAL(10,2)) as logged_amount,
    CASE 
        WHEN d.amount != CAST(JSON_EXTRACT(al.details, '$.amount') AS DECIMAL(10,2)) THEN 'MISMATCH'
        ELSE 'OK'
    END as status
FROM donations d
LEFT JOIN activity_logs al ON 
    al.action = 'donation_created' 
    AND JSON_EXTRACT(al.details, '$.donation_id') = d.id
WHERE DATE(d.created_at) = '2025-10-28'
ORDER BY d.id;

-- ============================================
-- 7. DETAILED BREAKDOWN
-- ============================================

SELECT '=== DETAILED BREAKDOWN (Donations vs Logs) ===' as section;

SELECT 
    u.name as donor_name,
    'Donations in DB' as type,
    COUNT(d.id) as count,
    SUM(d.amount) as total,
    GROUP_CONCAT(CONCAT('₱', FORMAT(d.amount, 2)) ORDER BY d.created_at SEPARATOR ', ') as breakdown
FROM donations d
JOIN users u ON u.id = d.donor_id
WHERE DATE(d.created_at) = '2025-10-28'
GROUP BY u.id, u.name

UNION ALL

SELECT 
    u.name as donor_name,
    'Activity Logs' as type,
    COUNT(al.id) as count,
    SUM(CAST(JSON_EXTRACT(al.details, '$.amount') AS DECIMAL(10,2))) as total,
    GROUP_CONCAT(CONCAT('₱', FORMAT(CAST(JSON_EXTRACT(al.details, '$.amount') AS DECIMAL(10,2)), 2)) ORDER BY al.created_at SEPARATOR ', ') as breakdown
FROM activity_logs al
JOIN users u ON u.id = al.user_id
WHERE al.action = 'donation_created'
  AND DATE(al.created_at) = '2025-10-28'
GROUP BY u.id, u.name

ORDER BY donor_name, type DESC;

-- ============================================
-- 8. SHOW WHAT ADMIN SHOULD SEE
-- ============================================

SELECT '=== WHAT ADMIN SHOULD SEE (Individual Donations) ===' as section;

SELECT 
    CONCAT(u.name, ' (', u.role, ')') as user_info,
    CONCAT('Made a donation of ₱', FORMAT(d.amount, 2), 
           CASE WHEN d.campaign_id IS NOT NULL 
                THEN CONCAT(' (Campaign ID: ', d.campaign_id, ')')
                ELSE ''
           END) as description,
    DATE_FORMAT(d.created_at, '%Y-%m-%d, %h:%i:%s %p') as date_time,
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

SELECT 
    'Total Donations in Database (2025-10-28)' as metric,
    COUNT(*) as value
FROM donations
WHERE DATE(created_at) = '2025-10-28';

SELECT 
    'Total Activity Logs (donation_created, 2025-10-28)' as metric,
    COUNT(*) as value
FROM activity_logs
WHERE action = 'donation_created'
  AND DATE(created_at) = '2025-10-28';

SELECT 
    'EXPECTED BEHAVIOR' as note,
    'Each donation should have its own activity log entry' as description;

SELECT 
    'CURRENT ISSUE' as note,
    'Activity logs may be showing totaled amounts instead of individual donations' as description;
