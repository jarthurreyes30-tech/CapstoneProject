# Charity Dashboard Fix - Action Plan

## ✅ What Was Fixed

### Backend
1. **Database Schema** - Added missing columns to `charity_posts` table:
   - `likes_count` (integer, default 0)
   - `comments_count` (integer, default 0)

2. **Authorization Logic** - Fixed endpoint access rules:
   - Charity admins can view their own posts (even if not verified)
   - Public viewers only see published posts from verified charities

3. **Query Logic** - Enhanced post retrieval:
   - Charity admins see ALL posts (published + draft)
   - Public viewers only see published posts

4. **Logging** - Added comprehensive debugging logs

### Frontend
1. **Error Handling** - Added detailed console logging
2. **Data Validation** - Added array checks before processing
3. **Error States** - Properly handle and display errors

## 🚀 Next Steps to Test

### Step 1: Verify Backend Setup

Run the diagnostic script:
```powershell
.\scripts\check_charity_posts.ps1
```

This will check:
- ✓ Database connection
- ✓ Migrations applied
- ✓ Table exists
- ✓ Post count

### Step 2: Add Test Data

**Choose ONE option:**

#### Option A: Run Seeder (Easiest)
```bash
cd capstone_backend
php artisan db:seed --class=CharityPostSeeder
```

#### Option B: SQL Script
1. Open phpMyAdmin or your database tool
2. Find your charity ID:
   ```sql
   SELECT id, name FROM charities WHERE owner_id = YOUR_USER_ID;
   ```
3. Run the script at `scripts/add_test_charity_post.sql`
   (Edit line 13 to set your charity ID first!)

#### Option C: Manual Insert
```sql
-- Replace 1 with your actual charity_id
INSERT INTO charity_posts (charity_id, title, content, status, published_at, likes_count, comments_count, created_at, updated_at)
VALUES (1, 'Welcome!', 'Thank you for your support!', 'published', NOW(), 10, 5, NOW(), NOW());
```

### Step 3: Test the Dashboard

1. **Start your backend server** (if not running):
   ```bash
   cd capstone_backend
   php artisan serve
   ```

2. **Start your frontend server** (if not running):
   ```bash
   cd capstone_frontend
   npm run dev
   ```

3. **Login as a charity admin**

4. **Navigate to dashboard**: `/charity/dashboard`

5. **Open browser console** (Press F12)

6. **Look for these logs**:
   ```
   Fetching posts for charity: X
   Posts response status: 200
   Posts data received: {data: [...]}
   Latest post: {...}
   ```

### Step 4: Verify Display

Check the "Recent Updates" card:

✅ **If posts exist:**
- Post snippet shows (first 150 characters)
- Likes count displays (❤️ 10)
- Comments count displays (💬 5)
- Date shows ("2 days ago")
- Card is clickable

✅ **If no posts:**
- Shows "No updates yet" message
- Shows "Share Your Impact" section
- Shows "Create Update" button

## 🔍 Troubleshooting

### Issue: "No posts found" in console

**Quick Fix:**
```sql
-- Check if posts exist
SELECT COUNT(*) FROM charity_posts;

-- If 0, add a test post (use Step 2 above)
```

### Issue: "Posts response status: 404"

**Quick Fix:**
```sql
-- Check if your charity exists and is verified
SELECT id, name, verification_status FROM charities;

-- If verification_status is NULL or 'pending', update it:
UPDATE charities SET verification_status = 'approved' WHERE id = YOUR_ID;
```

### Issue: "Posts response status: 500"

**Quick Fix:**
```bash
# Check if migration ran
cd capstone_backend
php artisan migrate:status

# If migration is missing, run it:
php artisan migrate

# Check error logs:
tail -f storage/logs/laravel.log
```

### Issue: Posts exist but don't show

**Quick Fix:**
```sql
-- Check post status and published_at
SELECT id, title, status, published_at FROM charity_posts;

-- If all are drafts or published_at is NULL, fix them:
UPDATE charity_posts 
SET status = 'published', published_at = NOW() 
WHERE charity_id = YOUR_CHARITY_ID;
```

## 📊 Testing API Directly

Test the endpoint in browser console (after login):

```javascript
// Replace 1 with your charity ID
fetch('http://localhost:8000/api/charities/1/posts', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Accept': 'application/json'
  }
})
.then(r => r.json())
.then(data => {
  console.log('API Response:', data);
  console.log('Post count:', data.data?.length || 0);
  if (data.data?.[0]) {
    console.log('First post:', data.data[0]);
  }
});
```

Expected response:
```json
{
  "data": [
    {
      "id": 1,
      "charity_id": 1,
      "title": "Welcome!",
      "content": "Thank you for your support!",
      "status": "published",
      "likes_count": 10,
      "comments_count": 5,
      "published_at": "2024-10-28T12:00:00Z",
      "charity": {
        "id": 1,
        "name": "Your Charity Name"
      }
    }
  ]
}
```

## 📝 Files to Review

### Backend
- ✅ `app/Http/Controllers/CharityPostController.php` (lines 26-71)
- ✅ `app/Models/CharityPost.php` (lines 12-27)
- ✅ `database/migrations/2025_10_28_000001_add_counts_to_charity_posts.php`

### Frontend
- ✅ `src/pages/charity/CharityDashboard.tsx` (lines 351-395)

### Tools
- ✅ `scripts/add_test_charity_post.sql`
- ✅ `scripts/check_charity_posts.ps1`
- ✅ `database/seeders/CharityPostSeeder.php`

## 🎯 Expected Behavior

### For Charity Admins (viewing own dashboard):
- ✅ Can see ALL posts (published + draft)
- ✅ No verification status required
- ✅ Posts ordered by created_at (newest first)
- ✅ Shows post details with counts

### For Public/Donors (viewing charity profile):
- ✅ Can only see PUBLISHED posts
- ✅ Charity MUST be verified
- ✅ Posts ordered by published_at (newest first)
- ✅ Shows post details with counts

### Stats Section:
- ✅ "New Interactions" card shows sum of likes + comments from recent 5 posts
- ✅ Updates automatically when posts have interactions

## 📋 Quick Checklist

Before reporting issues, verify:

- [ ] Migration ran successfully (`php artisan migrate:status`)
- [ ] Test data exists (`SELECT COUNT(*) FROM charity_posts`)
- [ ] Posts are published (`SELECT status FROM charity_posts`)
- [ ] Charity exists in database
- [ ] User is logged in as charity admin
- [ ] Token is valid (check localStorage)
- [ ] Backend server is running (port 8000)
- [ ] Frontend server is running (port 5173)
- [ ] Browser console shows no CORS errors
- [ ] API URL in .env is correct

## 🔗 Useful Commands

```bash
# Check database
php artisan tinker
>>> DB::table('charity_posts')->count()
>>> DB::table('charity_posts')->get()

# Clear cache
php artisan cache:clear
php artisan config:clear

# Check routes
php artisan route:list | grep posts

# Watch logs
tail -f storage/logs/laravel.log
```

## 📞 Still Having Issues?

1. **Run diagnostic script**: `.\scripts\check_charity_posts.ps1`
2. **Check browser console** for error messages
3. **Check Laravel logs**: `storage/logs/laravel.log`
4. **Verify API response** using the browser console test above
5. **Check database** to confirm posts exist

## ✨ Success Criteria

You'll know it's working when:
- ✓ Dashboard loads without errors
- ✓ Recent Updates card shows your latest post
- ✓ Likes and comments counts are visible
- ✓ Clicking the card navigates to updates page
- ✓ Console shows "Found X posts for charity Y"
- ✓ No 404 or 500 errors in console

---

**Status:** All fixes applied ✅
**Next Action:** Add test data and verify dashboard display
**Estimated Time:** 5-10 minutes
