-- Fix Document Verification Status
-- This script ensures all documents have proper verification_status values

-- Step 1: Check current status distribution
SELECT 
    'Current Status Distribution' as info,
    verification_status,
    COUNT(*) as count
FROM charity_documents
GROUP BY verification_status;

-- Step 2: Set default 'pending' status for any NULL values
UPDATE charity_documents 
SET verification_status = 'pending' 
WHERE verification_status IS NULL OR verification_status = '';

-- Step 3: Verify all documents now have a status
SELECT 
    'After Fix - Status Distribution' as info,
    verification_status,
    COUNT(*) as count
FROM charity_documents
GROUP BY verification_status;

-- Step 4: Show document counts by charity
SELECT 
    c.id as charity_id,
    c.name as charity_name,
    COUNT(cd.id) as total_documents,
    SUM(CASE WHEN cd.verification_status = 'approved' THEN 1 ELSE 0 END) as approved,
    SUM(CASE WHEN cd.verification_status = 'pending' THEN 1 ELSE 0 END) as pending,
    SUM(CASE WHEN cd.verification_status = 'rejected' THEN 1 ELSE 0 END) as rejected
FROM charities c
LEFT JOIN charity_documents cd ON c.id = cd.charity_id
GROUP BY c.id, c.name
ORDER BY c.id;

-- Step 5: Check for duplicate documents (same type, same charity, both active)
SELECT 
    'Potential Duplicates' as info,
    charity_id,
    doc_type,
    COUNT(*) as count
FROM charity_documents
WHERE verification_status IN ('pending', 'approved')
GROUP BY charity_id, doc_type
HAVING count > 1;

-- Step 6: Show documents with their full details
SELECT 
    cd.id,
    cd.charity_id,
    c.name as charity_name,
    cd.doc_type,
    cd.verification_status,
    cd.rejection_reason,
    cd.verified_at,
    cd.created_at,
    cd.updated_at
FROM charity_documents cd
JOIN charities c ON cd.charity_id = c.id
ORDER BY cd.charity_id, cd.created_at DESC;
