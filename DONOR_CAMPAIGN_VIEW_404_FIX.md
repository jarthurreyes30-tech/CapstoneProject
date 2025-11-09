# Donor Campaign View 404 Error - Fixed

## Problem
When donors clicked on campaign cards in the Browse Campaigns page, they received a 404 error:
- Error: `404 Error: User attempted to access non-existent route: /donor/campaigns/1`
- Campaign images were not displaying properly

## Root Causes

### 1. Incorrect Navigation Route
Campaign cards were navigating to `/donor/campaigns/:id`, but this route didn't exist in the application routing configuration.

**Available Routes:**
- ✅ `/campaigns/:id` - Public campaign detail page (exists)
- ✅ `/donor/campaigns/browse` - Browse campaigns page (exists)
- ✅ `/donor/campaigns/:campaignId/donate` - Donation page (exists)
- ❌ `/donor/campaigns/:id` - Campaign detail page (DOES NOT EXIST)

### 2. Missing Image URL Builder
Campaign images were using raw paths from the database instead of properly constructed storage URLs.

## Solutions Applied

### 1. Fixed Campaign Navigation Routes

#### BrowseCampaignsFiltered.tsx (Line 393)
**Before:**
```tsx
onClick={() => navigate(`/donor/campaigns/${campaign.id}`)}
```

**After:**
```tsx
onClick={() => navigate(`/campaigns/${campaign.id}`)}
```

#### Profile.tsx (Line 312)
**Before:**
```tsx
<Button onClick={() => navigate('/donor/campaigns')}>
```

**After:**
```tsx
<Button onClick={() => navigate('/donor/campaigns/browse')}>
```

#### DonorProfilePage.tsx (Line 397)
**Before:**
```tsx
onClick={() => navigate('/donor/campaigns')}
```

**After:**
```tsx
onClick={() => navigate('/donor/campaigns/browse')}
```

### 2. Fixed Campaign Image Display

#### BrowseCampaignsFiltered.tsx
**Added Import:**
```tsx
import { buildApiUrl, buildStorageUrl, getAuthToken } from '@/lib/api';
```

**Before:**
```tsx
<img
  src={campaign.cover_image_path}
  alt={campaign.title}
  className="w-full h-full object-cover"
/>
```

**After:**
```tsx
<img
  src={buildStorageUrl(campaign.cover_image_path) || ''}
  alt={campaign.title}
  className="w-full h-full object-cover"
  onError={(e) => {
    e.currentTarget.src = '/placeholder.svg';
  }}
/>
```

## How It Works Now

### Campaign Viewing Flow
1. Donor browses campaigns at `/donor/campaigns/browse`
2. Clicks on a campaign card
3. Navigates to `/campaigns/:id` (public campaign detail page)
4. Can view full campaign details, updates, and donate
5. Campaign images load properly from storage with fallback to placeholder

### Image URL Construction
The `buildStorageUrl()` function:
- Takes database path (e.g., `campaign_covers/abc123.jpg`)
- Constructs full URL (e.g., `http://127.0.0.1:8000/storage/campaign_covers/abc123.jpg`)
- Returns null if path is empty
- Includes error handling with placeholder fallback

## Files Modified

### Frontend Files
1. `capstone_frontend/src/pages/donor/BrowseCampaignsFiltered.tsx`
   - Fixed navigation route (line 393)
   - Added buildStorageUrl import (line 11)
   - Fixed image display with proper URL and error handling (lines 398-403)

2. `capstone_frontend/src/pages/donor/Profile.tsx`
   - Fixed "Explore Campaigns" button route (line 312)

3. `capstone_frontend/src/pages/donor/DonorProfilePage.tsx`
   - Fixed "Explore Campaigns" button route (line 397)

## Testing Checklist

✅ Campaign cards are clickable
✅ Clicking a campaign navigates to the correct detail page
✅ Campaign images display properly
✅ Image fallback works if image fails to load
✅ "Explore Campaigns" buttons navigate to browse page
✅ No 404 errors when viewing campaigns

## Related Routes

### Public Routes
- `/campaigns/:id` - Campaign detail page (used by donors and public)

### Donor Routes
- `/donor/campaigns/browse` - Browse all campaigns with filters
- `/donor/campaigns/:campaignId/donate` - Make a donation to a campaign

### Charity Routes
- `/charity/campaigns/:id` - Charity's own campaign management page

## Notes
- The public campaign detail page (`/campaigns/:id`) is accessible to both authenticated donors and public users
- Donors can view campaign details and then navigate to the donation page
- Campaign images are stored in Laravel's storage directory and accessed via the storage URL helper
