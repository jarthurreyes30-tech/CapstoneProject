# Charity Dashboard - Recent Updates Fix

## Issue Identified
The **Recent Updates** section in the charity dashboard was trying to display `likes_count` and `comments_count` for charity posts, but these columns didn't exist in the `charity_posts` table.

## Changes Made

### 1. Database Migration
**File:** `capstone_backend/database/migrations/2025_10_28_000001_add_counts_to_charity_posts.php`
- Added `likes_count` column (default: 0)
- Added `comments_count` column (default: 0)
- Migration executed successfully ✅

### 2. CharityPost Model Update
**File:** `capstone_backend/app/Models/CharityPost.php`
- Added `likes_count` and `comments_count` to `$fillable` array
- Added proper casting for these fields as integers

### 3. CharityPostController Enhancement
**File:** `capstone_backend/app/Http/Controllers/CharityPostController.php`
- Modified `getCharityPosts()` method to:
  - Include `charity` relationship with posts
  - Return posts as array instead of pagination (for dashboard consistency)
  - Return data in `{'data': posts}` format

## How It Works

### Frontend Flow (CharityDashboard.tsx)
```typescript
// Line 351-381: loadRecentPosts function
1. Fetches from: GET /api/charities/{charityId}/posts
2. Extracts posts from response: data.data || data
3. Takes the most recent post (posts[0])
4. Maps to recentUpdate state with:
   - snippet: content.substring(0, 150)
   - likes: likes_count
   - comments: comments_count
   - date: formatted time ago
```

### Backend Response Format
```json
{
  "data": [
    {
      "id": 1,
      "charity_id": 1,
      "title": "Update Title",
      "content": "Update content...",
      "image_path": "path/to/image.jpg",
      "status": "published",
      "published_at": "2024-10-28T12:00:00.000000Z",
      "likes_count": 15,
      "comments_count": 8,
      "created_at": "2024-10-28T12:00:00.000000Z",
      "updated_at": "2024-10-28T12:00:00.000000Z",
      "charity": {
        "id": 1,
        "name": "Charity Name",
        ...
      }
    }
  ]
}
```

### Display in Dashboard (Lines 895-963)
```tsx
<Card className="border-2 border-purple-200...">
  <CardHeader>
    <CardTitle>Recent Updates</CardTitle>
    <CardDescription>Your latest post activity</CardDescription>
  </CardHeader>
  <CardContent>
    {recentUpdate ? (
      <div className="p-5 rounded-xl...">
        <h4>{recentUpdate.title}</h4>
        <p>{recentUpdate.snippet}</p>
        <div className="flex items-center gap-4">
          <div>❤️ {recentUpdate.likes}</div>
          <div>💬 {recentUpdate.comments}</div>
          <div>📅 {recentUpdate.date}</div>
        </div>
      </div>
    ) : (
      <div>No updates yet</div>
    )}
  </CardContent>
</Card>
```

## Testing Checklist

### 1. Create a Charity Post (if none exist)
```bash
# Option A: Via API
POST /api/charity/posts
{
  "title": "Test Update",
  "content": "This is a test charity post to verify the Recent Updates section.",
  "status": "published"
}

# Option B: Via Frontend
# Navigate to: /charity/updates
# Click "Create Update" button
# Fill in title and content
# Set status to "published"
```

### 2. Verify Dashboard Display
1. Navigate to `/charity/dashboard`
2. Scroll to "Recent Updates" card
3. Verify the following displays correctly:
   - ✅ Post snippet (first 150 characters)
   - ✅ Likes count (shows 0 if no likes)
   - ✅ Comments count (shows 0 if no comments)
   - ✅ Formatted date ("X minutes ago", "X hours ago", etc.)

### 3. Test with Interactions
1. Add a like to the post (if like functionality exists)
2. Add a comment to the post (if comment functionality exists)
3. Refresh dashboard
4. Verify counts increment properly

### 4. Test Edge Cases
- ✅ No posts exist → Shows "No updates yet" message
- ✅ Post with long content → Shows truncated snippet with "..."
- ✅ Multiple posts → Shows only the most recent one

## API Endpoints Reference

### Get Charity Posts
```
GET /api/charities/{charityId}/posts
Authorization: Bearer {token}

Response:
{
  "data": [CharityPost]
}
```

### Create Post (Charity Admin Only)
```
POST /api/charity/posts
Authorization: Bearer {token}

Body:
{
  "title": "string",
  "content": "string",
  "status": "published|draft",
  "image": "file (optional)"
}
```

## Notes

### Difference Between CharityPost and Update
- **CharityPost** (`charity_posts` table): General posts/announcements by charity
- **Update** (`updates` table): Campaign-specific updates with threading support

The dashboard's "Recent Updates" section displays **CharityPost** data, which is fetched from `/charities/{charityId}/posts`.

### Future Enhancements
Consider implementing:
1. Like/Unlike functionality for charity posts
2. Comment system for charity posts
3. Pagination for posts list
4. Post categories/tags
5. Image uploads for posts
6. Rich text editor for content

## Files Modified

1. ✅ `capstone_backend/database/migrations/2025_10_28_000001_add_counts_to_charity_posts.php`
2. ✅ `capstone_backend/app/Models/CharityPost.php`
3. ✅ `capstone_backend/app/Http/Controllers/CharityPostController.php`

## Status
✅ **Complete** - Migration applied successfully, backend updated, frontend should now properly display charity posts with likes and comments count.
