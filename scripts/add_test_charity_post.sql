-- ============================================
-- Add Test Charity Posts
-- ============================================
-- Instructions:
-- 1. Find your charity_id: SELECT id, name FROM charities WHERE owner_id = YOUR_USER_ID;
-- 2. Replace @charity_id below with your actual charity ID
-- 3. Run this script
-- ============================================

-- Set your charity ID here
SET @charity_id = 1; -- CHANGE THIS TO YOUR CHARITY ID

-- Insert 3 sample posts
INSERT INTO charity_posts (charity_id, title, content, status, published_at, likes_count, comments_count, created_at, updated_at)
VALUES 
-- Post 1: Recent published post
(@charity_id, 
 'Thank You to Our Amazing Donors!', 
 'We are incredibly grateful for your continued support! This month, with your generous donations, we have been able to expand our programs and reach even more families in need. Your contributions are making a real difference in our community, providing essential resources and hope to those who need it most. Together, we are building a brighter future for everyone.',
 'published',
 NOW() - INTERVAL 2 DAY,
 25,
 12,
 NOW() - INTERVAL 2 DAY,
 NOW() - INTERVAL 2 DAY),

-- Post 2: Older published post
(@charity_id,
 'Successful Fundraising Event',
 'Last week we hosted our annual charity gala, and it was a tremendous success! Thanks to all our supporters who attended and contributed, we raised significant funds that will go directly toward our mission. The evening was filled with inspiring stories, wonderful connections, and a shared commitment to making positive change. We cannot thank you enough for being part of this journey with us.',
 'published',
 NOW() - INTERVAL 7 DAY,
 42,
 18,
 NOW() - INTERVAL 7 DAY,
 NOW() - INTERVAL 7 DAY),

-- Post 3: Draft post (will only show to charity admin)
(@charity_id,
 'Upcoming Initiative - Preview',
 'We are excited to announce a new program launching next month! Stay tuned for more details about how we will be expanding our services to better serve our community. This initiative represents months of planning and will bring incredible benefits to our beneficiaries. More information coming soon!',
 'draft',
 NULL,
 0,
 0,
 NOW() - INTERVAL 1 DAY,
 NOW() - INTERVAL 1 DAY);

-- Verify the posts were created
SELECT 
    p.id,
    p.title,
    p.status,
    p.published_at,
    p.likes_count,
    p.comments_count,
    c.name as charity_name
FROM charity_posts p
JOIN charities c ON c.id = p.charity_id
WHERE p.charity_id = @charity_id
ORDER BY p.created_at DESC;

-- Output summary
SELECT 
    COUNT(*) as total_posts,
    SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published_posts,
    SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft_posts,
    SUM(likes_count) as total_likes,
    SUM(comments_count) as total_comments
FROM charity_posts
WHERE charity_id = @charity_id;
