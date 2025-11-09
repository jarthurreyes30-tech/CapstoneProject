# 🚀 Quick Start Guide - Testing All Features

## ✅ SERVERS RUNNING

**Backend:** ✅ Running on `http://localhost:8000`  
**Frontend:** ✅ Running on `http://localhost:8081`

---

## 🧪 QUICK TEST GUIDE

### Feature 1: Recurring Donations Management

**Test URL:** `http://localhost:8081/donor/recurring`

**Steps:**
1. Login as a donor with recurring donations
2. You should see a list of all recurring donations
3. Click **"Edit"** button on any donation
4. Change the amount (e.g., from ₱100 to ₱200)
5. Change the frequency (e.g., from monthly to weekly)
6. Click "Save Changes"
7. ✅ Verify success message
8. ✅ Verify donation updated in list

**Test Pause/Resume:**
1. Click **"Pause"** on an active donation
2. ✅ Verify status changes to "Paused"
3. Click **"Resume"** on the paused donation
4. ✅ Verify status changes to "Active"

**Test Cancel:**
1. Click **"Cancel"** on any donation
2. Confirm the cancellation
3. ✅ Verify status changes to "Cancelled"

---

### Feature 2: Account Deactivation

**Test URL:** `http://localhost:8081/donor/settings`

**Steps:**
1. Login as donor
2. Navigate to Account Settings
3. Click **"Danger Zone"** tab
4. Find the **"Deactivate Account"** card (yellow styling)
5. Click **"Deactivate My Account"**
6. Enter optional reason
7. Click "Deactivate Account"
8. ✅ Verify you're logged out
9. ✅ Verify profile is hidden

**Test Reactivation:**
1. Login again with same credentials
2. ✅ Verify account automatically reactivated
3. ✅ Verify all data is restored

---

### Feature 3: Donor Account Retrieval

**Test URL:** `http://localhost:8081/auth/retrieve/donor`

**Steps:**
1. First, deactivate a donor account
2. Logout
3. Navigate to `/auth/retrieve/donor`
4. Enter the deactivated email
5. Enter reason: "I want to continue supporting charities"
6. Click "Submit Request"
7. ✅ Verify success page shown
8. ✅ Verify confirmation email sent
9. Login as admin
10. Approve the request
11. ✅ Verify donor can login again

---

### Feature 4: Charity Account Retrieval

**Test URL:** `http://localhost:8081/auth/retrieve/charity`

**Steps:**
1. First, deactivate a charity account
2. Logout
3. Navigate to `/auth/retrieve/charity`
4. Enter the deactivated email
5. Enter organization name
6. Enter reason: "We want to resume our campaigns"
7. Click "Submit Reactivation Request"
8. ✅ Verify success page shown
9. ✅ Verify confirmation email sent
10. Login as admin
11. Approve the request
12. ✅ Verify charity can login again

---

### Feature 5: Fund Tracking

**Test as Charity:**
1. Login as charity admin
2. Navigate to a completed campaign
3. Click "Log Fund Usage"
4. Fill in:
   - Amount: ₱5000
   - Category: Supplies
   - Description: Medical supplies
   - Upload receipt (optional)
5. Click "Submit"
6. ✅ Verify fund log created
7. ✅ Verify donors notified

**Test as Public:**
1. Navigate to campaign page
2. Click "View Fund Usage"
3. ✅ Verify public can see spending breakdown

---

### Feature 6: Document Verification (Backend Ready)

**Test as Admin:**
1. Login as admin
2. View pending charity documents
3. Reject a document with reason
4. ✅ Verify `rejected_at` timestamp set
5. ✅ Verify `can_resubmit_at` set to 3-5 days from now
6. ✅ Verify email sent to charity

**Test as Charity:**
1. Login as charity
2. Try to resubmit immediately
3. ✅ Should be blocked until resubmission date
4. After date passes (or manually update DB)
5. ✅ Can resubmit successfully

---

## 🔍 VERIFICATION POINTS

### Check These During Testing:

**Browser Console:**
- [ ] No JavaScript errors
- [ ] API calls successful (200 status)
- [ ] No CORS errors

**Network Tab:**
- [ ] API endpoints responding correctly
- [ ] Proper request/response format
- [ ] Authentication tokens working

**Backend Logs:**
- [ ] Check `capstone_backend/storage/logs/laravel.log`
- [ ] No PHP errors
- [ ] Email notifications logged

**Database:**
- [ ] Check `recurring_donations` table for updates
- [ ] Check `account_retrieval_requests` table
- [ ] Check `charity_documents` table for rejection fields
- [ ] Check `fund_usage_logs` table

---

## 📊 FEATURE CHECKLIST

### Recurring Donations
- [ ] List displays correctly
- [ ] Edit amount works
- [ ] Edit frequency works
- [ ] Pause works
- [ ] Resume works
- [ ] Cancel works
- [ ] Email notifications sent

### Account Management
- [ ] Deactivation works
- [ ] Reactivation works
- [ ] Donor retrieval works
- [ ] Charity retrieval works
- [ ] Profile hidden when deactivated
- [ ] Data restored when reactivated

### Fund Tracking
- [ ] Charity can log fund usage
- [ ] Public can view spending
- [ ] Donors receive notifications
- [ ] Admins receive notifications
- [ ] Attachments upload correctly

### Document Verification
- [ ] Rejection sets 3-5 day wait
- [ ] Rejection reason stored
- [ ] Email sent with details
- [ ] Resubmission blocked until date
- [ ] Resubmission allowed after date

---

## 🐛 TROUBLESHOOTING

### If Frontend Won't Load:
```bash
cd capstone_frontend
npm install
npm run dev
```

### If Backend Has Errors:
```bash
cd capstone_backend
composer install
php artisan cache:clear
php artisan config:clear
php artisan migrate
php artisan serve
```

### If Database Issues:
```bash
php artisan migrate:fresh --seed
```

### If Routes Not Found:
```bash
php artisan route:clear
php artisan route:cache
```

---

## 📧 EMAIL TESTING

If emails aren't sending, check:
1. `.env` file has correct mail configuration
2. Use Mailtrap or similar for testing
3. Check `storage/logs/laravel.log` for mail errors

---

## ✅ ALL FEATURES READY

**Status:** All features implemented and servers running!

**Next:** Start testing each feature using the steps above.

**Documentation:**
- `FINAL_STATUS_REPORT.md` - Complete implementation summary
- `VERIFICATION_CHECKLIST.md` - Detailed test cases
- `COMPLETE_IMPLEMENTATION_SUMMARY.md` - Technical details

---

**Happy Testing! 🎉**
