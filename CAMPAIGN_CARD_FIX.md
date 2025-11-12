# Campaign Card Fix - Donor View

## Problem
Campaign cards on the donor charity profile page showed admin controls (3-dot menu) that allowed donors to see Edit, Delete, Pause/Activate options. The design was also different from the clean campaign cards on the browse campaigns page.

## Before (Admin Controls Visible to Donors)
```
┌─────────────────────────────────┐
│ ⋮ <- 3-dot menu                 │
│ [Campaign Banner]               │
│ Campaign Title                  │
│ ₱0 / ₱0 • 0 donors              │
│ [View Campaign] [View Donations]│
└─────────────────────────────────┘

3-dot menu showed:
- Edit Campaign
- Pause/Activate Campaign  
- Share Campaign
- View Donations
- Delete Campaign
```

## After (Clean Donor View)
```
┌─────────────────────────────────┐
│ [Campaign Banner]               │
│ Campaign Title                  │
│ Description text                │
│ ₱2,250 / ₱300,000               │
│ Progress bar (1% funded)        │
│ 0 Donors • Ended                │
│ [💛 Donate Now] [👁 View Details]│
│                          [🔖]   │
└─────────────────────────────────┘
```

## What Was Fixed

### 1. ProfileTabs.tsx - Line 1395
**Before:**
```tsx
<CampaignCard
  key={c.id}
  campaign={mapped}
  viewMode="admin"  // ❌ Hardcoded to admin
  onEdit={(id) => navigate(`/charity/campaigns/${id}/edit`)}
  ...
/>
```

**After:**
```tsx
<CampaignCard
  key={c.id}
  campaign={mapped}
  viewMode={viewMode}  // ✅ Uses ProfileTabs viewMode prop
  {...(viewMode === 'admin' && {
    onEdit: (id) => navigate(`/charity/campaigns/${id}/edit`)
  })}
  ...
/>
```

### 2. Empty State - Lines 1365-1378
**Before:**
```tsx
<p className="text-muted-foreground text-sm mb-4">
  Create your first campaign to start raising funds
</p>
<Button onClick={() => setIsCreateOpen(true)}>
  <Target className="h-4 w-4 mr-2" />
  Create Your First Campaign
</Button>
```

**After:**
```tsx
<p className="text-muted-foreground text-sm mb-4">
  {isAdminView() 
    ? "Create your first campaign to start raising funds" 
    : "This charity hasn't created any campaigns yet"}
</p>
{isAdminView() && (
  <Button onClick={() => setIsCreateOpen(true)}>
    <Target className="h-4 w-4 mr-2" />
    Create Your First Campaign
  </Button>
)}
```

## CampaignCard Component (Already Implemented)
The `CampaignCard.tsx` component already had proper viewMode handling:

```tsx
// Line 259-310: Admin dropdown menu
{viewMode === "admin" && (
  <DropdownMenu>
    <DropdownMenuTrigger>
      <MoreVertical className="h-4 w-4" />
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem onClick={() => onEdit?.(campaign.id)}>
        Edit Campaign
      </DropdownMenuItem>
      // ... other admin options
    </DropdownMenuContent>
  </DropdownMenu>
)}

// Line 385: Different buttons for admin vs donor
{viewMode === "admin" ? (
  // Admin buttons: View Campaign, View Donations
) : (
  // Donor buttons: Donate Now, View Details, Bookmark
)}
```

## Testing Checklist

### As Donor viewing charity profile campaigns:
- [x] No 3-dot menu on campaign cards
- [x] Shows "Donate Now" button
- [x] Shows "View Details" button  
- [x] Shows bookmark button
- [x] No "Edit Campaign" option
- [x] No "Delete Campaign" option
- [x] No "Pause/Activate" option
- [x] No "View Donations" button
- [x] Empty state shows "This charity hasn't created any campaigns yet"
- [x] No "Create Your First Campaign" button for donors

### As Charity viewing their own profile campaigns:
- [x] 3-dot menu visible
- [x] Can edit campaigns
- [x] Can delete campaigns
- [x] Can pause/activate campaigns
- [x] Shows "View Campaign" button
- [x] Shows "View Donations" button
- [x] Empty state shows "Create your first campaign to start raising funds"
- [x] Shows "Create Your First Campaign" button

## Impact

**Before:** Donors could see 3-dot menu and admin-only campaign options
**After:** Donors see clean campaign cards matching the browse campaigns page design

**Security:** ✅ Donors cannot access campaign management features
**UX:** ✅ Consistent campaign card design across donor pages
**Consistency:** ✅ Same card design as browse campaigns page

## Files Modified

1. **ProfileTabs.tsx**
   - Changed `viewMode="admin"` to `viewMode={viewMode}` on CampaignCard
   - Made `onEdit` handler conditional (only passed when `viewMode === 'admin'`)
   - Hidden "Create Your First Campaign" button for donors
   - Updated empty state message for donors

## Related Components

- **CampaignCard.tsx** - Already handles viewMode prop correctly
- **CharityProfile.tsx** (donor) - Passes `viewMode="donor"` to ProfileTabs
- **BrowseCampaigns.tsx** - Uses same CampaignCard with `viewMode="donor"`

---

**Status:** ✅ Complete
**Date:** November 12, 2024 4:47 AM UTC+8
**Result:** Campaign cards now show clean donor-friendly design without admin controls
