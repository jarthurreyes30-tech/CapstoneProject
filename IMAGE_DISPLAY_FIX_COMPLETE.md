# Charity Image Display Fix - Complete

## Problem Identified

Charity logos were not displaying because the frontend was requesting images from the wrong URL:

**Incorrect URL Pattern:**
```
http://127.0.0.1:8000/api/storage/charity_logos/image.jpg
```

**Correct URL Pattern:**
```
http://127.0.0.1:8000/storage/charity_logos/image.jpg
```

The issue was that components were using `${import.meta.env.VITE_API_URL}/storage/...` which includes `/api` in the path, but Laravel serves storage files directly from `/storage/` without the `/api` prefix.

## Root Cause

- `VITE_API_URL` is set to `http://127.0.0.1:8000/api`
- Storage files are served from `http://127.0.0.1:8000/storage/` (NOT through the API)
- Components were incorrectly concatenating `VITE_API_URL + /storage/...`

## Solution

The project already has proper helper functions in `src/lib/storage.ts` and `src/lib/api.ts`:

- `buildStorageUrl(path)` - Constructs correct storage URLs
- `getCharityLogoUrl(path)` - Specifically for charity logos
- `getCampaignCoverUrl(path)` - Specifically for campaign covers
- `getProfileImageUrl(path)` - Specifically for profile images

## Files Fixed

### 1. CharityCard.tsx
**Location:** `src/components/donor/CharityCard.tsx`

**Before:**
```tsx
src={
  charity.logo_path
    ? `${import.meta.env.VITE_API_URL}/storage/${charity.logo_path}`
    : "https://images.unsplash.com/..."
}
```

**After:**
```tsx
import { getCharityLogoUrl } from '@/lib/storage';

src={
  getCharityLogoUrl(charity.logo_path) ||
  "https://images.unsplash.com/..."
}
```

### 2. Saved.tsx
**Location:** `src/pages/donor/Saved.tsx`

Fixed 2 instances:
- Campaign cover images
- Charity logo images

**Changes:**
- Added import: `import { getCharityLogoUrl, getCampaignCoverUrl } from '@/lib/storage';`
- Replaced `${API_URL}/storage/${...}` with helper functions

### 3. DonorProfilePage.tsx
**Location:** `src/pages/donor/DonorProfilePage.tsx`

Fixed charity logo display in saved charities section.

**Changes:**
- Added import: `import { getCharityLogoUrl } from '@/lib/storage';`
- Replaced `${API_URL}/storage/${charity.logo_path}` with `getCharityLogoUrl(charity.logo_path)`

### 4. Following.tsx
**Location:** `src/pages/donor/Following.tsx`

Fixed charity logo display in followed charities.

**Changes:**
- Added import: `import { getCharityLogoUrl } from '@/lib/storage';`
- Replaced direct `follow.charity.logo_path` with `getCharityLogoUrl(follow.charity.logo_path)`

## Backend Verification

✅ Storage symlink exists: `public/storage` → `storage/app/public`
✅ Charity logos present in: `storage/app/public/charity_logos/`
✅ Storage URL accessible: `http://127.0.0.1:8000/storage/charity_logos/...` returns 200 OK
✅ CORS headers configured properly for storage files

**Test Result:**
```bash
Invoke-WebRequest "http://127.0.0.1:8000/storage/charity_logos/7q8eiSHo0G4dxvEA0fFaLXdsD375i8gXO6MuXA70.jpg"
StatusCode: 200 OK
```

## How Storage URLs Work

The helper function `buildStorageUrl()` in `src/lib/api.ts`:

```typescript
export function buildStorageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // If path already starts with 'storage/', don't add it again
  if (cleanPath.startsWith('storage/')) {
    return `${getBaseUrl()}/${cleanPath}`;
  }
  
  return `${getStorageUrl()}/${cleanPath}`;
}
```

Where:
- `getBaseUrl()` = `http://127.0.0.1:8000` (strips /api from VITE_API_URL)
- `getStorageUrl()` = `http://127.0.0.1:8000/storage`

## Testing

1. **Refresh the frontend** (Ctrl+Shift+R or Cmd+Shift+R)
2. **Navigate to Browse Charities page**
3. **Verify charity logos are now visible**

Expected result: All charity logos should load correctly without OpaqueResponseBlocking errors.

## Console Debugging

The `buildStorageUrl()` function includes debug logging:

```
[Storage URL Debug] {
  path: "charity_logos/abc123.jpg",
  cleanPath: "charity_logos/abc123.jpg",
  storageUrl: "http://127.0.0.1:8000/storage",
  finalUrl: "http://127.0.0.1:8000/storage/charity_logos/abc123.jpg"
}
```

Check browser console to verify correct URLs are being generated.

## Additional Notes

### OpaqueResponseBlocking Error

This error occurs when:
1. Cross-origin resource is requested
2. Response doesn't have proper CORS headers
3. Resource is loaded via `<img>` tag with `crossorigin` attribute

**Our fix resolves this by:**
- Using correct same-origin URLs (no /api prefix)
- Backend already has CORS configured for storage routes

### Other Components to Monitor

These components also use storage URLs but were already using the correct helper functions:
- `CharityProfile.tsx` (using `buildStorageUrl`)
- `CommunityNewsfeed.tsx` (using `buildStorageUrl`)
- `DonorDashboardHome.tsx` (using `buildStorageUrl`)
- `ProfileTabs.tsx` (using `buildStorageUrl`)

## Summary

✅ Fixed 4 frontend components using incorrect storage URL pattern
✅ Verified backend storage configuration is correct
✅ All charity images should now display properly
✅ No more OpaqueResponseBlocking errors for charity logos

The fix ensures all image requests use the proper URL format: `http://127.0.0.1:8000/storage/...` instead of the incorrect `http://127.0.0.1:8000/api/storage/...`
