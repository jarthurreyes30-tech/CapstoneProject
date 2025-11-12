# Donor Charity Profile Page - Design Update Implementation

## Status: IN PROGRESS - File Corruption During Update

## Objective
Update the donor's view of charity profiles (`/pages/donor/CharityProfile.tsx`) to match the professional design of the charity's own profile page (`/pages/charity/CharityProfilePage.tsx`).

## Current Issue
The file replacement attempt corrupted the file structure around lines 600-612. The file needs to be restored or recreated.

## Solution Approach

### Option 1: Restore and Fix (Recommended)
1. **Revert the broken changes** to `/pages/donor/CharityProfile.tsx`
2. **Apply targeted updates** instead of full file replacement:
   - Import charity profile components at the top
   - Update only the render section (return statement)
   - Keep all existing handler functions
   - Add helper functions for formatting

### Option 2: Complete Rewrite
Create a new file from scratch using the charity profile structure as template.

## Required Changes

### 1. Imports to Add
```tsx
import { ProfileHeader } from "@/components/charity/ProfileHeader";
import { ProfileStats } from "@/components/charity/ProfileStats";
import { ProfileTabs } from "@/components/charity/ProfileTabs";
import { ProfileSidebar } from "@/components/charity/ProfileSidebar";
import { UpdatesSidebar } from "@/components/charity/UpdatesSidebar";
import { CampaignsSidebar } from "@/components/charity/CampaignsSidebar";
```

### 2. Key Components to Use

#### ProfileHeader
- Shows cover image and logo
- Displays charity name and verification badge
- Includes gradient background

#### ProfileStats  
- Shows total raised, followers, campaigns, updates
- Clickable stat cards
- Formatted currency

#### ProfileTabs
- About, Updates, Campaigns tabs
- Handles all tab content rendering
- Reuses existing data

#### Sidebars
- ProfileSidebar (for About tab)
- UpdatesSidebar (for Updates tab)
- CampaignsSidebar (for Campaigns tab)

### 3. Donor-Specific Modifications

**Keep These Features:**
- Follow/Unfollow button
- Save button
- Report button
- Back to Charities navigation

**Remove These:**
- ActionBar (donors can't edit)
- Image upload/edit functionality
- Profile/cover click handlers

### 4. Layout Structure

```tsx
<div className="min-h-screen bg-background pb-20 lg:pb-8">
  {/* Donor Action Bar - Above Header */}
  <div className="container mx-auto px-4 lg:px-8 pt-4">
    <div className="flex items-center gap-4 mb-6">
      <Button onClick={goBack}>← Back</Button>
      <div className="ml-auto flex gap-2">
        <Button Follow/Unfollow />
        <SaveButton />
        <Button Report />
      </div>
    </div>
  </div>

  {/* Profile Header */}
  <ProfileHeader charity={charity} logoUrl={...} coverUrl={...} />

  {/* Main Content */}
  <div className="container mx-auto px-4 lg:px-8 pt-6">
    <ProfileStats stats={statsData} />
    
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8">
        <ProfileTabs ... />
      </div>
      <div className="lg:col-span-4 lg:pt-14">
        {/* Conditional Sidebar based on activeTab */}
      </div>
    </div>
  </div>

  {/* Report Dialog */}
  <ReportDialog ... />
</div>
```

### 5. Helper Functions Needed

```tsx
const logoUrl = charity?.logo_path ? buildStorageUrl(charity.logo_path) : null;
const coverUrl = charity?.cover_image ? buildStorageUrl(charity.cover_image) : null;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const getTimeAgo = (dateString: string) => {
  // Calculate time difference
  // Return "X days ago", "X weeks ago", etc.
};
```

### 6. Stats Data Structure

```tsx
const statsData = {
  total_received: stats?.total_received || 0,
  followers_count: stats?.followers_count || 0,
  total_campaigns: stats?.total_campaigns || campaigns.length,
  total_updates: stats?.total_updates || updates.length,
};
```

### 7. Campaign Transformation

```tsx
const transformedCampaigns = campaigns.map(c => ({
  ...c,
  goal_amount: c.goal_amount || c.target_amount || 0,
  current_amount: c.current_amount || c.raised_amount || 0,
  end_date: c.end_date || c.deadline_at,
  banner_image: c.banner_image || c.cover_image_path || c.image_path,
}));
```

## Benefits of Update

### User Experience
- ✅ Consistent design across donor and charity views
- ✅ Professional, polished appearance
- ✅ Better information hierarchy
- ✅ Improved readability

### Code Quality
- ✅ Reuses existing components
- ✅ Reduces code duplication
- ✅ Easier to maintain
- ✅ Type-safe with TypeScript

## Next Steps

1. **IMMEDIATE**: Restore the corrupted file
   - Either revert changes or use git to restore
   - Or manually fix the broken JSX around lines 600-612

2. **THEN**: Apply the changes incrementally
   - Add imports
   - Add helper functions
   - Replace render section carefully
   - Test each change

3. **FINALLY**: Test thoroughly
   - Verify all tabs work
   - Check follow/save/report buttons
   - Ensure navigation works
   - Test on different screen sizes

## File Recovery Notes

The corruption is in the Button component around line 603-612. The mangled code needs to be replaced with proper button closing tags and structure.

---

**Created:** November 12, 2025
**Status:** Awaiting file restoration before continuing
