# Storage URL Fix - OpaqueResponseBlocking Error

## Problem
Images (charity logos, QR codes, etc.) were failing to load with errors:
```
GET http://127.0.0.1:8000/api/storage/charity_logos/xxx.jpg NS_BINDING_ABORTED
A resource is blocked by OpaqueResponseBlocking
```

## Root Cause
The URLs were incorrectly constructed as:
```
http://127.0.0.1:8000/api/storage/charity_logos/xxx.jpg
```

But Laravel serves storage files at:
```
http://127.0.0.1:8000/storage/charity_logos/xxx.jpg
```

The `/api/` prefix should NOT be included in storage URLs.

## Why This Happened
Many components were using:
```typescript
`${import.meta.env.VITE_API_URL}/storage/${path}`
```

Since `VITE_API_URL = http://127.0.0.1:8000/api`, this creates the wrong URL.

## The Fix
Use the `buildStorageUrl()` helper function from `@/lib/api`:

### Before (Wrong):
```typescript
src={`${import.meta.env.VITE_API_URL}/storage/${charity.logo_path}`}
```

### After (Correct):
```typescript
import { buildStorageUrl } from "@/lib/api";

src={buildStorageUrl(charity.logo_path) || ''}
```

## Files Fixed

### ✅ Fixed Files:
1. **`components/donor/CharityCard.tsx`**
   - Fixed charity logo URL construction
   
2. **`components/newsfeed/ThreadSection.tsx`**
   - Fixed charity logo in thread avatars
   - Fixed thread media URLs

3. **`pages/charity/CharitySettings.tsx`**
   - Fixed QR code image URLs

### ⚠️ Files That Still Need Fixing:

The following files still use the incorrect pattern and should be updated:

1. **`pages/charity/CharityPosts.tsx`** (line 339)
   ```typescript
   src={`${import.meta.env.VITE_API_URL}/storage/${post.image_path}`}
   ```

2. **`pages/charity/OrganizationProfileManagement.tsx`** (lines 54-55)
   ```typescript
   logoPreview: user?.charity?.logo ? `${API_URL}/storage/${user.charity.logo}` : null,
   bannerPreview: user?.charity?.cover_image ? `${API_URL}/storage/${user.charity.cover_image}` : null,
   ```

3. **`pages/CharityDetail.tsx`** (line 399)
   ```typescript
   src={`${API_URL}/storage/${ch.details.qr_image}`}
   ```

4. **`components/charity/DonationsModal.tsx`** (line 165)
   ```typescript
   `${import.meta.env.VITE_API_URL}/storage/${donation.proofImage}`
   ```

5. **`pages/campaigns/CampaignPage.tsx`** (line 798)
   ```typescript
   href={`http://127.0.0.1:8000/storage/${item.attachment_path}`}
   ```

6. **`pages/charity/CampaignUpdatesTab.tsx`** (line 224)
   ```typescript
   src={`http://127.0.0.1:8000/storage/${update.image_path}`}
   ```

## How buildStorageUrl Works

The helper function is already implemented in `src/lib/api.ts`:

```typescript
export function buildStorageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // If path already starts with 'storage/', don't add it again
  if (cleanPath.startsWith('storage/')) {
    return `${getBaseUrl()}/${cleanPath}`;
  }
  
  return `${getStorageUrl()}/${cleanPath}`;
}
```

Where:
- `getBaseUrl()` returns `http://127.0.0.1:8000` (without `/api`)
- `getStorageUrl()` returns `http://127.0.0.1:8000/storage`

## Testing the Fix

1. **Clear browser cache**: Ctrl+Shift+Delete
2. **Reload the page**: Ctrl+F5
3. **Check Network tab**: Images should now load from `http://127.0.0.1:8000/storage/...`
4. **No more errors**: No OpaqueResponseBlocking errors in console

## Expected Results

### Before Fix:
- ❌ Images fail to load
- ❌ Console shows NS_BINDING_ABORTED errors
- ❌ URLs contain `/api/storage/`

### After Fix:
- ✅ Images load successfully
- ✅ No console errors
- ✅ URLs correctly use `/storage/` (without `/api`)

## Additional Notes

### Laravel Storage Setup
Ensure Laravel storage is properly linked:
```bash
cd capstone_backend
php artisan storage:link
```

This creates a symbolic link from `public/storage` to `storage/app/public`.

### CORS Configuration
The `config/cors.php` already includes `'storage/*'` in the paths:
```php
'paths' => ['api/*', 'sanctum/csrf-cookie', 'storage/*'],
```

### File Upload
When uploading files, ensure they're stored in `storage/app/public/` directory:
```php
$path = $request->file('logo')->store('charity_logos', 'public');
// This stores in: storage/app/public/charity_logos/xxx.jpg
// Accessible at: http://127.0.0.1:8000/storage/charity_logos/xxx.jpg
```

## Quick Fix Template

For any file that needs fixing:

1. **Add import**:
   ```typescript
   import { buildStorageUrl } from "@/lib/api";
   ```

2. **Replace URL construction**:
   ```typescript
   // Before
   src={`${import.meta.env.VITE_API_URL}/storage/${path}`}
   
   // After
   src={buildStorageUrl(path) || ''}
   ```

## Summary

- ✅ **Fixed**: CharityCard, ThreadSection, CharitySettings
- ⚠️ **Needs fixing**: 6 more files (see list above)
- 📝 **Pattern**: Always use `buildStorageUrl()` for storage files
- 🚫 **Never use**: `VITE_API_URL` for storage URLs
