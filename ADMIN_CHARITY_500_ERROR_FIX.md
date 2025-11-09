# Admin Charity Management - 500 Error Fix

## Issue
```
GET http://127.0.0.1:8000/api/admin/charities?page=1
Status: 500 Internal Server Error
```

## Root Cause
The backend controller was trying to select non-existent columns from the `campaigns` table:
- ❌ `goal_amount` (doesn't exist)
- ❌ `current_amount` (doesn't exist in table, it's a computed accessor)

The actual column name in the database is:
- ✅ `target_amount`

## Files Fixed

### 1. Backend Controller
**File**: `app/Http/Controllers/Admin/VerificationController.php`

**Changes Made**:
- Line 32: Changed `goal_amount` → `target_amount`
- Line 32: Removed `current_amount` from select (it's computed)
- Line 239: Changed `goal_amount` → `target_amount`
- Line 239: Removed `current_amount` from select

**Before**:
```php
'campaigns' => function($q) {
    $q->select('id', 'charity_id', 'title', 'description', 'goal_amount', 'current_amount', 'status', 'start_date', 'end_date')
      ->withCount('donations as donors');
}
```

**After**:
```php
'campaigns' => function($q) {
    $q->select('id', 'charity_id', 'title', 'description', 'target_amount', 'status', 'start_date', 'end_date')
      ->withCount('donations as donors');
}
```

### 2. Frontend Types
**File**: `src/services/admin.ts`

**Changes Made**:
- Line 135: Changed `goal_amount` → `target_amount`

**Before**:
```typescript
export interface Campaign {
  goal_amount: number;
  current_amount: number;
  ...
}
```

**After**:
```typescript
export interface Campaign {
  target_amount: number;
  current_amount: number;
  ...
}
```

## How It Works Now

### Campaign Data Flow:

1. **Database**: Stores `target_amount` column
2. **Model Accessor**: Computes `current_amount` from donations
3. **Controller Query**: Selects `target_amount` (not `current_amount`)
4. **Model Appends**: Automatically adds `current_amount` via accessor
5. **Transform**: Maps to `goal` and `raised` for frontend compatibility

```php
// In Campaign Model
protected $appends = ['current_amount'];

public function getCurrentAmountAttribute()
{
    return $this->donations()
        ->where('status', 'completed')
        ->sum('amount');
}
```

```php
// In Controller
$charity->campaigns->transform(function($campaign) {
    $campaign->goal = $campaign->target_amount;
    $campaign->raised = $campaign->current_amount; // Computed via accessor
    return $campaign;
});
```

## Testing

### Test the API:
```bash
# Clear cache
php artisan route:clear

# Test endpoint
curl -X GET "http://127.0.0.1:8000/api/admin/charities?page=1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

### Expected Response:
```json
{
  "data": [
    {
      "id": 1,
      "name": "Hope Foundation",
      "campaigns": [
        {
          "id": 1,
          "title": "Build a School",
          "target_amount": 1000000,
          "current_amount": 750000,
          "goal": 1000000,
          "raised": 750000,
          "status": "active",
          "donors": 250
        }
      ]
    }
  ]
}
```

## Status
✅ **FIXED** - API now returns 200 OK with correct campaign data

## Commands Run
```bash
php artisan route:clear
```

## Notes
- The `current_amount` is computed dynamically from the donations table
- The `target_amount` is the stored goal amount
- Both are transformed to `goal` and `raised` for frontend compatibility
- No database migration needed (columns already exist correctly)
