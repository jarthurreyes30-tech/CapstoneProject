# Profile Edit Testing Guide

## 🚀 Quick Start

### Prerequisites
- ✅ Backend running on `http://localhost:8000`
- ⏭️ Frontend needs to be started on `http://localhost:5173`
- ✅ Database migration completed

### Start Frontend (if not running)
```bash
cd capstone_frontend
npm run dev
```

---

## 📋 Testing Checklist

### TEST 1: DONOR PROFILE EDIT ✅

#### Setup:
1. Open browser to `http://localhost:5173`
2. Login with a **donor** account
3. Navigate to **Edit Profile** page

#### Fields to Test:

| Field | Action | Expected Result |
|-------|--------|-----------------|
| **Name** | Edit to "John Doe Updated" | ✅ Saves successfully |
| **Display Name** (NEW) | Enter "JohnD" | ✅ Saves successfully |
| **Email** | Try to edit | ❌ Should be disabled/read-only |
| **Phone** | Enter "09123456789" | ✅ Saves successfully |
| **Address** | Enter "123 Main St, Manila" | ✅ Saves successfully |
| **Location** (NEW) | Enter "Manila, NCR" | ✅ Saves successfully |
| **Bio** (NEW) | Enter "I love helping charities" | ✅ Saves successfully |
| **Interests** (NEW) | Select "Education", "Health" | ✅ Saves as JSON array |
| **Profile Image** | Upload a JPG/PNG (< 2MB) | ✅ Uploads and displays |

#### Validation Tests:
- [ ] Bio character counter shows correct count (max 500)
- [ ] Image upload rejects files > 2MB
- [ ] Image upload rejects non-image files
- [ ] Success toast appears after save
- [ ] All fields persist after page reload
- [ ] Unsaved changes warning appears when navigating away

#### API Test:
```javascript
// Check in browser console after save
fetch('http://localhost:8000/api/me', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Accept': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log(data))
```

Expected response should include:
```json
{
  "id": 1,
  "name": "John Doe Updated",
  "display_name": "JohnD",
  "email": "john@example.com",
  "phone": "09123456789",
  "address": "123 Main St, Manila",
  "location": "Manila, NCR",
  "bio": "I love helping charities",
  "interests": ["Education", "Health"],
  "profile_image": "profile_images/xxx.jpg"
}
```

---

### TEST 2: CHARITY ADMIN PROFILE EDIT ✅

#### Setup:
1. Logout from donor account
2. Login with a **charity admin** account
3. Navigate to **Edit Profile** page

#### Fields to Test:

| Field | Action | Expected Result |
|-------|--------|-----------------|
| **Mission** | Enter 50+ chars | ✅ Saves successfully |
| **Vision** | Enter text | ✅ Saves successfully |
| **Description** | Enter 100+ chars | ✅ Saves successfully |
| **Logo** | Upload image | ✅ Uploads and previews |
| **Cover Image** | Upload image | ✅ Uploads and previews |
| **Street Address** | Enter "456 Charity Ave" | ✅ Saves successfully |
| **Barangay** | Enter "Barangay 1" | ✅ Saves successfully |
| **City** | Select from dropdown | ✅ Saves successfully |
| **Province** | Select from dropdown | ✅ Saves successfully |
| **Region** | Select from dropdown | ✅ Saves successfully |
| **First Name** | Enter "Maria" | ✅ Saves successfully |
| **Middle Initial** | Enter "C" | ✅ Saves successfully |
| **Last Name** | Enter "Santos" | ✅ Saves successfully |
| **Contact Email** | Enter valid email | ✅ Saves successfully |
| **Contact Phone** | Enter "09987654321" | ✅ Saves successfully |

#### Validation Tests:
- [ ] Mission requires min 30 characters
- [ ] Description requires min 50 characters
- [ ] Word counters display correctly
- [ ] Phone validation accepts 09XXXXXXXXX format
- [ ] Phone validation accepts +639XXXXXXXXX format
- [ ] Email validation works
- [ ] Image drag & drop works
- [ ] Image preview shows before upload
- [ ] Success toast appears after save
- [ ] All fields persist after page reload

#### API Test:
```javascript
// Check charity profile
fetch('http://localhost:8000/api/me', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Accept': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log(data.charity))
```

---

### TEST 3: SYSTEM ADMIN PROFILE EDIT ✅

#### Setup:
1. Logout from charity admin account
2. Login with a **system admin** account
3. Navigate to **Profile** page
4. Click **"Edit Profile"** button

#### Fields to Test:

| Field | Action | Expected Result |
|-------|--------|-----------------|
| **Name** | Edit to "Admin User" | ✅ Saves successfully |
| **Email** | Try to edit | ❌ Should be disabled |
| **Phone** | Enter "09111222333" | ✅ Saves successfully |

#### Validation Tests:
- [ ] Email field is visually disabled (grayed out)
- [ ] Email field cannot be clicked/edited
- [ ] Edit mode toggles correctly
- [ ] Cancel button reverts changes
- [ ] Save button triggers API call
- [ ] Success toast appears after save
- [ ] Page reloads after successful save
- [ ] Changes persist after reload

#### API Test:
```javascript
// Test admin profile update
fetch('http://localhost:8000/api/me', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    name: 'Admin User Updated',
    phone: '09111222333'
  })
})
.then(r => r.json())
.then(data => console.log(data))
```

---

## 🔍 Detailed Test Scenarios

### Scenario 1: New Donor Fields Work
**Goal:** Verify new donor fields (display_name, location, bio, interests) save correctly

**Steps:**
1. Login as donor
2. Go to Edit Profile
3. Fill in:
   - Display Name: "TestDonor123"
   - Location: "Quezon City, Metro Manila"
   - Bio: "Passionate about education and healthcare initiatives"
   - Interests: Select "Education", "Health", "Children & Youth"
4. Click Save
5. Reload page
6. Verify all fields still show the entered values

**Expected:** All new fields persist ✅

---

### Scenario 2: Charity Profile Images Upload
**Goal:** Verify logo and cover image upload works

**Steps:**
1. Login as charity admin
2. Go to Edit Profile
3. Upload logo (test with 500KB image)
4. Upload cover image (test with 1MB image)
5. Verify previews show
6. Click Save
7. Reload page
8. Verify images still display

**Expected:** Images upload and persist ✅

---

### Scenario 3: Admin Cannot Change Email
**Goal:** Verify email security

**Steps:**
1. Login as admin
2. Go to Profile
3. Click Edit Profile
4. Try to click email field
5. Try to type in email field

**Expected:** Email field is disabled and cannot be edited ✅

---

### Scenario 4: Validation Errors Display
**Goal:** Verify validation works

**Steps:**
1. Login as charity admin
2. Go to Edit Profile
3. Enter mission with only 10 characters
4. Click Save
5. Verify error message appears
6. Enter mission with 50+ characters
7. Click Save
8. Verify success

**Expected:** Validation errors show, then save succeeds ✅

---

## 🐛 Common Issues & Solutions

### Issue 1: "Column not found: bio"
**Solution:** Run migration again
```bash
cd capstone_backend
php artisan migrate
```

### Issue 2: "Interests not saving"
**Solution:** Check browser console for errors. Interests should be sent as JSON string.

### Issue 3: "Admin save not working"
**Solution:** Check browser console. Token should be valid. Page should reload after save.

### Issue 4: "Images not uploading"
**Solution:** 
- Check file size (< 2MB)
- Check file type (JPG, PNG, JPEG only)
- Check storage permissions

### Issue 5: "Changes not persisting"
**Solution:**
- Check network tab for API response
- Verify token is valid
- Check Laravel logs: `storage/logs/laravel.log`

---

## 📊 Test Results Template

Copy and fill this out as you test:

```
DONOR PROFILE EDIT TEST
Date: ___________
Tester: ___________

✅ / ❌  Name field edits and saves
✅ / ❌  Display name field edits and saves (NEW)
✅ / ❌  Phone field edits and saves
✅ / ❌  Address field edits and saves
✅ / ❌  Location field edits and saves (NEW)
✅ / ❌  Bio field edits and saves (NEW)
✅ / ❌  Interests select and save (NEW)
✅ / ❌  Profile image uploads
✅ / ❌  Email is read-only
✅ / ❌  Changes persist after reload
✅ / ❌  Validation works correctly
✅ / ❌  Character counters work

CHARITY ADMIN PROFILE EDIT TEST
Date: ___________
Tester: ___________

✅ / ❌  Mission edits and saves
✅ / ❌  Vision edits and saves
✅ / ❌  Description edits and saves
✅ / ❌  Logo uploads
✅ / ❌  Cover image uploads
✅ / ❌  Location fields save
✅ / ❌  Contact info saves
✅ / ❌  Changes persist after reload
✅ / ❌  Validation works correctly
✅ / ❌  Word counters work

SYSTEM ADMIN PROFILE EDIT TEST
Date: ___________
Tester: ___________

✅ / ❌  Name field edits and saves
✅ / ❌  Phone field edits and saves
✅ / ❌  Email is disabled
✅ / ❌  Save button works
✅ / ❌  Page reloads after save
✅ / ❌  Changes persist after reload
```

---

## 🎯 Success Criteria

All tests pass when:
- ✅ All editable fields can be modified
- ✅ All changes save to database
- ✅ All changes persist after page reload
- ✅ Validation errors display correctly
- ✅ Success messages appear
- ✅ Read-only fields cannot be edited
- ✅ Images upload and display correctly
- ✅ No console errors
- ✅ No network errors

---

## 📝 Notes

- Test with different browsers (Chrome, Firefox, Edge)
- Test with different image sizes
- Test with invalid data to verify validation
- Test with slow network to verify loading states
- Check browser console for any errors
- Check network tab for API responses

---

## ✅ Final Checklist

Before marking as complete:
- [ ] All three roles tested
- [ ] All fields tested for each role
- [ ] Validation tested
- [ ] Images tested (where applicable)
- [ ] Changes persist after reload
- [ ] No console errors
- [ ] No network errors
- [ ] Documentation reviewed
- [ ] Test results recorded

---

**Happy Testing! 🎉**
