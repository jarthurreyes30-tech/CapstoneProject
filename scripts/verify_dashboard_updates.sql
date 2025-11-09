-- ============================================
-- Verify Dashboard Updates Fix
-- ============================================
-- Run this to check if your charity has updates
-- ============================================

-- Step 1: Find your charity ID
SELECT id, name, verification_status FROM charities LIMIT 5;

-- Step 2: Check if you have updates (replace 1 with your charity_id)
SET @charity_id = 1; -- CHANGE THIS

SELECT 
    id,
    LEFT(content, 50) as content_preview,
    likes_count,
    comments_count,
    created_at
FROM updates
WHERE charity_id = @charity_id
ORDER BY created_at DESC
LIMIT 5;

-- Step 3: If NO updates found, insert a test one
-- Uncomment and run this:
/*
INSERT INTO updates (charity_id, content, likes_count, comments_count, created_at, updated_at)
VALUES (
    @charity_id,
    'Thank you to all our amazing supporters! Your generosity is making a real difference in our community. This month, we have been able to expand our programs and reach even more families in need.',
    25,
    12,
    NOW(),
    NOW()
);
*/

-- Step 4: Verify the insert worked
SELECT 
    COUNT(*) as total_updates,
    SUM(likes_count) as total_likes,
    SUM(comments_count) as total_comments
FROM updates
WHERE charity_id = @charity_id;

-- Step 5: Check what the API will return (most recent update)
SELECT 
    id,
    content,
    likes_count,
    comments_count,
    is_pinned,
    created_at,
    TIMESTAMPDIFF(HOUR, created_at, NOW()) as hours_ago
FROM updates
WHERE charity_id = @charity_id
ORDER BY is_pinned DESC, created_at DESC
LIMIT 1;
