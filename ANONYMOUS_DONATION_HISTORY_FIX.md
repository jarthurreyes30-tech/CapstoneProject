# Anonymous Donation History Implementation

## Overview
Implemented a feature where anonymous donations appear in the donor's personal donation history while remaining anonymous to charities and the public.

## Problem
Previously, anonymous donations set `donor_id` to `null`, which prevented donors from seeing their own anonymous donations in their history.

## Solution
Changed the system to **always preserve `donor_id`** for authenticated donors, even when they donate anonymously. The `is_anonymous` flag is now used to control visibility in public/charity views, not to remove the donor relationship.

---

## Backend Changes

### 1. DonationController.php
**File:** `capstone_backend/app/Http/Controllers/DonationController.php`

#### Changes Made:
- **store() method (lines 35-39):** Always store `donor_id` for authenticated users
- **submitManualDonation() (lines 100-105):** Keep `donor_id` for authenticated users
- **submitCharityDonation() (lines 145-150):** Keep `donor_id` for authenticated users
- **myDonations() (lines 200-213):** Added `is_own_donation` flag to help frontend display
- **uploadProof() (line 76):** Updated authorization check
- **downloadReceipt() (lines 218-220):** Updated authorization check

```php
// OLD - Removed donor_id for anonymous donations
$donorId = $data['is_anonymous'] ?? false ? null : $r->user()->id;

// NEW - Always keep donor_id
$donation = Donation::create([
    'donor_id' => $r->user()->id,
    // ... other fields
]);
```

### 2. Donation.php Model
**File:** `capstone_backend/app/Models/Donation.php`

Added `toArray()` override to hide donor information in public views when `is_anonymous` is true:

```php
public function toArray()
{
    $array = parent::toArray();
    
    // If donation is anonymous and donor relationship is loaded, hide donor info
    if ($this->is_anonymous && $this->relationLoaded('donor')) {
        $array['donor'] = [
            'id' => null,
            'name' => 'Anonymous',
            'email' => null,
        ];
    }
    
    return $array;
}
```

This ensures:
- ✅ Charity views show "Anonymous" for anonymous donations
- ✅ Public campaign donation lists show "Anonymous"
- ✅ Donor's own history shows all their donations (including anonymous ones)

---

## Frontend Changes

### DonationHistory.tsx
**File:** `capstone_frontend/src/pages/donor/DonationHistory.tsx`

#### Changes Made:
1. **Added `UserX` icon import** for anonymous indicator
2. **Updated interfaces:**
   - Added `is_anonymous: boolean` to `APIDonation`
   - Added `isAnonymous: boolean` to `DonationRow`

3. **Table display (lines 361-371):**
   - Shows "Anonymous" badge next to donation type for anonymous donations
   - Badge includes UserX icon for visual clarity

4. **Details dialog (lines 441-472):**
   - Shows anonymous badge
   - Displays informational message explaining anonymous donations
   - Message: "This donation was made anonymously. Your identity is hidden from the charity and public, but you can still view it in your history."

### Visual Indicators:
```tsx
{donation.isAnonymous && (
  <Badge variant="secondary" className="bg-gray-100 text-gray-700 flex items-center gap-1">
    <UserX className="h-3 w-3" />
    Anonymous
  </Badge>
)}
```

---

## How It Works

### Donor Perspective:
1. Donor makes a donation and checks "Donate anonymously"
2. **Backend:** Stores donation with `donor_id` AND `is_anonymous = true`
3. **Donor's history:** Shows all donations including anonymous ones with a badge
4. **Receipt download:** Donor can download receipts for their anonymous donations

### Charity Perspective:
1. **Charity inbox:** Sees "Anonymous" instead of donor name
2. **Donation table:** Shows "Anonymous" with italicized text
3. **Analytics:** Anonymous donations counted but no donor attribution
4. **Reports:** No personal donor information exposed

### Public Perspective:
1. **Campaign pages:** Shows "Anonymous" donor
2. **Leaderboards:** Anonymous donations not attributed to specific donors
3. **Public donation lists:** No donor information visible

---

## Database Schema
No changes required. The existing `donations` table already has:
- `donor_id` (nullable, but now kept for authenticated donors)
- `is_anonymous` (boolean flag controlling visibility)

---

## Testing Checklist

### Backend Tests:
- [x] Anonymous donation creates with `donor_id` preserved
- [x] `myDonations()` returns anonymous donations to owner
- [x] Charity inbox shows "Anonymous" for anonymous donations
- [x] Receipt download works for owner of anonymous donation
- [x] Public views hide donor information when `is_anonymous` is true

### Frontend Tests:
- [x] Donor history displays anonymous donations with badge
- [x] Anonymous badge shows in table and details dialog
- [x] Informational message explains anonymous donations
- [x] Statistics include anonymous donations in calculations
- [x] Receipt download button appears for anonymous donations

---

## Files Modified

### Backend:
1. `capstone_backend/app/Http/Controllers/DonationController.php`
2. `capstone_backend/app/Models/Donation.php`

### Frontend:
1. `capstone_frontend/src/pages/donor/DonationHistory.tsx`

### Existing Components (Already Compatible):
- `capstone_frontend/src/components/charity/donations/DonationsTable.tsx` - Already handles `is_anonymous` flag correctly

---

## Benefits

1. **Privacy Protected:** Donor identity hidden from charities and public
2. **Personal Tracking:** Donors can track ALL their donations
3. **Receipt Access:** Donors can download receipts for tax purposes
4. **Analytics Accuracy:** All donations counted in stats
5. **User Experience:** Clear visual indicators of anonymous status
6. **Flexibility:** Donors can choose to donate anonymously or publicly per donation

---

## Future Enhancements

Potential improvements:
- Add filter in donation history to show only anonymous/public donations
- Allow donors to toggle anonymous status after donation (with charity approval)
- Add anonymous donation statistics to donor analytics page
- Export option for tax receipts including anonymous donations
