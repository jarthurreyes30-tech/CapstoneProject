-- Check Approved Refunds and Their Donation Status
-- This query shows all approved refunds and checks if donations are properly marked as refunded

SELECT 
    rr.id AS refund_id,
    rr.status AS refund_status,
    rr.created_at AS refund_requested_at,
    rr.reviewed_at AS refund_approved_at,
    rr.refund_amount,
    
    d.id AS donation_id,
    d.status AS donation_status,
    d.is_refunded AS donation_is_refunded,
    d.refunded_at AS donation_refunded_at,
    d.amount AS donation_amount,
    
    u.name AS donor_name,
    u.email AS donor_email,
    
    c.title AS campaign_title,
    c.id AS campaign_id,
    c.total_donations_received AS campaign_total,
    
    ch.name AS charity_name,
    ch.id AS charity_id,
    ch.total_donations_received AS charity_total,
    
    -- Check if there's a problem
    CASE 
        WHEN rr.status = 'approved' AND d.status != 'refunded' THEN '❌ PROBLEM: Status not refunded'
        WHEN rr.status = 'approved' AND d.is_refunded = 0 THEN '❌ PROBLEM: Flag not set'
        WHEN rr.status = 'approved' AND d.refunded_at IS NULL THEN '⚠️ WARNING: No refund timestamp'
        WHEN rr.status = 'approved' AND d.status = 'refunded' AND d.is_refunded = 1 THEN '✅ CORRECT: Properly refunded'
        ELSE 'ℹ️ Other status'
    END AS status_check
    
FROM refund_requests rr
INNER JOIN donations d ON rr.donation_id = d.id
INNER JOIN users u ON rr.user_id = u.id
LEFT JOIN campaigns c ON d.campaign_id = c.id
LEFT JOIN charities ch ON d.charity_id = ch.id

WHERE rr.status = 'approved'

ORDER BY rr.reviewed_at DESC;


-- Summary: Count of problems
SELECT 
    COUNT(*) AS total_approved_refunds,
    SUM(CASE WHEN d.status != 'refunded' THEN 1 ELSE 0 END) AS wrong_status_count,
    SUM(CASE WHEN d.is_refunded = 0 THEN 1 ELSE 0 END) AS flag_not_set_count,
    SUM(CASE WHEN d.refunded_at IS NULL THEN 1 ELSE 0 END) AS missing_timestamp_count,
    SUM(CASE WHEN d.status = 'refunded' AND d.is_refunded = 1 THEN 1 ELSE 0 END) AS correctly_refunded_count
FROM refund_requests rr
INNER JOIN donations d ON rr.donation_id = d.id
WHERE rr.status = 'approved';


-- Check specific donor (if you know the name, e.g., "aeron")
SELECT 
    u.name AS donor_name,
    u.email AS donor_email,
    rr.id AS refund_id,
    rr.status AS refund_status,
    d.id AS donation_id,
    d.status AS donation_status,
    d.is_refunded,
    d.amount,
    c.title AS campaign_title,
    c.total_donations_received AS campaign_total
FROM refund_requests rr
INNER JOIN donations d ON rr.donation_id = d.id
INNER JOIN users u ON rr.user_id = u.id
LEFT JOIN campaigns c ON d.campaign_id = c.id
WHERE rr.status = 'approved'
  AND (u.name LIKE '%aeron%' OR u.email LIKE '%aeron%')
ORDER BY rr.created_at DESC;


-- Check IFL campaign specifically
SELECT 
    c.id AS campaign_id,
    c.title AS campaign_title,
    c.total_donations_received AS current_total,
    c.donors_count,
    
    -- Calculate what total SHOULD be (excluding refunded)
    (SELECT COALESCE(SUM(d2.amount), 0) 
     FROM donations d2 
     WHERE d2.campaign_id = c.id 
       AND d2.status = 'completed' 
       AND d2.is_refunded = 0) AS calculated_total_should_be,
    
    -- Show the difference
    c.total_donations_received - (SELECT COALESCE(SUM(d2.amount), 0) 
                                   FROM donations d2 
                                   WHERE d2.campaign_id = c.id 
                                     AND d2.status = 'completed' 
                                     AND d2.is_refunded = 0) AS difference,
    
    -- Count refunded donations in this campaign
    (SELECT COUNT(*) 
     FROM donations d3 
     INNER JOIN refund_requests rr ON d3.id = rr.donation_id
     WHERE d3.campaign_id = c.id 
       AND rr.status = 'approved') AS refunded_count
       
FROM campaigns c
WHERE c.title LIKE '%IFL%'
   OR c.title LIKE '%ifl%'
ORDER BY c.created_at DESC;
