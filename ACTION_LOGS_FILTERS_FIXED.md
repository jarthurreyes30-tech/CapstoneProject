# Action Logs - Search & Filtering Fixed

## Issues Fixed

### 1. **404 Error - Duplicate `/api/` Prefix**
- **Problem**: URLs were showing `/api/api/admin/activity-logs`
- **Cause**: Axios baseURL already included `/api`, but component added it again
- **Fix**: Removed `/api` prefix from all routes in `ActionLogs.tsx`

### 2. **Action Type Filter - Incorrect Values**
- **Problem**: Frontend had wrong action type values (donate, create_campaign, etc.)
- **Backend uses**: `donation_created`, `campaign_created`, `user_registered`, etc.
- **Fix**: Updated dropdown with correct action types matching backend

### 3. **User Type Filter - Filter by User Role**
- **Problem**: Filter needed to show only Donor and Charity options, filtering by user role
- **Fix**: Changed filter to use user role (donor/charity_admin) instead of resource type

## Changes Made

### Backend (`UserActivityLogController.php`)

1. **Enabled User Role Filtering**
```php
// Filter by user role (donor or charity_admin)
if ($request->has('target_type') && $request->target_type !== 'all') {
    $query->whereHas('user', function ($q) use ($request) {
        $q->where('role', $request->target_type);
    });
}
```

2. **Applied Same Filter to Export Function**
- Added user role filter to CSV export

### Frontend (`ActionLogs.tsx`)

1. **Fixed API Routes**
   - `/admin/activity-logs` (was `/api/admin/activity-logs`)
   - `/admin/activity-logs/statistics` (was `/api/admin/activity-logs/statistics`)
   - `/admin/activity-logs/export` (was `/api/admin/activity-logs/export`)

2. **Updated Action Type Dropdown**
```tsx
- login
- logout
- register
- user_registered
- donation_created
- campaign_created
- campaign_updated
- profile_updated
- password_changed
- account_deactivated
- account_deleted
- charity_approved
- charity_rejected
```

3. **Updated Badge Colors & Icons**
   - Matched all action types with proper colors
   - Updated icon mappings for all actions
   - Added color schemes for visual consistency

4. **User Type Filter** (Filter by Role)
   - Donor
   - Charity (charity_admin)

## Testing

### Test Search Function
1. Type user name or email in search box
2. Should filter logs by user

### Test Action Type Filter
1. Select any action from dropdown (e.g., "Login")
2. Should show only logs with that action type

### Test User Type Filter
1. Select "Donor" - Should show only activities by donor users
2. Select "Charity" - Should show only activities by charity admin users

### Test Date Range Filter
1. Set start date and end date
2. Should show logs within that range

### Test Export
1. Apply filters
2. Click "Export CSV"
3. Should download filtered logs as CSV

## Action Types in Backend

These are logged by `SecurityService::logActivity()`:

- `login` - User logged in
- `logout` - User logged out
- `register` - User registration
- `user_registered` - New user registered
- `donation_created` - Donation made
- `campaign_created` - Campaign created
- `campaign_updated` - Campaign updated
- `profile_updated` - Profile updated
- `password_changed` - Password changed
- `account_deactivated` - Account deactivated
- `account_deleted` - Account deleted
- `charity_approved` - Charity approved by admin
- `charity_rejected` - Charity rejected by admin

## Statistics Cards

Display real-time metrics:
- **Total Activities**: All logged actions
- **Donations**: Count of donation_created actions
- **Campaigns Created**: Count of campaign_created actions
- **New Registrations**: Count of register actions

## API Endpoints

All working correctly:
- `GET /admin/activity-logs?action_type=login&target_type=donor&start_date=2025-01-01&end_date=2025-12-31&search=john`
- `GET /admin/activity-logs?target_type=charity_admin` (Filter by charity users)
- `GET /admin/activity-logs/statistics`
- `GET /admin/activity-logs/export?action_type=donation_created&target_type=donor&start_date=2025-01-01`

### Filter Parameters
- `action_type`: Filter by action (login, logout, donation_created, campaign_created, etc.)
- `target_type`: Filter by user role (donor, charity_admin)
- `start_date`: Filter from date (YYYY-MM-DD)
- `end_date`: Filter to date (YYYY-MM-DD)
- `search`: Search by user name or email
