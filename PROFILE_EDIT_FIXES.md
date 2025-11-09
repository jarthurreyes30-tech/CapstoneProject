# Profile Edit Functionality - Required Fixes

## Overview
This document outlines the necessary fixes to ensure all user roles can properly edit their profile information.

---

## Issue 1: Donor Profile Missing Fields

### Problem
The donor edit profile form collects these fields but the backend doesn't save them:
- `display_name` - Display name for public interactions
- `bio` - Short biography (max 500 chars)
- `interests` - Array of preferred causes
- `location` - Separate from address field

### Solution

#### Step 1: Create Database Migration
Create file: `database/migrations/2025_11_02_000001_add_donor_profile_fields_to_users_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('display_name')->nullable()->after('name');
            $table->string('location')->nullable()->after('address');
            $table->text('bio')->nullable()->after('location');
            $table->json('interests')->nullable()->after('bio');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['display_name', 'location', 'bio', 'interests']);
        });
    }
};
```

#### Step 2: Update User Model
File: `app/Models/User.php`

Update the `$fillable` array to include new fields:

```php
protected $fillable = [
    'name',
    'display_name',  // ADD THIS
    'email',
    'phone',
    'address',
    'location',      // ADD THIS
    'bio',           // ADD THIS
    'interests',     // ADD THIS
    'password',
    'profile_image',
    'role',
    'status',
    'sms_notifications_enabled',
    'sms_notification_types',
    'is_locked',
    'locked_until',
    'failed_login_count',
    'last_failed_login',
    // Location fields for donors
    'region',
    'province',
    'city',
    'barangay'
];
```

Update the `$casts` array:

```php
protected $casts = [
    'email_verified_at' => 'datetime',
    'password' => 'hashed',
    'sms_notifications_enabled' => 'boolean',
    'sms_notification_types' => 'array',
    'interests' => 'array',  // ADD THIS
    'is_locked' => 'boolean',
    'locked_until' => 'datetime',
    'last_failed_login' => 'datetime',
];
```

#### Step 3: Update AuthController
File: `app/Http/Controllers/AuthController.php`

Update the `updateProfile` method validation rules (around line 321):

```php
// Add role-specific fields
if ($user->role === 'donor') {
    $validationRules['display_name'] = 'sometimes|string|max:255';
    $validationRules['location'] = 'sometimes|nullable|string|max:255';
    $validationRules['bio'] = 'sometimes|nullable|string|max:500';
    $validationRules['interests'] = 'sometimes|nullable|array';
    $validationRules['interests.*'] = 'string|max:100';
    $validationRules['profile_image'] = 'sometimes|image|mimes:jpeg,png,jpg|max:2048';
}
```

---

## Issue 2: System Admin Profile Edit Not Implemented

### Problem
The admin profile page has a TODO comment and doesn't actually call the API to save changes.

### Solution

#### Update Admin Profile Page
File: `capstone_frontend/src/pages/admin/Profile.tsx`

Replace the `handleSave` function (lines 20-29):

```typescript
const handleSave = async () => {
  try {
    const token = authService.getToken();
    if (!token) {
      toast.error('Please login first');
      return;
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL}/me`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update profile');
    }

    const result = await response.json();
    toast.success("Profile updated successfully");
    setIsEditing(false);
    
    // Update the user context if available
    // You may need to call a refresh function here
  } catch (error: any) {
    console.error('Update profile error:', error);
    toast.error(error.message || "Failed to update profile");
  }
};
```

Also make email field disabled (line 82):

```typescript
<Input
  id="email"
  type="email"
  value={formData.email}
  disabled={true}  // Change this to always disabled
  className="bg-muted"
/>
```

---

## Issue 3: Location Field Inconsistency

### Problem
Donor registration uses structured location fields (region, province, city, barangay) but the edit profile form uses a single "location" text field.

### Solution Options

#### Option A: Keep Simple Location Field (Recommended for Edit)
- Keep the simple text field in edit profile
- It's easier for users to update
- Backend already supports both `address` and `location`

#### Option B: Use Structured Location in Edit
- Replace the location text field with the Philippine address form
- More consistent with registration
- Better data quality

**Recommendation:** Keep Option A for simplicity in profile editing.

---

## Testing Checklist

After implementing fixes, test the following:

### Donor Profile Edit
- [ ] Can edit name
- [ ] Can edit display name (NEW)
- [ ] Can edit phone
- [ ] Can edit address
- [ ] Can edit location (NEW)
- [ ] Can edit bio (NEW)
- [ ] Can select/deselect interests (NEW)
- [ ] Can upload profile image
- [ ] All changes persist after save
- [ ] Validation works correctly

### Charity Admin Profile Edit
- [ ] Can edit mission
- [ ] Can edit vision
- [ ] Can edit description
- [ ] Can edit all location fields
- [ ] Can edit contact information
- [ ] Can upload logo
- [ ] Can upload cover image
- [ ] All changes persist after save
- [ ] Validation works correctly

### System Admin Profile Edit
- [ ] Can edit name
- [ ] Can edit phone
- [ ] Can edit address
- [ ] Cannot edit email (disabled)
- [ ] All changes persist after save (NEW - needs implementation)
- [ ] Validation works correctly

---

## Implementation Steps

1. **Create and run migration:**
   ```bash
   cd capstone_backend
   php artisan make:migration add_donor_profile_fields_to_users_table
   # Copy the migration code above
   php artisan migrate
   ```

2. **Update User model:**
   - Add new fields to `$fillable`
   - Add `interests` to `$casts`

3. **Update AuthController:**
   - Add validation rules for donor-specific fields

4. **Update Admin Profile frontend:**
   - Implement actual API call in `handleSave`
   - Disable email field

5. **Test all three roles:**
   - Use the PowerShell test script: `test-profile-edit.ps1`
   - Manually test in the browser
   - Verify data persistence

---

## Database Schema After Fixes

### Users Table
```
id                          bigint
name                        varchar(255)
display_name                varchar(255)    [NEW]
email                       varchar(255)
email_verified_at           timestamp
password                    varchar(255)
phone                       varchar(20)
address                     text
location                    varchar(255)    [NEW]
bio                         text            [NEW]
interests                   json            [NEW]
profile_image               varchar(255)
role                        enum
status                      enum
region                      varchar(255)
province                    varchar(255)
city                        varchar(255)
barangay                    varchar(255)
remember_token              varchar(100)
created_at                  timestamp
updated_at                  timestamp
sms_notifications_enabled   boolean
sms_notification_types      json
is_locked                   boolean
locked_until                timestamp
failed_login_count          integer
last_failed_login           timestamp
```

---

## API Endpoints Summary

| Role | Endpoint | Method | Purpose |
|------|----------|--------|---------|
| Donor | `/api/me` | PUT | Update donor profile |
| Charity Admin | `/api/charity/profile/update` | POST | Update charity profile |
| System Admin | `/api/me` | PUT | Update admin profile |

All endpoints require `auth:sanctum` middleware.

---

## Notes

- The charity admin profile edit is already fully functional
- Donor profile needs database and backend updates
- System admin profile needs frontend implementation
- All profile images should be stored in `storage/app/public/`
- Consider adding profile image support for admins in the future
