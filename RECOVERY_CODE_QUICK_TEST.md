# 🧪 Recovery Code Login - Quick Test Guide

## ⚡ 5-Minute Test

### Prerequisites
- ✅ Backend running
- ✅ Frontend running
- ✅ Test account with 2FA enabled

---

## 🎯 Test Scenario 1: Enable 2FA & Save Codes

**Duration: 2 minutes**

1. **Login to test account**
   ```
   Email: donor@example.com (or your test account)
   Password: your_password
   ```

2. **Navigate to Security Settings**
   - Donors: `/donor/settings` → Security tab
   - Charity: `/charity/settings` → Security section

3. **Enable 2FA**
   - Click "Enable 2FA"
   - Scan QR code with Google Authenticator
   - Enter 6-digit code
   - **IMPORTANT: Save the recovery codes!**

4. **Copy/Download Codes**
   - You'll see 10 codes like:
     ```
     T0OI-KK0I
     RLRT-WTLH
     M9M1-7J7J
     ...
     ```
   - Copy them to a text file
   - Or click "Download"

**✅ Expected Result:**
- 2FA enabled successfully
- Recovery codes displayed
- Can copy/download codes

---

## 🎯 Test Scenario 2: Login with TOTP (Normal Flow)

**Duration: 30 seconds**

1. **Logout**
   - Click profile → Logout

2. **Login again**
   - Enter email and password
   - Click "Sign in"

3. **2FA Prompt appears**
   - See 6-digit input field
   - Label: "Two-Factor Code"
   - Icon: Shield

4. **Enter TOTP code**
   - Open Google Authenticator
   - Enter current 6-digit code
   - Click "Sign in"

**✅ Expected Result:**
- Login successful
- Redirected to dashboard
- No warnings shown

---

## 🎯 Test Scenario 3: Login with Recovery Code

**Duration: 1 minute**

1. **Logout again**

2. **Start login**
   - Enter email and password
   - 2FA prompt appears

3. **Click toggle link**
   - Click "Can't access your app? Use a recovery code"

4. **UI Changes**
   - Input changes to "XXXX-XXXX" format
   - Label: "Recovery Code"
   - Icon: Key
   - Helper text: "Enter one of your backup recovery codes"

5. **Enter recovery code**
   - Type one of your saved codes (e.g., `T0OI-KK0I`)
   - Click "Sign in"

**✅ Expected Result:**
- Login successful ✅
- Success toast: "You have 9 recovery codes remaining"
- Redirected to dashboard

---

## 🎯 Test Scenario 4: Verify Code Cannot Be Reused

**Duration: 1 minute**

1. **Logout**

2. **Try to login with same recovery code**
   - Enter email and password
   - Toggle to recovery code mode
   - Enter the SAME code you just used

3. **Click "Sign in"**

**✅ Expected Result:**
- ❌ Error message: "Invalid or already used recovery code"
- Login fails
- Can try again with different code

---

## 🎯 Test Scenario 5: Low Codes Warning

**Duration: 1 minute**

**To test this quickly:**

1. **Use 7 more recovery codes**
   - Repeat Scenario 3 with different codes
   - Use codes until you have 3 left

2. **Use 8th code**
   - Login with recovery code
   - **Watch for warning!**

**✅ Expected Result:**
- Login succeeds
- Success toast appears
- **Warning toast appears:**
  ```
  ⚠️ Recovery Codes Running Low
  You have only 2 recovery codes remaining. 
  Consider generating new codes in your security settings.
  ```

---

## 🎯 Test Scenario 6: All Codes Used

**Duration: 1 minute**

1. **Use remaining 2 codes**
   - Login with recovery codes

2. **Use final (10th) code**
   - Login with last recovery code

**✅ Expected Result:**
- Login succeeds
- **Critical warning appears:**
  ```
  🔴 Recovery Codes Depleted
  You have used all your recovery codes. 
  Please generate new codes immediately in your security settings.
  ```
- Warning stays for 8 seconds

---

## 🎯 Test Scenario 7: Toggle Between Modes

**Duration: 30 seconds**

1. **Start login with 2FA prompt**

2. **Enter partial TOTP code**
   - Type "12" in TOTP field

3. **Click toggle**
   - "Use a recovery code"

4. **Verify:**
   - Input cleared
   - Format changed to XXXX-XXXX
   - Label changed to "Recovery Code"

5. **Toggle back**
   - "Use authenticator app instead"

6. **Verify:**
   - Input cleared again
   - Format changed to 000000
   - Label changed to "Two-Factor Code"

**✅ Expected Result:**
- Smooth transitions
- Input clears on each toggle
- UI updates correctly

---

## 🎯 Test Scenario 8: Invalid Recovery Code

**Duration: 30 seconds**

1. **Login to 2FA prompt**

2. **Toggle to recovery mode**

3. **Enter fake code**
   - `FAKE-CODE`

4. **Click "Sign in"**

**✅ Expected Result:**
- Error: "Invalid or already used recovery code"
- Login fails
- Can try again

---

## 🎯 Test Scenario 9: Case Insensitive

**Duration: 30 seconds**

1. **Login to 2FA prompt**

2. **Toggle to recovery mode**

3. **Enter code in lowercase**
   - If code is `T0OI-KK0I`
   - Type `t0oi-kk0i` (lowercase)

4. **Click "Sign in"**

**✅ Expected Result:**
- Login succeeds! ✅
- Backend converts to uppercase
- Case doesn't matter

---

## 🎯 Test Scenario 10: Dark Mode

**Duration: 30 seconds**

1. **Switch to dark mode**
   - Toggle theme in settings

2. **Go through login flow**
   - Login with recovery code

3. **Verify:**
   - All elements visible
   - Colors appropriate
   - No white flashes
   - Info alerts readable

**✅ Expected Result:**
- Everything works in dark mode
- Professional appearance
- Good contrast

---

## 🎯 Test Scenario 11: Mobile Responsive

**Duration: 30 seconds**

1. **Open in mobile view**
   - Browser DevTools → Toggle device
   - Or use real phone

2. **Go through login**
   - Enter credentials
   - Toggle recovery mode
   - Enter code

3. **Verify:**
   - Toggle button accessible
   - Input fields usable
   - Text readable
   - Buttons not cut off

**✅ Expected Result:**
- Fully functional on mobile
- No layout issues
- Easy to use

---

## 🎯 Test Scenario 12: Both Roles

**Duration: 2 minutes**

### Test as Donor
1. ✅ Enable 2FA
2. ✅ Login with recovery code
3. ✅ See warnings

### Test as Charity Admin
1. ✅ Enable 2FA
2. ✅ Login with recovery code
3. ✅ See warnings

**✅ Expected Result:**
- Identical experience for both roles
- Same UI
- Same warnings
- Same functionality

---

## 📋 Complete Checklist

Use this checklist to verify everything works:

### Backend
- [ ] Recovery code format detected automatically
- [ ] TOTP codes still work
- [ ] Recovery codes work for login
- [ ] Used codes cannot be reused
- [ ] Case insensitive matching
- [ ] Spaces trimmed from input
- [ ] Remaining count accurate
- [ ] Warning at 3 or fewer codes
- [ ] Critical warning at 0 codes
- [ ] Logs show recovery code usage

### Frontend
- [ ] Toggle button appears
- [ ] Toggle switches input format
- [ ] TOTP input: 6 digits only
- [ ] Recovery input: 9 chars max
- [ ] Recovery input: uppercase
- [ ] Labels update correctly
- [ ] Icons update correctly
- [ ] Helper text updates
- [ ] Info alerts update
- [ ] Success toasts show
- [ ] Warning toasts show
- [ ] Dark mode works
- [ ] Light mode works
- [ ] Mobile responsive
- [ ] No console errors

### Integration
- [ ] Login with TOTP works
- [ ] Login with recovery works
- [ ] Cannot reuse codes
- [ ] Warnings appear when low
- [ ] Works for donors
- [ ] Works for charity admins
- [ ] No breaking changes
- [ ] Existing 2FA unaffected

---

## 🐛 Common Issues

### Toggle doesn't appear
**Fix:** Clear browser cache, restart dev server

### Recovery code rejected
**Check:** 
- Format is XXXX-XXXX
- Code hasn't been used
- User has 2FA enabled

### No warnings shown
**Check:**
- Browser console for errors
- Backend response includes metadata
- Frontend handling response correctly

### Dark mode issues
**Fix:**
- Check Tailwind dark: classes
- Verify theme provider working

---

## ✅ Success Criteria

**All tests pass when:**
- ✅ TOTP login works
- ✅ Recovery code login works
- ✅ Cannot reuse codes
- ✅ Warnings appear appropriately
- ✅ Both roles work identically
- ✅ Dark/light modes work
- ✅ Mobile responsive
- ✅ No errors in console/logs

---

## 🚀 Ready to Deploy!

**If all tests pass:**
1. ✅ Commit changes
2. ✅ Push to staging
3. ✅ Test on staging
4. ✅ Deploy to production

**Congratulations! Recovery code login is fully functional! 🎉**

---

*Quick Test Guide - November 7, 2025*
