# 🧪 QUICK TEST GUIDE - Email Verification System

**Run these commands to test the complete email verification flow**

---

## 🚀 START SERVERS

### Backend (Terminal 1):
```bash
cd capstone_backend
php artisan serve
```

### Queue Worker (Terminal 2):
```bash
cd capstone_backend
php artisan queue:work
```

### Frontend (Terminal 3):
```bash
cd capstone_frontend
npm run dev
```

---

## 🧪 MANUAL FRONTEND TEST

### 1. Open Browser
```
http://localhost:5173/auth/register/donor
```

### 2. Fill Form (only 3 fields!)
- **Name:** Test User
- **Email:** your-email@example.com
- **Password:** Password123
- **Confirm:** Password123

### 3. Click "Create Account"
- Should redirect to `/auth/verify-email?email=your-email@example.com`
- Should see 6 input boxes
- Should see countdown timer (15:00)

### 4. Check Your Email
- Look for email from charityhub25@gmail.com
- Subject: "Verify Your CharityHub Email"
- Find the 6-digit code (e.g., 123456)

### 5. Enter Code
- Type code or paste all 6 digits
- Should auto-submit when complete
- Should show success and redirect to login

---

## 🧪 API TESTING (curl commands)

### 1. Register User
```bash
curl -X POST http://localhost:8000/api/auth/register-minimal \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Password123",
    "password_confirmation": "Password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Registration complete. Verification code sent to your email.",
  "email": "test@example.com",
  "expires_in": 15
}
```

### 2. Check Database for Code
```bash
cd capstone_backend
php artisan tinker
```

Then in tinker:
```php
DB::table('email_verifications')->where('email', 'test@example.com')->first();
```

**Copy the `code` value (e.g., "123456")**

### 3. Verify with Code
```bash
curl -X POST http://localhost:8000/api/auth/verify-email-code \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "code": "123456"
  }'
```

Replace `123456` with actual code from database.

**Expected Response:**
```json
{
  "success": true,
  "message": "Email verified successfully!",
  "user": {
    "id": 1,
    "name": "Test User",
    "email": "test@example.com",
    "email_verified_at": "2025-11-02T15:30:00.000000Z"
  }
}
```

### 4. Test Resend
```bash
curl -X POST http://localhost:8000/api/auth/resend-verification-code \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "A new verification code has been sent to your email.",
  "resend_count": 1,
  "remaining_resends": 2,
  "expires_in": 15
}
```

### 5. Test Token Link
Get token from database:
```php
DB::table('email_verifications')->where('email', 'test@example.com')->value('token');
```

Then test:
```bash
curl -X GET "http://localhost:8000/api/auth/verify-email-token?token=YOUR_TOKEN&email=test@example.com"
```

---

## 🧪 SECURITY TESTS

### Test 1: Wrong Code (5 attempts)
```bash
for i in {1..5}; do
  curl -X POST http://localhost:8000/api/auth/verify-email-code \
    -H "Content-Type: application/json" \
    -d '{"email": "test@example.com", "code": "000000"}'
  echo "\nAttempt $i"
done
```

**Expected:** After 5 attempts, should get "Max attempts reached" error

### Test 2: Expired Code
Update database:
```php
DB::table('email_verifications')
  ->where('email', 'test@example.com')
  ->update(['expires_at' => now()->subMinutes(20)]);
```

Try verify - should fail with "expired" error.

### Test 3: Max Resends
```bash
for i in {1..4}; do
  curl -X POST http://localhost:8000/api/auth/resend-verification-code \
    -H "Content-Type: application/json" \
    -d '{"email": "test@example.com"}'
  echo "\nResend $i"
  sleep 2
done
```

**Expected:** 4th resend should fail with "Maximum resend limit reached"

---

## ✅ VERIFICATION CHECKLIST

### Backend Checks:
- [ ] Migration ran successfully (`email_verifications` table exists)
- [ ] User created with `email_verified_at = null`
- [ ] Verification record created with code and token
- [ ] Email sent (check queue or logs)
- [ ] Code verification works
- [ ] Token verification works
- [ ] Resend creates new code
- [ ] Max attempts enforced
- [ ] Max resends enforced
- [ ] Expiry works correctly

### Frontend Checks:
- [ ] Registration form shows only 3 fields
- [ ] Form validation works
- [ ] Redirects to verify page on success
- [ ] 6 input boxes display correctly
- [ ] Auto-focus works
- [ ] Auto-submit works when complete
- [ ] Paste works (try pasting "123456")
- [ ] Backspace navigation works
- [ ] Countdown timer displays and updates
- [ ] Resend button works
- [ ] Error messages display correctly
- [ ] Success state shows
- [ ] Auto-redirects to login after success

### Email Checks:
- [ ] Email received in inbox
- [ ] From address is charityhub25@gmail.com
- [ ] Subject is correct
- [ ] 6-digit code is visible and large
- [ ] Verify button link works
- [ ] Link redirects to frontend with token
- [ ] Template looks professional
- [ ] Mobile display is correct

---

## 🐛 DEBUGGING TIPS

### Email not sending?
```bash
# Check Laravel logs
tail -f capstone_backend/storage/logs/laravel.log

# Test SMTP connection
curl http://localhost:8000/api/email/test-connection

# Check queue jobs
php artisan queue:failed
```

### Database issues?
```bash
# Check table exists
php artisan tinker
>>> Schema::hasTable('email_verifications');

# Check record
>>> DB::table('email_verifications')->get();
```

### Frontend not loading?
```bash
# Check for errors
cd capstone_frontend
npm run dev

# Check browser console (F12)
# Look for red errors
```

---

## 📊 SUCCESS CRITERIA

✅ **Registration:**
- Form submits successfully
- User redirected to verify page
- Email sent within 5 seconds

✅ **Verification:**
- Code accepts 6 digits only
- Correct code verifies successfully
- Wrong code shows error
- 5 wrong attempts locks code
- Token link auto-verifies

✅ **Resend:**
- Resend generates new code
- Cooldown prevents spam
- 3 resends max enforced

✅ **Security:**
- Codes expire after 15 minutes
- Rate limiting works
- Passwords hashed
- No sensitive data in errors

---

## 🎉 ALL TESTS PASS? YOU'RE READY!

If all tests pass, your email verification system is:
- ✅ Fully functional
- ✅ Secure
- ✅ User-friendly
- ✅ Production-ready

**Deploy with confidence!** 🚀

---

*Quick Test Guide - CharityHub Email Verification*  
*Last Updated: November 2, 2025*
