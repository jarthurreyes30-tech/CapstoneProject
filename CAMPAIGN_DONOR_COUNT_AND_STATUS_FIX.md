# Campaign Donor Count and Status Logic Fix

## Issues Fixed

### 1. Donor Count Showing 0
**Problem**: Campaign cards were showing 0 donors even when donations existed.

**Root Cause**: The `donors_count` field was only calculated in the `show()` method of the CampaignController, but not included in the `index()` method that lists all campaigns.

**Solution**: 
- Added `donors_count` to the Campaign model's `$appends` array
- Created a `getDonorsCountAttribute()` accessor method that automatically calculates unique donors
- Now `donors_count` is automatically included in all API responses

**Files Modified**:
- `capstone_backend/app/Models/Campaign.php`

### 2. Campaign Status Logic (Active/Completed/Pending)
**Problem**: Campaigns that ended or reached 100% goal were still showing as "Active" instead of "Completed".

**Root Cause**: The frontend was only mapping backend status values without considering:
- Whether the campaign end date has passed
- Whether the goal amount has been reached

**Solution**:
- Updated `mapBackendStatus()` function to accept additional parameters: `endDate`, `currentAmount`, `targetAmount`
- Added logic to automatically determine if a campaign should be "completed" based on:
  - End date has passed, OR
  - Goal amount has been reached (100%+)
- Added client-side filtering to properly show campaigns in the correct filter tabs
- Updated filter dropdown to show: All, Active, Completed, Pending (draft)

**Files Modified**:
- `capstone_frontend/src/pages/charity/CampaignsPageModern.tsx`
- `capstone_frontend/src/components/charity/CampaignCard.tsx`
- `capstone_frontend/src/components/charity/ProfileTabs.tsx`

## Filter Behavior

### Active
Shows campaigns that are:
- Status is "published" or "active" in backend
- End date has NOT passed
- Goal has NOT been reached

### Completed
Shows campaigns that are:
- End date HAS passed, OR
- Goal HAS been reached (100%+)
- Regardless of backend status

### Pending
Shows campaigns that are:
- Status is "draft" in backend
- Not yet published

## Technical Details

### Backend Changes
```php
// Campaign.php
protected $appends = ['current_amount', 'donors_count'];

public function getDonorsCountAttribute()
{
    return $this->donations()
        ->where('status', 'completed')
        ->distinct('donor_id')
        ->count('donor_id');
}
```

### Frontend Changes

**In CampaignsPageModern.tsx:**
```typescript
// Automatic status determination when loading campaigns
const mapBackendStatus = (status, endDate, currentAmount, targetAmount) => {
  if (status === "draft") return "draft";
  
  const now = new Date();
  const campaignEndDate = endDate ? new Date(endDate) : null;
  const hasEnded = campaignEndDate && campaignEndDate < now;
  const goalReached = targetAmount && currentAmount && currentAmount >= targetAmount;
  
  if (hasEnded || goalReached) {
    return "completed";
  }
  
  // ... rest of mapping
}
```

**In CampaignCard.tsx:**
```typescript
// Determine actual status in the card component itself
const determineActualStatus = (): Campaign["status"] => {
  if (campaign.status === "draft") return "draft";
  
  const hasEnded = daysLeft === 0;
  const goalReached = progressPercentage >= 100;
  
  if (hasEnded || goalReached) {
    return "completed";
  }
  
  return campaign.status;
};

const actualStatus = determineActualStatus();
// Use actualStatus for badge display
```

**In ProfileTabs.tsx:**
```typescript
// Updated mapCampaignStatus to accept full campaign object
const mapCampaignStatus = (campaign: any): DashboardCampaign["status"] => {
  const s = (campaign.status || '').toLowerCase();
  
  if (s === 'draft') return 'draft';
  
  const now = new Date();
  const campaignEndDate = campaign.deadline || campaign.end_date ? new Date(campaign.deadline || campaign.end_date) : null;
  const hasEnded = campaignEndDate && campaignEndDate < now;
  const goalReached = campaign.goal && campaign.amountRaised && campaign.amountRaised >= campaign.goal;
  
  if (hasEnded || goalReached) {
    return "completed";
  }
  
  // ... rest of mapping
};

// Updated filter logic to use computed status
const filteredCampaigns = useMemo(() => {
  let list = [...campaigns];
  
  if (campaignFilter !== 'all') {
    list = list.filter(c => {
      const computedStatus = mapCampaignStatus(c);
      if (campaignFilter === 'pending') {
        return computedStatus === 'draft';
      }
      return computedStatus === campaignFilter;
    });
  }
  // ... sorting logic
}, [campaigns, campaignFilter, campaignSort]);
```

## Testing Steps

1. **Test Donor Count**:
   - Navigate to `/charity/campaigns`
   - Check that campaigns with donations show the correct donor count
   - Verify that multiple donations from the same donor count as 1

2. **Test Active Filter**:
   - Click "Active" filter
   - Verify only campaigns that haven't ended and haven't reached goal are shown

3. **Test Completed Filter**:
   - Click "Completed" filter
   - Verify campaigns that have ended OR reached 100% goal are shown
   - Check the example campaign "Teach to Reach" (100% goal, ended) appears here

4. **Test Pending Filter**:
   - Click "Pending" filter
   - Verify only draft campaigns are shown

## Additional Fixes

### 3. Total Raised Calculation Issue
**Problem**: Total Raised was displaying incorrectly (e.g., ₱010000.0015000.00) due to string concatenation instead of numeric addition.

**Root Cause**: The `current_amount` field from the backend was being treated as a string in some calculations, causing JavaScript to concatenate strings instead of adding numbers.

**Solution**:
- Wrapped all `current_amount` and `target_amount` values with `Number()` to ensure numeric operations
- Fixed calculations in `CharityProfilePage.tsx` for:
  - `totalRaisedCampaigns` 
  - `transformedCampaigns` mapping
  - `avgCompletion` calculation
  - `topCampaignRaw` mapping

**Files Modified**:
- `capstone_frontend/src/pages/charity/CharityProfilePage.tsx`

## Notes

- The backend status field is not automatically updated; the frontend determines the display status
- This allows for more flexible status logic without database updates
- Campaigns can be manually marked as "closed" or "archived" in the backend if needed
- All numeric fields from the backend are now properly converted to numbers to prevent string concatenation issues
