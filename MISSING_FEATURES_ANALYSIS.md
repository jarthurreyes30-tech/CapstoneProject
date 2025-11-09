# 🔍 Missing Features Analysis - CharityHub

**Analysis Date:** November 2, 2025  
**Project:** CharityHub Capstone  
**Status:** Comprehensive Feature Gap Analysis

---

## 📊 Executive Summary

After analyzing your complete backend and frontend codebase, here's a detailed breakdown of what's MISSING vs. what's ALREADY IMPLEMENTED from your requirements list.

---

## ✅ ALREADY IMPLEMENTED

### Backend Routes That Exist:
1. ✅ **Email Verification System**
   - `POST /api/email/resend-verification` ✓ EXISTS
   - `GET /api/auth/verify-email` ✓ EXISTS

2. ✅ **Payment & Billing**
   - `GET/POST/PUT/DELETE /api/me/payment-methods` ✓ EXISTS
   - `GET/POST /api/me/tax-info` ✓ EXISTS

3. ✅ **Account Management**
   - `POST /api/me/deactivate` ✓ EXISTS
   - `DELETE /api/me` (permanent delete) ✓ EXISTS
   - `POST /api/me/change-password` ✓ EXISTS

4. ✅ **Export Functionality** (Partial)
   - `GET /api/admin/action-logs/export` ✓ EXISTS
   - `GET /api/admin/activity-logs/export` ✓ EXISTS
   - `GET /api/admin/fund-tracking/export` ✓ EXISTS

### Frontend Pages That Exist But Not Wired:
1. ✅ **VerifyEmail.tsx** - EXISTS but not in App.tsx routes
2. ✅ **RegistrationStatus.tsx** - EXISTS but not in App.tsx routes

---

## ❌ MISSING FEATURES - MUST IMPLEMENT

### 🔴 Priority 1: Critical Account Recovery

#### 1. Retrieve Donor Account After Suspension
**Status:** ❌ MISSING  
**What's Needed:**
- Frontend Page: `/auth/retrieve/donor`
- Backend Route: `POST /api/auth/retrieve/donor`
- Controller: `AuthController@retrieveDonorAccount`
- Logic: Allow donors to request reactivation with identity verification

**Implementation:**
```php
// Backend Controller Method
public function retrieveDonorAccount(Request $request)
{
    $validated = $request->validate([
        'email' => 'required|email',
        'reason' => 'required|string|max:500',
        'identity_proof' => 'nullable|file|mimes:jpg,png,pdf|max:5120',
    ]);
    
    // Check if account is deactivated/suspended
    // Send verification email
    // Create retrieval request
}
```

```tsx
// Frontend Component: src/pages/auth/RetrieveDonor.tsx
export default function RetrieveDonor() {
  // Form to submit retrieval request
  // Email, reason, optional ID upload
  // Success message
}
```

#### 2. Retrieve Charity Account After Suspension
**Status:** ❌ MISSING  
**What's Needed:**
- Frontend Page: `/auth/retrieve/charity`
- Backend Route: `POST /api/auth/retrieve/charity`
- Controller: `AuthController@retrieveCharityAccount`
- Logic: Charity admins request reactivation with org proofs

**Implementation:**
```php
// Backend Controller Method
public function retrieveCharityAccount(Request $request)
{
    $validated = $request->validate([
        'email' => 'required|email',
        'organization_name' => 'required|string',
        'registration_number' => 'required|string',
        'reason' => 'required|string|max:1000',
        'documents' => 'nullable|array',
        'documents.*' => 'file|mimes:pdf,jpg,png|max:10240',
    ]);
    
    // Verify organization details
    // Create admin review request
    // Send notification email
}
```

---

### 🟠 Priority 2: Email & Verification

#### 3. Wire VerifyEmail Page
**Status:** ⚠️ EXISTS BUT NOT ROUTED  
**What's Needed:**
- Add route to App.tsx: `<Route path="/auth/verify-email" element={<VerifyEmail />} />`

#### 4. Wire RegistrationStatus Page
**Status:** ⚠️ EXISTS BUT NOT ROUTED  
**What's Needed:**
- Add route to App.tsx: `<Route path="/auth/registration-status" element={<RegistrationStatus />} />`

#### 5. Change Email Address
**Status:** ❌ MISSING  
**What's Needed:**
- Frontend Page: `/donor/settings/change-email`
- Backend Route: `POST /api/me/change-email`
- Controller: `AuthController@changeEmail`
- Logic: Re-auth, send confirmation to both old and new emails

**Implementation:**
```php
// Backend
public function changeEmail(Request $request)
{
    $validated = $request->validate([
        'current_password' => 'required',
        'new_email' => 'required|email|unique:users,email',
    ]);
    
    // Verify password
    // Send verification to new email
    // Keep old email active until confirmed
}
```

#### 6. Resend Verification Entry Points
**Status:** ❌ MISSING UI LINKS  
**What's Needed:**
- Add "Resend Verification Email" link in `Login.tsx`
- Add "Resend Verification Email" link in `Register.tsx`
- Link to: `/auth/resend-verification` or inline action

---

### 🟡 Priority 3: Security Features

#### 7. Two-Factor Authentication (2FA)
**Status:** ❌ MISSING (UI Disabled)  
**What's Needed:**
- Frontend Page: `/donor/settings/2fa`
- Backend Routes:
  - `POST /api/me/2fa/enable` - Generate QR code
  - `POST /api/me/2fa/verify` - Verify TOTP code
  - `POST /api/me/2fa/disable` - Disable 2FA
  - `GET /api/me/2fa/recovery-codes` - Get recovery codes
- Controller: `TwoFactorAuthController`
- Package: `pragmarx/google2fa-laravel`

**Implementation:**
```php
// Backend Controller
public function enable2FA(Request $request)
{
    $google2fa = app('pragmarx.google2fa');
    $secretKey = $google2fa->generateSecretKey();
    
    $user = $request->user();
    $user->update(['two_factor_secret' => encrypt($secretKey)]);
    
    $qrCodeUrl = $google2fa->getQRCodeUrl(
        'CharityHub',
        $user->email,
        $secretKey
    );
    
    return response()->json([
        'secret' => $secretKey,
        'qr_code_url' => $qrCodeUrl,
        'recovery_codes' => $this->generateRecoveryCodes($user),
    ]);
}
```

#### 8. Active Sessions Management
**Status:** ❌ MISSING  
**What's Needed:**
- Frontend Page: `/donor/settings/sessions`
- Backend Routes:
  - `GET /api/me/sessions` - List active sessions
  - `DELETE /api/me/sessions/{id}` - Revoke session
- Table: `sessions` (Laravel default with user_id, ip_address, user_agent)
- Controller: `SessionController`

**Implementation:**
```php
// Backend
public function listSessions(Request $request)
{
    $sessions = DB::table('sessions')
        ->where('user_id', $request->user()->id)
        ->orderBy('last_activity', 'desc')
        ->get()
        ->map(function ($session) {
            return [
                'id' => $session->id,
                'ip_address' => $session->ip_address,
                'user_agent' => $session->user_agent,
                'last_activity' => Carbon::createFromTimestamp($session->last_activity),
                'is_current' => $session->id === session()->getId(),
            ];
        });
    
    return response()->json($sessions);
}

public function revokeSession(Request $request, $sessionId)
{
    DB::table('sessions')
        ->where('id', $sessionId)
        ->where('user_id', $request->user()->id)
        ->delete();
    
    return response()->json(['success' => true]);
}
```

---

### 🟢 Priority 4: Donation & Payment Features

#### 9. Recurring Donations Management
**Status:** ❌ MISSING (Backend has processing, no user CRUD)  
**What's Needed:**
- Frontend Page: `/donor/recurring`
- Backend Routes:
  - `GET /api/me/recurring-donations` - List user's recurring donations
  - `PATCH /api/recurring-donations/{id}` - Pause/resume/edit
  - `DELETE /api/recurring-donations/{id}` - Cancel
- Controller: `RecurringDonationController`

**Implementation:**
```php
// Backend
public function index(Request $request)
{
    $recurring = $request->user()
        ->recurringDonations()
        ->with('campaign', 'charity')
        ->orderBy('created_at', 'desc')
        ->get();
    
    return response()->json($recurring);
}

public function update(Request $request, $id)
{
    $validated = $request->validate([
        'status' => 'nullable|in:active,paused,cancelled',
        'amount' => 'nullable|numeric|min:10',
        'frequency' => 'nullable|in:weekly,monthly,quarterly,yearly',
    ]);
    
    $recurring = $request->user()
        ->recurringDonations()
        ->findOrFail($id);
    
    $recurring->update($validated);
    
    return response()->json($recurring);
}
```

#### 10. Payment Methods Management UI
**Status:** ⚠️ BACKEND EXISTS, NO UI  
**What's Needed:**
- Frontend Page: `/donor/billing` or section in `/donor/settings`
- Use existing backend routes (already implemented)
- UI to add/remove/set default payment methods
- Integration with Stripe/PayPal/GCash

**Frontend Component:**
```tsx
// src/pages/donor/PaymentMethods.tsx
export default function PaymentMethods() {
  const { data: paymentMethods } = useQuery(['payment-methods'], 
    () => api.get('/me/payment-methods')
  );
  
  // Display cards/wallets
  // Add new payment method button
  // Set default, remove options
}
```

#### 11. Billing/Tax Information UI
**Status:** ⚠️ BACKEND EXISTS, NO UI  
**What's Needed:**
- Frontend Page: `/donor/billing/tax-info` or section in `/donor/settings`
- Use existing backend routes (already implemented)
- Form for taxpayer info: name, TIN, address
- For receipts and tax statements

---

### 🔵 Priority 5: Social & Discovery Features

#### 12. Followed Charities List
**Status:** ❌ MISSING  
**What's Needed:**
- Frontend Page: `/donor/following`
- Backend Routes:
  - `GET /api/me/following` - List followed charities
  - `DELETE /api/follows/{id}` - Unfollow
- Controller: `CharityFollowController` (may partially exist)

**Implementation:**
```php
// Backend
public function followedCharities(Request $request)
{
    $followed = $request->user()
        ->followedCharities()
        ->withCount('campaigns')
        ->withCount('followers')
        ->with('latestCampaign')
        ->orderBy('charity_follows.created_at', 'desc')
        ->get();
    
    return response()->json($followed);
}
```

#### 13. Bookmarks/Saved Items
**Status:** ❌ MISSING  
**What's Needed:**
- Frontend Page: `/donor/saved`
- Backend Routes:
  - `GET /api/me/saved` - List saved items
  - `POST /api/me/saved` - Save charity/campaign
  - `DELETE /api/me/saved/{id}` - Remove from saved
- Database Table: `saved_items` (user_id, saveable_type, saveable_id)
- Controller: `SavedItemController`

**Migration:**
```php
Schema::create('saved_items', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->morphs('saveable'); // saveable_type, saveable_id
    $table->timestamps();
    
    $table->unique(['user_id', 'saveable_type', 'saveable_id']);
});
```

---

### 🟣 Priority 6: Reporting & Export

#### 14. Donation History Export
**Status:** ❌ MISSING  
**What's Needed:**
- Button in `DonationHistory.tsx`
- Backend Route: `GET /api/me/donations/export?format=csv|pdf`
- Controller: `DonationController@exportHistory`
- Package: `league/csv` or `barryvdh/laravel-dompdf`

**Implementation:**
```php
// Backend
public function exportHistory(Request $request)
{
    $format = $request->get('format', 'csv');
    $donations = $request->user()
        ->donations()
        ->with('campaign', 'charity')
        ->orderBy('created_at', 'desc')
        ->get();
    
    if ($format === 'csv') {
        return $this->exportToCsv($donations);
    } elseif ($format === 'pdf') {
        return $this->exportToPdf($donations);
    }
}

private function exportToCsv($donations)
{
    $csv = Writer::createFromString('');
    $csv->insertOne(['Date', 'Campaign', 'Charity', 'Amount', 'Status']);
    
    foreach ($donations as $donation) {
        $csv->insertOne([
            $donation->created_at->format('Y-m-d'),
            $donation->campaign->title,
            $donation->charity->organization_name,
            $donation->amount,
            $donation->status,
        ]);
    }
    
    return response($csv->toString())
        ->header('Content-Type', 'text/csv')
        ->header('Content-Disposition', 'attachment; filename="donation-history.csv"');
}
```

#### 15. Annual Donation Statement
**Status:** ❌ MISSING  
**What's Needed:**
- Frontend Page: `/donor/statements`
- Backend Route: `GET /api/me/statements?year=YYYY`
- Controller: `DonationController@annualStatement`
- PDF generation with tax summary

**Implementation:**
```php
// Backend
public function annualStatement(Request $request)
{
    $year = $request->get('year', date('Y'));
    
    $donations = $request->user()
        ->donations()
        ->whereYear('created_at', $year)
        ->where('status', 'completed')
        ->with('campaign', 'charity')
        ->get();
    
    $totalAmount = $donations->sum('amount');
    $totalDonations = $donations->count();
    $charitiesSupported = $donations->pluck('charity_id')->unique()->count();
    
    $pdf = PDF::loadView('pdfs.annual-statement', [
        'user' => $request->user(),
        'year' => $year,
        'donations' => $donations,
        'totalAmount' => $totalAmount,
        'totalDonations' => $totalDonations,
        'charitiesSupported' => $charitiesSupported,
    ]);
    
    return $pdf->download("donation-statement-{$year}.pdf");
}
```

#### 16. Refund/Dispute Donation
**Status:** ❌ MISSING  
**What's Needed:**
- Frontend Route: `/donor/donations/:id/refund`
- Backend Route: `POST /api/donations/{id}/refund`
- Controller: `DonationController@requestRefund`
- Logic: Create refund request, notify admin

**Implementation:**
```php
// Backend
public function requestRefund(Request $request, $donationId)
{
    $validated = $request->validate([
        'reason' => 'required|string|max:500',
        'type' => 'required|in:refund,dispute',
    ]);
    
    $donation = $request->user()
        ->donations()
        ->findOrFail($donationId);
    
    // Check if refund window is valid (e.g., within 30 days)
    if ($donation->created_at->diffInDays(now()) > 30) {
        return response()->json([
            'error' => 'Refund window has expired (30 days)'
        ], 422);
    }
    
    // Create refund request
    $refund = $donation->refunds()->create([
        'user_id' => $request->user()->id,
        'reason' => $validated['reason'],
        'type' => $validated['type'],
        'status' => 'pending',
        'amount' => $donation->amount,
    ]);
    
    // Notify admin
    event(new RefundRequested($refund));
    
    return response()->json([
        'success' => true,
        'message' => 'Refund request submitted',
        'refund' => $refund,
    ]);
}
```

---

### 🟤 Priority 7: Notification & Communication

#### 17. Notification Preferences (Detailed)
**Status:** ⚠️ UI EXISTS BUT BASIC  
**What's Needed:**
- Expand `/donor/settings/notifications` section
- Backend Routes:
  - `GET /api/me/notification-preferences`
  - `POST /api/me/notification-preferences`
- Controller: `NotificationPreferenceController`
- Granular controls per category

**Database Migration:**
```php
Schema::create('notification_preferences', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->string('category'); // donation, campaign, charity, system
    $table->boolean('email')->default(true);
    $table->boolean('push')->default(true);
    $table->boolean('sms')->default(false);
    $table->string('frequency')->default('immediate'); // immediate, daily, weekly
    $table->timestamps();
    
    $table->unique(['user_id', 'category']);
});
```

#### 18. Contact Support / Ticketing
**Status:** ❌ MISSING  
**What's Needed:**
- Frontend Page: `/donor/support`
- Backend Routes:
  - `GET /api/support/tickets` - List user's tickets
  - `POST /api/support/tickets` - Create ticket
  - `GET /api/support/tickets/{id}` - View ticket
  - `POST /api/support/tickets/{id}/messages` - Reply
- Controller: `SupportTicketController`
- Database Tables: `support_tickets`, `support_messages`

**Migration:**
```php
Schema::create('support_tickets', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->string('subject');
    $table->text('message');
    $table->enum('status', ['open', 'in_progress', 'resolved', 'closed'])->default('open');
    $table->enum('priority', ['low', 'medium', 'high'])->default('medium');
    $table->foreignId('assigned_to')->nullable()->constrained('users');
    $table->timestamps();
});

Schema::create('support_messages', function (Blueprint $table) {
    $table->id();
    $table->foreignId('ticket_id')->constrained('support_tickets')->onDelete('cascade');
    $table->foreignId('user_id')->constrained();
    $table->text('message');
    $table->boolean('is_staff')->default(false);
    $table->timestamps();
});
```

---

### ⚫ Priority 8: Privacy & Data

#### 19. Data Portability (Download My Data)
**Status:** ❌ MISSING  
**What's Needed:**
- Frontend Link: `/donor/settings/download-data`
- Backend Route: `GET /api/me/export`
- Controller: `DataPortabilityController`
- Export: JSON/CSV with all user data (GDPR compliance)

**Implementation:**
```php
// Backend
public function exportUserData(Request $request)
{
    $user = $request->user();
    
    $data = [
        'profile' => $user->only(['name', 'email', 'phone', 'created_at']),
        'donations' => $user->donations()->with('campaign', 'charity')->get(),
        'followed_charities' => $user->followedCharities()->get(),
        'saved_items' => $user->savedItems()->get(),
        'notification_preferences' => $user->notificationPreferences()->get(),
        'payment_methods' => $user->paymentMethods()->get(),
        'tax_info' => $user->taxInfo,
    ];
    
    return response()->json($data)
        ->header('Content-Disposition', 'attachment; filename="my-data.json"');
}
```

#### 20. Account Deactivation/Reactivate
**Status:** ⚠️ DEACTIVATE EXISTS, NO REACTIVATE  
**What's Needed:**
- Backend Route: `POST /api/me/reactivate`
- UI in `/donor/settings/deactivate` page
- Logic: Mark account as inactive but keep data
- Reactivation: Email verification + password

**Implementation:**
```php
// Backend - Reactivate
public function reactivateAccount(Request $request)
{
    $validated = $request->validate([
        'email' => 'required|email',
        'password' => 'required',
        'token' => 'required', // from email
    ]);
    
    $user = User::where('email', $validated['email'])
        ->where('status', 'deactivated')
        ->first();
    
    if (!$user || !Hash::check($validated['password'], $user->password)) {
        return response()->json(['error' => 'Invalid credentials'], 401);
    }
    
    // Verify token
    if (!$this->verifyReactivationToken($user, $validated['token'])) {
        return response()->json(['error' => 'Invalid token'], 401);
    }
    
    $user->update(['status' => 'active']);
    
    return response()->json([
        'success' => true,
        'message' => 'Account reactivated successfully',
    ]);
}
```

---

### 🟧 Priority 9: UI/UX Improvements

#### 21. Image Error Fallback Handling
**Status:** ❌ MISSING  
**What's Needed:**
- Add `onError` handlers to all `<img>` tags
- Create fallback placeholder components
- Affected files:
  - `CharityProfile.tsx`
  - `CharityCard.tsx`
  - `CampaignCard.tsx`
  - All image-heavy pages

**Implementation:**
```tsx
// Reusable component: src/components/ui/SafeImage.tsx
export function SafeImage({ 
  src, 
  alt, 
  fallback = '/placeholder-charity.png',
  className 
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [error, setError] = useState(false);
  
  useEffect(() => {
    setImgSrc(src);
    setError(false);
  }, [src]);
  
  const handleError = () => {
    if (!error) {
      setImgSrc(fallback);
      setError(true);
    }
  };
  
  return (
    <img 
      src={imgSrc} 
      alt={alt} 
      className={className}
      onError={handleError}
    />
  );
}

// Usage
<SafeImage 
  src={charity.logo_url} 
  alt={charity.name}
  fallback="/placeholder-charity.png"
/>
```

---

## 📋 Implementation Priority Matrix

### 🔴 **Critical (Implement First)**
1. Account Retrieval (Donor & Charity) - Security
2. Change Email Address - Core functionality
3. 2FA Setup - Security requirement
4. Support Ticketing - User assistance

### 🟠 **High Priority (Implement Soon)**
5. Recurring Donations Management - Core feature
6. Payment Methods UI - Already have backend
7. Billing/Tax Info UI - Already have backend
8. Followed Charities Page - Social feature
9. Saved/Bookmarks - User experience

### 🟡 **Medium Priority**
10. Active Sessions Management - Security
11. Notification Preferences - User control
12. Donation History Export - Reporting
13. Annual Statement - Tax/legal
14. Data Portability - GDPR compliance

### 🟢 **Lower Priority**
15. Refund/Dispute - Edge case handling
16. Account Reactivation - Edge case
17. Image Fallbacks - Polish
18. Resend Verification Links - QoL improvement

---

## 📊 Summary Statistics

**Total Features in List:** 21  
**Already Implemented:** 4 (19%)  
**Partially Implemented:** 5 (24%)  
**Missing/Need Implementation:** 12 (57%)  

**Backend Completion:** ~35%  
**Frontend Completion:** ~25%  
**Overall Project Completion:** ~30%

---

## 🎯 Recommended Implementation Roadmap

### Week 1: Critical Security & Account Features
- Day 1-2: Account retrieval (donor + charity)
- Day 3-4: Change email functionality
- Day 5-7: 2FA implementation

### Week 2: Payment & Donation Management
- Day 1-2: Recurring donations UI/CRUD
- Day 3-4: Payment methods UI
- Day 5: Billing/tax info UI
- Day 6-7: Export donation history

### Week 3: Social & Discovery
- Day 1-2: Followed charities page
- Day 3-4: Saved/bookmarks system
- Day 5-7: Support ticketing system

### Week 4: Polish & Compliance
- Day 1-2: Active sessions management
- Day 3-4: Notification preferences UI
- Day 5: Data portability
- Day 6-7: Image fallbacks & final polish

---

## 📝 Quick Start Guide

For each missing feature, follow this pattern:

1. **Create Migration** (if needed)
   ```bash
   php artisan make:migration create_{table_name}_table
   ```

2. **Create Model** (if needed)
   ```bash
   php artisan make:model {ModelName}
   ```

3. **Create Controller**
   ```bash
   php artisan make:controller {FeatureName}Controller
   ```

4. **Add Routes** in `routes/api.php`

5. **Create Frontend Page** in `src/pages/donor/` or `src/pages/auth/`

6. **Add Route** to `src/App.tsx`

7. **Test End-to-End**

---

## ✅ Next Actions

1. **IMMEDIATE:** Wire VerifyEmail and RegistrationStatus pages to App.tsx
2. **THIS WEEK:** Implement account retrieval for donor and charity
3. **THIS MONTH:** Complete all Critical and High Priority features
4. **ONGOING:** Document each feature as you implement

---

**Generated:** November 2, 2025  
**Status:** Ready for Implementation  
**Questions?** Review this document and start with Critical priority items first!
