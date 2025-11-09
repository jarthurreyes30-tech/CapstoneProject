# Quick Start Testing Guide
**Last Updated:** November 6, 2025

---

## 🚀 How to Start Testing RIGHT NOW

### Step 1: Start the Backend (Terminal 1)
```bash
cd c:\Users\ycel_\Final\capstone_backend
php artisan serve
```
**Expected Output:** `Laravel development server started: http://127.0.0.1:8000`

### Step 2: Start the Frontend (Terminal 2)
```bash
cd c:\Users\ycel_\Final\capstone_frontend
npm run dev
```
**Expected Output:** `Local: http://localhost:5173/`

### Step 3: Open Browser
Navigate to: **http://localhost:5173**

---

## 🧪 Quick Tests (5 Minutes)

### Test 1: Can You See the Landing Page?
- ✅ Page loads
- ✅ No console errors (F12 → Console)
- ✅ All images load
- ✅ Buttons are clickable

### Test 2: Can You Register?
1. Click "Register" or "Sign Up"
2. Fill in the form
3. Submit
4. ✅ Should redirect to dashboard or show success

### Test 3: Can You Login?
1. Click "Login"
2. Enter credentials
3. Submit
4. ✅ Should redirect to dashboard

### Test 4: Can You See Notifications?
1. Login as any user
2. Navigate to Notifications page
3. ✅ Page loads without errors
4. ✅ Notifications display (if any)
5. ✅ "Mark as Read" button works
6. ✅ "Delete" button works

### Test 5: Can You Make a Donation? (CRITICAL)
1. Login as donor
2. Go to "Make Donation" page
3. Select charity and campaign
4. Enter amount: **2,070**
5. Upload a receipt image
6. ✅ OCR should scan and detect amount
7. ✅ Amount validation should pass
8. Submit donation
9. ✅ Success message appears
10. ✅ Check notifications - should have confirmation

---

## 🔍 What to Look For

### ✅ Good Signs
- Pages load quickly (< 3 seconds)
- No red errors in console
- Buttons respond when clicked
- Forms submit successfully
- Data displays correctly
- Notifications appear

### ❌ Bad Signs
- White screen of death
- Console errors (red text)
- Buttons don't respond
- Forms don't submit
- 404 errors
- Infinite loading spinners

---

## 🐛 Common Issues & Quick Fixes

### Issue: "Cannot connect to backend"
**Fix:**
```bash
# Make sure backend is running
cd capstone_backend
php artisan serve
```

### Issue: "Page not found (404)"
**Fix:**
```bash
# Make sure frontend is running
cd capstone_frontend
npm run dev
```

### Issue: "Database connection error"
**Fix:**
```bash
# Check database is running
# Check .env file has correct DB credentials
cd capstone_backend
php artisan migrate:status
```

### Issue: "Blank page / White screen"
**Fix:**
1. Open browser console (F12)
2. Look for errors
3. Check if API_URL is correct in frontend .env

### Issue: "OCR not working"
**Fix:**
1. Make sure you're uploading an image (JPG/PNG)
2. Image should contain visible text/numbers
3. Check console for errors

---

## 📝 Testing Checklist (Print This)

### Basic Functionality
- [ ] Landing page loads
- [ ] Can register new account
- [ ] Can login
- [ ] Can logout
- [ ] Can view dashboard

### Donor Features
- [ ] Can view campaigns
- [ ] Can make donation
- [ ] OCR scanning works
- [ ] Can view donation history
- [ ] Can view notifications
- [ ] Can follow charities

### Charity Features
- [ ] Can create campaign
- [ ] Can edit campaign
- [ ] Can post updates
- [ ] Can view donations received
- [ ] Can view notifications

### Admin Features
- [ ] Can view pending verifications
- [ ] Can approve/reject charities
- [ ] Can view all users
- [ ] Can view all donations

---

## 🎯 Priority Testing Order

### 1. Critical (Test First)
1. User authentication (login/register)
2. Donation flow with OCR
3. Notification system
4. Campaign viewing

### 2. Important (Test Second)
1. Campaign creation
2. Charity verification
3. Profile updates
4. Fund usage logging

### 3. Nice to Have (Test Last)
1. Social features
2. Messaging
3. Analytics
4. Export functions

---

## 📞 Where to Report Issues

### Found a Bug?
1. Note the page URL
2. Note what you were doing
3. Screenshot the error
4. Check browser console (F12)
5. Add to **MANUAL_TESTING_CHECKLIST.md**

### Need Help?
1. Check **SYSTEM_DIAGNOSTIC_REPORT.md**
2. Check **DIAGNOSTIC_SUMMARY.md**
3. Look for similar issues in documentation

---

## 🎉 Success Criteria

### System is Working If:
- ✅ All pages load without errors
- ✅ Can complete a full donation
- ✅ OCR scans receipts correctly
- ✅ Notifications appear and work
- ✅ Can create and manage campaigns
- ✅ Admin can verify charities

### System Needs Work If:
- ❌ Pages show errors
- ❌ Buttons don't work
- ❌ Forms don't submit
- ❌ Data doesn't display
- ❌ Features are broken

---

## 🔧 Emergency Commands

### Reset Everything
```bash
# Backend
cd capstone_backend
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Frontend
cd capstone_frontend
npm run build
```

### Check System Status
```bash
# Backend routes
cd capstone_backend
php artisan route:list

# Database status
php artisan migrate:status

# Frontend build
cd capstone_frontend
npm run build
```

---

## ⏱️ Time Estimates

| Task | Time |
|------|------|
| Quick smoke test | 5 minutes |
| Basic functionality test | 15 minutes |
| Complete donor flow | 30 minutes |
| Complete charity flow | 30 minutes |
| Complete admin flow | 20 minutes |
| **Full system test** | **2 hours** |

---

## 📚 Reference Documents

1. **MANUAL_TESTING_CHECKLIST.md** - Detailed testing checklist
2. **SYSTEM_DIAGNOSTIC_REPORT.md** - Complete system audit
3. **DIAGNOSTIC_SUMMARY.md** - Executive summary
4. **CAMPAIGN_COMPLETION_SYSTEM.md** - New feature docs
5. **NOTIFICATION_SYSTEM_COMPLETE.md** - Notification docs

---

## 🎯 Today's Goal

**Complete at least:**
- ✅ Basic smoke test (5 min)
- ✅ Donor donation flow (30 min)
- ✅ Notification system test (15 min)

**Total Time:** ~50 minutes

**Start Now!** 🚀

---

**Remember:** The backend is 100% ready. We're just testing if the frontend connects properly and all features work as expected!
