# Admin User Management - Data Fetching & Filtering Fix

## Summary
Fixed the admin user management page (`http://localhost:8080/admin/users`) to properly fetch and display all donor and charity admin information, including profile pictures, donation stats, and charity details. Also improved the search and role filtering to be accurate and server-side.

## Changes Made

### Backend Changes

#### 1. VerificationController.php
**File:** `capstone_backend\app\Http\Controllers\Admin\VerificationController.php`

**Updates to `getUsers()` method:**
- Added `Request $request` parameter to accept filters
- Added eager loading for `donorProfile` and `charity` relationships
- Added `withCount` for donation and charity follow statistics
- Implemented server-side filtering:
  - **Role filtering:** Filter by `donor`, `charity_admin`, or `admin`
  - **Status filtering:** Filter by `active` or `suspended`
  - **Search filtering:** Search by name or email
- Added computed fields for each user:
  - **For Donors:**
    - `total_donations` - Count of donations
    - `total_amount` - Sum of donation amounts
    - `charities_supported` - Count of followed charities
    - `campaigns_backed` - Count of unique campaigns donated to
  - **For Charity Admins:**
    - `charity_name` - Name of associated charity
    - `charity_status` - Verification status (pending/approved/rejected)
    - `charity_logo` - Logo path
  - **For All Users:**
    - `profile_picture` - Full URL to profile image

### Frontend Changes

#### 2. admin.ts (Service Layer)
**File:** `capstone_frontend\src\services\admin.ts`

**Updated User Interface:**
```typescript
export interface User {
  // Basic fields
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  profile_image?: string;
  profile_picture?: string;
  role: 'donor' | 'charity_admin' | 'admin';
  status: 'active' | 'suspended';
  created_at: string;
  updated_at: string;
  last_login?: string;
  
  // Donor-specific fields
  total_donations?: number;
  total_amount?: number;
  charities_supported?: number;
  campaigns_backed?: number;
  donorProfile?: DonorProfile;
  
  // Charity admin-specific fields
  charity_name?: string;
  charity_status?: 'pending' | 'approved' | 'rejected';
  charity_logo?: string;
  charity?: {
    id: number;
    name: string;
    verification_status: string;
    logo_path?: string;
  };
}
```

**Added DonorProfile Interface:**
```typescript
export interface DonorProfile {
  id: number;
  user_id: number;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  gender?: string;
  date_of_birth?: string;
  street_address?: string;
  barangay?: string;
  city?: string;
  province?: string;
  region?: string;
  postal_code?: string;
  country?: string;
  full_address?: string;
  cause_preferences?: string[];
}
```

#### 3. Users.tsx (UI Component)
**File:** `capstone_frontend\src\pages\admin\Users.tsx`

**Search & Filter Improvements:**
- Implemented debounced search (300ms delay) to reduce API calls
- Search term now sent to backend for server-side filtering
- Removed redundant client-side filtering
- Role filter properly sends role parameter to backend

**Display Improvements:**

**User Cards:**
- Display actual profile pictures from `user.profile_picture`
- Fallback to Dicebear avatars if no profile picture

**View Dialog - Personal Info Section:**
- Phone number
- Address (if available)
- Full address from donor profile (if available)
- Gender (if available)
- Date of birth (if available)

**View Dialog - Donor Stats (for donors only):**
- **Donation Stats Card:**
  - Total Donations count
  - Amount Donated (₱ formatted)
- **Activity Card:**
  - Charities Supported count
  - Campaigns Backed count
- **Cause Preferences Card:**
  - Display all cause preferences as badges (if available)

**View Dialog - Charity Info (for charity admins only):**
- Charity logo/avatar (if available)
- Charity name
- Verification status badge (color-coded: approved=green, pending=yellow, rejected=red)
- Message if no charity associated

## Features

### 1. Accurate Role Filtering
- **All Roles:** Shows all users (admin, donor, charity_admin)
- **Admin:** Shows only admin users
- **Donor:** Shows only donor users
- **Charity Admin:** Shows only charity admin users

### 2. Real-time Search
- Search by user name or email
- Debounced to prevent excessive API calls
- Server-side search for better performance

### 3. Complete User Information Display
- Profile pictures properly displayed
- All donor statistics visible
- All charity admin information visible
- Donor profile details shown
- Cause preferences displayed

### 4. Profile Picture Handling
- Displays uploaded profile pictures
- Proper URL construction for storage images
- Fallback to generated avatars

## API Endpoint

**Endpoint:** `GET /api/admin/users`

**Query Parameters:**
- `page` - Pagination page number
- `role` - Filter by role (donor, charity_admin, admin)
- `status` - Filter by status (active, suspended)
- `search` - Search by name or email

**Response Structure:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "09123456789",
      "address": "123 Main St",
      "profile_picture": "http://localhost:8000/storage/profiles/image.jpg",
      "role": "donor",
      "status": "active",
      "created_at": "2024-01-01T00:00:00.000000Z",
      "total_donations": 5,
      "total_amount": 5000,
      "charities_supported": 3,
      "campaigns_backed": 4,
      "donorProfile": {
        "full_address": "123 Main St, Barangay ABC, City, Province",
        "gender": "male",
        "date_of_birth": "1990-01-01",
        "cause_preferences": ["Education", "Health"]
      }
    }
  ],
  "current_page": 1,
  "last_page": 5,
  "per_page": 20,
  "total": 100
}
```

## Testing Checklist

- [x] Backend returns donor statistics correctly
- [x] Backend returns charity admin information correctly
- [x] Profile pictures display correctly
- [x] Role filtering works accurately (donor shows only donors, charity_admin shows only charity admins)
- [x] Search functionality works with debouncing
- [x] All donor profile information displays in view dialog
- [x] Charity logo displays for charity admins
- [x] Cause preferences display as badges
- [x] Fallback avatars work when no profile picture

## Usage

1. Navigate to `http://localhost:8080/admin/users`
2. Use the search box to search by name or email
3. Use the role filter dropdown to filter by:
   - All Roles
   - Admin
   - Donor
   - Charity Admin
4. Click on any user card to view complete details
5. View donor statistics, charity information, and profile details in the dialog

## Notes

- Search is debounced by 300ms to reduce API calls
- All filtering is done server-side for better performance
- Profile pictures use Laravel's storage URL helper
- Charity logos properly handle both relative and absolute URLs
- Empty states handled gracefully (no profile picture, no charity, etc.)
