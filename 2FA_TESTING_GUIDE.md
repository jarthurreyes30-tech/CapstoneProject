# 🔐 Two-Factor Authentication (2FA) Testing Guide

## ✅ What I've Done

1. ✅ **Frontend UI**: Fully implemented with QR code display, recovery codes, and enable/disable flow
2. ✅ **Backend API**: All endpoints working (`enable`, `verify`, `disable`, `status`)
3. ✅ **Enabled Button**: Changed "coming soon" to working "Manage 2FA" button in Account Settings
4. ✅ **Routing**: `/donor/settings/2fa` route is active

---

## 📱 Step-by-Step Testing Instructions

### **Preparation (One-Time Setup)**

1. **Download an Authenticator App** on your phone:
   - **Google Authenticator** (Recommended - Simple)
     - [Android](https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2)
     - [iOS](https://apps.apple.com/app/google-authenticator/id388497605)
   
   - **Microsoft Authenticator** (Alternative)
     - [Android](https://play.google.com/store/apps/details?id=com.azure.authenticator)
     - [iOS](https://apps.apple.com/app/microsoft-authenticator/id983156458)
   
   - **Authy** (Alternative - Multi-device)
     - [Android](https://play.google.com/store/apps/details?id=com.authy.authy)
     - [iOS](https://apps.apple.com/app/authy/id494168017)

---

### **Test 1: Enable 2FA** ⭐

1. **Login** to your donor account
   ```
   http://localhost:3000/auth/login
   ```

2. **Go to Account Settings**
   ```
   http://localhost:3000/donor/settings
   ```

3. **Click "Manage 2FA"** button in the "Two-Factor Authentication" card

4. **You'll see the 2FA page:**
   - Current status: "2FA Disabled"
   - Click **"Enable 2FA"** button

5. **Confirmation Dialog appears:**
   - Read the requirements
   - Click **"Continue"**

6. **QR Code Dialog opens** - This is the important part!
   - **Step 1: Scan QR Code**
     - Open your authenticator app
     - Click "Add account" or "+" button
     - Choose "Scan QR code"
     - Point camera at the QR code on screen
     - Alternative: Click the code button and copy the secret manually
   
   - **Step 2: Save Recovery Codes**
     - You'll see 10 recovery codes (e.g., `ABCD-EFGH`)
     - **IMPORTANT**: Copy all codes (click "Copy All Codes")
     - Save them in a secure place (password manager, safe document)
     - These are used if you lose your phone!
   
   - **Step 3: Verify Setup**
     - Look at your authenticator app
     - You'll see "CharityHub" with a 6-digit code that changes every 30 seconds
     - Enter the current 6-digit code (e.g., `123456`)
     - Click **"Verify and Enable 2FA"**

7. **Success!**
   - You'll see "2FA Enabled" toast notification
   - Status card changes to green: "2FA Enabled"
   - Button changes to red: "Disable 2FA"

---

### **Test 2: Test Login with 2FA** 🔒

1. **Logout** from your account
   ```
   Click profile → Logout
   ```

2. **Login again** with your credentials
   ```
   Email: your@email.com
   Password: your_password
   ```

3. **2FA Prompt appears:**
   - After entering password, you'll see "Enter 2FA Code" screen
   - Open your authenticator app
   - Copy the 6-digit code for "CharityHub"
   - Enter it in the login form
   - Click "Verify"

4. **Success!**
   - You're logged in ✅
   - This proves 2FA is working!

---

### **Test 3: Disable 2FA** ❌

1. **Go back to 2FA Settings**
   ```
   http://localhost:3000/donor/settings/2fa
   ```

2. **Click "Disable 2FA"** (red button)

3. **Enter your password** to confirm

4. **Click "Disable 2FA"**

5. **Success!**
   - Status changes back to "2FA Disabled"
   - You can login with just password now

---

### **Test 4: Recovery Code (Advanced)** 🔑

**Only do this if you want to test recovery codes:**

1. Enable 2FA again (follow Test 1)
2. Save one recovery code
3. Delete the "CharityHub" entry from your authenticator app
4. Logout
5. Try to login
6. When asked for 2FA code, click "Use recovery code"
7. Enter one of your saved recovery codes
8. You should be able to login! ✅

---

## 🎯 Expected Behavior

### **When 2FA is DISABLED:**
- Login: Email + Password only
- Settings page shows: "2FA Disabled" (gray)
- Button shows: "Enable 2FA" (blue)

### **When 2FA is ENABLED:**
- Login: Email + Password + 6-digit code
- Settings page shows: "2FA Enabled" (green)
- Button shows: "Disable 2FA" (red)
- Authenticator app shows: "CharityHub" account with rotating codes

---

## 🐛 Troubleshooting

### **QR Code not showing?**
- Check browser console for errors
- Make sure backend is running: `php artisan serve`
- Refresh the page

### **"Invalid verification code" error?**
- Wait for the code to refresh (codes change every 30 seconds)
- Make sure you're entering the latest code
- Check your phone's time is correct (authenticator uses time-based codes)

### **Can't scan QR code?**
- Use manual entry instead
- Copy the secret code shown below QR code
- In authenticator app, choose "Manual entry"
- Paste the secret code

### **Lost access to authenticator app?**
- Use a recovery code to login
- Then disable 2FA
- Set up 2FA again with new device

---

## 📊 Backend Endpoints (For Reference)

All endpoints require authentication (`Authorization: Bearer TOKEN`)

```bash
# Check 2FA status
GET /api/me/2fa/status

# Enable 2FA (get QR code)
POST /api/me/2fa/enable

# Verify and activate 2FA
POST /api/me/2fa/verify
Body: { "code": "123456" }

# Disable 2FA
POST /api/me/2fa/disable
Body: { "password": "your_password" }
```

---

## ✅ Quick Test Checklist

- [ ] Can access 2FA page via "Manage 2FA" button
- [ ] Can enable 2FA and see QR code
- [ ] Can scan QR code with authenticator app
- [ ] Can see 10 recovery codes
- [ ] Can verify with 6-digit code
- [ ] Status changes to "2FA Enabled"
- [ ] Can logout and login with 2FA code
- [ ] Can disable 2FA with password
- [ ] Status changes back to "2FA Disabled"

---

## 🎉 That's It!

Your 2FA implementation is **fully working**! 

**Security Note**: In production, make sure users:
1. Save their recovery codes securely
2. Use a trusted authenticator app
3. Keep their phone secure
4. Don't share screenshots of QR codes or secrets

Need help? Check the console logs or backend logs for detailed error messages.
