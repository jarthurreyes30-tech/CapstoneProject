# 🔍 ACCOUNT DEACTIVATION/REACTIVATION FEATURE ANALYSIS

## 📊 **FEATURE STATUS: PARTIALLY IMPLEMENTED WITH BUG**

---

## ✅ **WHAT EXISTS**

### **Backend Implementation:**

#### **1. API Routes (WORKING)** ✅
**File:** `capstone_backend\routes\api.php`
- `POST /api/me/deactivate` → `AuthController::deactivateAccount`
- `POST /api/me/reactivate` → `AuthController::reactivateAccount`
- Both routes protected with `auth:sanctum` middleware

#### **2. Controller Methods (IMPLEMENTED BUT BUGGY)** ⚠️
**File:** `capstone_backend\app\Http\Controllers\AuthController.php`

**Deactivate Method (Lines 576-589):**
```php
public function deactivateAccount(Request $r){
    $user = $r->user();

    // Log account deactivation
    $this->securityService->logActivity($user, 'account_deactivated', [
        'deactivated_at' => now()->toISOString(),
        'reason' => $r->input('reason', 'User requested deactivation')
    ]);

    // Set status to inactive (soft delete)
    $user->update(['status' => 'inactive']); // ❌ BUG: 'inactive' is not a valid enum value!

    return response()->json(['message' => 'Account deactivated successfully']);
}
```

**Reactivate Method (Lines 716-743):**
```php
public function reactivateAccount(Request $request)
{
    $user = $request->user();

    if ($user->status === 'active') {
        return response()->json([
            'message' => 'Account is already active'
        ], 422);
    }

    // Reactivate account
    $user->update(['status' => 'active']);

    // Log reactivation
    $this->securityService->logActivity($user, 'account_reactivated', [
        'reactivated_at' => now()->toISOString()
    ]);

    // Send confirmation email
    \Mail::to($user->email)->queue(
        new \App\Mail\Security\AccountReactivatedMail($user)
    );

    return response()->json([
        'success' => true,
        'message' => 'Account reactivated successfully'
    ]);
}
```

---

## ❌ **WHAT'S MISSING / BROKEN**

### **1. Database Schema Bug** 🐛
**File:** `capstone_backend\database\migrations\0001_01_01_000000_create_users_table.php`

**Current Definition (Line 22):**
```php
$t->enum('status',['active','suspended'])->default('active');
```

**Problem:**
- Database only allows: `'active'` or `'suspended'`
- Controller tries to set: `'inactive'`
- **This will cause a database error!**

**Fix Required:**
Either:
- Change controller to use `'suspended'` instead of `'inactive'`, OR
- Add `'inactive'` to the enum values in migration

---

### **2. Frontend UI (MISSING)** ❌

**Current State:**
- `AccountSettings.tsx` has NO deactivation UI
- Only has:
  - Change Password
  - Privacy Settings
  - Preferences
  - **Delete Account (permanent)**
  
**Missing:**
- No "Deactivate Account" button
- No "Reactivate Account" feature
- No separate page at `/donor/settings/deactivate`

---

## 🔧 **HOW TO FIX**

### **Fix 1: Update Database Enum (RECOMMENDED)**

**Option A: Add 'inactive' to enum**
Create a new migration:
```bash
php artisan make:migration update_users_status_enum
```

```php
public function up(): void
{
    Schema::table('users', function (Blueprint $table) {
        $table->enum('status', ['active', 'inactive', 'suspended'])
              ->default('active')
              ->change();
    });
}
```

**Option B: Use 'suspended' in controller**
Change `AuthController.php` line 586:
```php
$user->update(['status' => 'suspended']); // Instead of 'inactive'
```

---

### **Fix 2: Add Frontend UI**

Add to `AccountSettings.tsx` in the "Danger Zone" tab:

```tsx
<Card className="border-warning">
  <CardHeader>
    <CardTitle>Deactivate Account</CardTitle>
    <CardDescription>
      Temporarily deactivate your account. You can reactivate it anytime.
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="p-4 bg-warning/10 rounded-lg">
      <p className="text-sm font-medium mb-2">This action will:</p>
      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
        <li>Temporarily disable your account</li>
        <li>Hide your profile from the platform</li>
        <li>Pause recurring donations</li>
        <li>You can reactivate anytime by logging in</li>
      </ul>
    </div>

    <Button 
      variant="outline" 
      onClick={() => setIsDeactivateDialogOpen(true)}
      className="w-full border-warning text-warning hover:bg-warning/10"
    >
      <Power className="mr-2 h-4 w-4" />
      Deactivate My Account
    </Button>
  </CardContent>
</Card>
```

---

## 🧪 **MANUAL TESTING (Once Fixed)**

### **Test 1: Deactivate Account**

1. **Via API (Browser Console):**
```javascript
fetch('http://127.0.0.1:8000/api/me/deactivate', {
  method: 'POST',
  credentials: 'include',
  headers: { 
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ reason: 'Taking a break' })
}).then(r => r.json()).then(console.log)
```

2. **Expected Response:**
```json
{
  "message": "Account deactivated successfully"
}
```

3. **Verify in Database:**
```sql
SELECT id, name, email, status FROM users WHERE email = 'your-email@example.com';
```
Should show: `status = 'inactive'` (or 'suspended' if using Option B)

4. **Try to Login:**
- Should be blocked or show "account deactivated" message

---

### **Test 2: Reactivate Account**

1. **Via API (if still logged in):**
```javascript
fetch('http://127.0.0.1:8000/api/me/reactivate', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Accept': 'application/json' }
}).then(r => r.json()).then(console.log)
```

2. **Expected Response:**
```json
{
  "success": true,
  "message": "Account reactivated successfully"
}
```

3. **Verify in Database:**
```sql
SELECT id, name, email, status FROM users WHERE email = 'your-email@example.com';
```
Should show: `status = 'active'`

4. **Check Email:**
- Should receive "Account Reactivated" confirmation email

---

### **Test 3: Database Verification**

```sql
-- Check status values in use
SELECT DISTINCT status, COUNT(*) as count
FROM users
GROUP BY status;

-- Check security logs for deactivation/reactivation events
SELECT * FROM security_logs 
WHERE activity_type IN ('account_deactivated', 'account_reactivated')
ORDER BY created_at DESC
LIMIT 10;
```

---

## 📋 **CURRENT ISSUES SUMMARY**

| Component | Status | Issue |
|-----------|--------|-------|
| **API Routes** | ✅ Working | Properly defined |
| **Backend Methods** | ⚠️ Buggy | Uses 'inactive' which doesn't exist in enum |
| **Database Schema** | ❌ Incompatible | Only allows 'active' or 'suspended' |
| **Frontend UI** | ❌ Missing | No deactivate button/page |
| **Login Check** | ❓ Unknown | Need to verify if deactivated users are blocked from login |
| **Email Notifications** | ✅ Implemented | Reactivation email exists |

---

## 🚨 **CRITICAL BUG**

**If you try to deactivate an account right now, you will get this error:**

```
SQLSTATE[HY000]: General error: 1265 Data truncated for column 'status' at row 1
```

**Why?** 
- Database enum only accepts: `'active'`, `'suspended'`
- Controller tries to set: `'inactive'`
- Database rejects the value

---

## ✅ **RECOMMENDED FIX PRIORITY**

1. **HIGH PRIORITY:** Fix the enum mismatch (choose Option A or B above)
2. **MEDIUM:** Add frontend UI for deactivation
3. **LOW:** Add login middleware to check if account is deactivated
4. **LOW:** Add reactivation option on login page for deactivated accounts

---

## 🎯 **CONCLUSION**

**Status:** ❌ **NOT WORKING** (due to database enum bug)

**Backend:** 80% implemented (routes and methods exist, but buggy)

**Frontend:** 0% implemented (no UI exists)

**Fix Required:** YES - database schema must be updated before this feature can work

**Can Test Now:** NO - will cause database errors

**After Fix:** Will be fully functional with backend API, but still needs frontend UI for user-friendly access
