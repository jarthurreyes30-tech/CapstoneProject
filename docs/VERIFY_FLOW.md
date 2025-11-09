# 📧 Email Verification Flow Documentation

**CharityHub - Robust Email Verification System**  
**Implementation Date:** November 2, 2025  
**Version:** 1.0  
**Email Sender:** charityhub25@gmail.com

---

## 🎯 Overview

CharityHub uses a secure, user-friendly email verification system with:
- **6-digit numeric codes** (primary method)
- **Verification links** (fallback method)
- **15-minute expiry** for security
- **Rate limiting** to prevent abuse
- **Attempt limits** to protect against brute force

---

## 📋 System Specifications

### Security Parameters:
- **Code Length:** 6 digits (000000-999999)
- **Code Expiry:** 15 minutes
- **Max Verification Attempts:** 5 per code
- **Max Resend Limit:** 3 resends within 30 minutes
- **Rate Limiting:** 5 requests per minute on verify/resend endpoints
- **Token Length:** 60 characters (fallback link)

### Email Configuration:
- **Sender:** charityhub25@gmail.com
- **Provider:** Gmail SMTP
- **Queue:** Laravel Queue (recommended for production)
- **Template Engine:** Laravel Blade

---

## 🚀 API Endpoints

### 1. **Minimal Registration**

**Endpoint:** `POST /api/auth/register-minimal`

**Purpose:** Register a new donor with only essential information

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "password_confirmation": "SecurePass123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration complete. Verification code sent to your email.",
  "email": "john@example.com",
  "expires_in": 15
}
```

**Error Response (422):**
```json
{
  "message": "Validation failed",
  "errors": {
    "email": ["The email has already been taken."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

**What Happens:**
1. Creates user with `email_verified_at = null`
2. Generates 6-digit code (e.g., "123456")
3. Generates 60-character token for fallback link
4. Creates record in `email_verifications` table
5. Sends email with both code and link
6. Returns success with email address

---

### 2. **Verify Email with Code** (Primary Method)

**Endpoint:** `POST /api/auth/verify-email-code`

**Purpose:** Verify email using the 6-digit code

**Request Body:**
```json
{
  "email": "john@example.com",
  "code": "123456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully!",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "email_verified_at": "2025-11-02T15:30:00.000000Z"
  }
}
```

**Error Responses:**

**Invalid Code (400):**
```json
{
  "success": false,
  "message": "Invalid verification code"
}
```

**Expired Code (400):**
```json
{
  "success": false,
  "message": "Verification code has expired. Please request a new one.",
  "expired": true
}
```

**Max Attempts Reached (429):**
```json
{
  "success": false,
  "message": "Maximum verification attempts reached. Please request a new code.",
  "max_attempts": true
}
```

**What Happens:**
1. Looks up verification by email and code
2. Checks if code is expired (> 15 minutes old)
3. Checks if attempts < 5
4. If valid: sets `users.email_verified_at = now()`
5. Deletes verification record
6. Returns user data

---

### 3. **Verify Email with Token** (Fallback Method)

**Endpoint:** `GET /api/auth/verify-email-token?token={token}&email={email}`

**Purpose:** Verify email using the fallback link (when user clicks link in email)

**Query Parameters:**
- `token` (required): 60-character verification token
- `email` (required): User's email address

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully!",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "email_verified_at": "2025-11-02T15:30:00.000000Z"
  }
}
```

**Error Responses:**

**Invalid/Expired Token (400):**
```json
{
  "success": false,
  "message": "Verification link has expired. Please request a new one.",
  "expired": true
}
```

**What Happens:**
1. Looks up verification by email and token
2. Checks if token is expired
3. If valid: sets `users.email_verified_at = now()`
4. Deletes verification record
5. Returns user data

---

### 4. **Resend Verification Code**

**Endpoint:** `POST /api/auth/resend-verification-code`

**Purpose:** Send a new verification code when the previous one expired or failed

**Rate Limit:** `throttle:5,1` (5 requests per minute)

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "A new verification code has been sent to your email.",
  "resend_count": 1,
  "remaining_resends": 2,
  "expires_in": 15
}
```

**Error Responses:**

**User Not Found (404):**
```json
{
  "success": false,
  "message": "User not found"
}
```

**Already Verified (400):**
```json
{
  "success": false,
  "message": "Email already verified"
}
```

**Max Resends Reached (429):**
```json
{
  "success": false,
  "message": "Maximum resend limit reached. Please try again in 30 minutes.",
  "retry_after": 1234
}
```

**What Happens:**
1. Checks if user exists and email not verified
2. Checks resend limit (3 per 30 minutes)
3. Generates new 6-digit code
4. Generates new token
5. Updates verification record
6. Resets attempt counter to 0
7. Sends new email
8. Returns remaining resends

---

## 📊 Database Schema

### `email_verifications` Table:

```sql
CREATE TABLE `email_verifications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NULL,
  `email` varchar(255) NOT NULL,
  `token` varchar(120) NULL,
  `code` varchar(10) NULL,
  `expires_at` timestamp NULL,
  `attempts` int NOT NULL DEFAULT '0',
  `resend_count` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL,
  `updated_at` timestamp NULL,
  PRIMARY KEY (`id`),
  KEY `email_verifications_email_index` (`email`),
  KEY `email_verifications_email_code_index` (`email`, `code`),
  KEY `email_verifications_email_token_index` (`email`, `token`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);
```

**Field Descriptions:**
- `user_id`: Foreign key to users table (nullable for flexibility)
- `email`: User's email address (indexed for fast lookups)
- `token`: 60-char random string for fallback link verification
- `code`: 6-digit numeric code for primary verification
- `expires_at`: Timestamp when code/token expires (15 mins from creation)
- `attempts`: Counter for failed verification attempts (max 5)
- `resend_count`: Counter for resend requests (max 3 per 30 mins)
- `created_at/updated_at`: Laravel timestamps

---

## 📧 Email Template

The verification email includes:

### Visual Elements:
1. **CharityHub Header** with gradient background
2. **Large 6-Digit Code** in monospace font with colored box
3. **Expiry Timer** showing "Expires in 15 minutes"
4. **Verify Button** linking to frontend with token
5. **Security Warning** about phishing
6. **Instructions** for resending code
7. **Footer** with contact information

### Content Structure:
```
Subject: Verify Your CharityHub Email

Hello [Name],

Thank you for registering with CharityHub!

Your Verification Code: [123456]
(Expires in 15 minutes)

[Verify My Email Button]

Or copy this link: https://charityhub.com/auth/verify-email?token=...&email=...

Security Note: If you didn't create this account, ignore this email.

Need a new code? Request one from the verification page.
Maximum attempts: 5 tries per code.

Support: charityhub25@gmail.com
```

---

## 🔐 Security Features

### 1. **Rate Limiting**
- **Verify Endpoint:** Included in Laravel throttle middleware
- **Resend Endpoint:** `throttle:5,1` (5 requests per minute)
- **Global:** Prevent automated attacks

### 2. **Attempt Limiting**
- **Per Code:** Max 5 verification attempts
- **After 5 Failed:** Code invalidated, must resend
- **Tracked:** `attempts` column in database

### 3. **Resend Limiting**
- **Per 30 Minutes:** Max 3 resends
- **Rolling Window:** Resets after 30 minutes from first send
- **Tracked:** `resend_count` and `created_at`

### 4. **Time-Based Expiry**
- **15 Minutes:** Codes expire automatically
- **Checked:** On every verification attempt
- **Database:** `expires_at` timestamp

### 5. **Secure Token Generation**
- **Code:** `str_pad(rand(0,999999), 6, '0', STR_PAD_LEFT)`
- **Token:** `Str::random(60)` (cryptographically secure)
- **Unique:** Per user per registration

### 6. **Password Hashing**
- **Algorithm:** bcrypt via Laravel's `Hash::make()`
- **Never Stored:** Plain text passwords never saved
- **Validation:** Minimum 8 characters

---

## 🧪 Testing Guide

### Manual Testing Steps:

#### 1. **Register New User**
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

**Expected:** Success response with email confirmation

#### 2. **Check Database for Code**
```bash
php artisan tinker
>>> DB::table('email_verifications')->where('email', 'test@example.com')->first();
```

**Expected:** Record with 6-digit code and token

#### 3. **Verify with Code**
```bash
curl -X POST http://localhost:8000/api/auth/verify-email-code \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "code": "123456"
  }'
```

Replace `123456` with actual code from database.

**Expected:** Success response, `users.email_verified_at` set

#### 4. **Test Expiry**
Update `expires_at` to past time:
```bash
php artisan tinker
>>> DB::table('email_verifications')->where('email', 'test@example.com')->update(['expires_at' => now()->subMinutes(20)]);
```

Try verification - should fail with expired message.

#### 5. **Test Resend**
```bash
curl -X POST http://localhost:8000/api/auth/resend-verification-code \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

**Expected:** New code generated, resend_count incremented

#### 6. **Test Max Attempts**
Try verification with wrong code 5 times:
```bash
for i in {1..5}; do
  curl -X POST http://localhost:8000/api/auth/verify-email-code \
    -H "Content-Type: application/json" \
    -d '{"email": "test@example.com", "code": "000000"}'
done
```

**Expected:** 6th attempt should fail with max attempts reached

#### 7. **Test Frontend Flow**
1. Open http://localhost:5173/auth/register/donor
2. Fill form with 3 fields
3. Click "Create Account"
4. Should redirect to `/auth/verify-email?email=...`
5. Enter 6-digit code
6. Should verify and redirect to login

#### 8. **Test Token Link**
Copy token from email or database, open:
```
http://localhost:5173/auth/verify-email?token=ABCD...XYZ&email=test@example.com
```

**Expected:** Auto-verification and redirect

---

## 🎨 Frontend Implementation

### Key Features:
1. **6-Digit Input Fields** with auto-focus and auto-submit
2. **Real-Time Expiry Countdown** showing minutes:seconds
3. **Attempt Counter** showing remaining attempts
4. **Resend Button** with cooldown timer
5. **Paste Support** for copying entire code
6. **Keyboard Navigation** (backspace moves back)
7. **Error States** with clear messages
8. **Success State** with auto-redirect

### User Flow:
1. User registers → redirected to verify page
2. Checks email → receives 6-digit code
3. Enters code → auto-submits when complete
4. Success → redirects to login after 2 seconds
5. If expired → clicks resend button
6. If wrong code → clear fields, try again (5 attempts)

---

## ⚠️ Common Issues & Solutions

### Issue: Email not received
**Solutions:**
1. Check spam/junk folder
2. Verify SMTP configuration in `.env`
3. Check Laravel logs: `storage/logs/laravel.log`
4. Test email connection: `GET /api/email/test-connection`
5. Ensure queue worker running: `php artisan queue:work`

### Issue: Code always says "expired"
**Solutions:**
1. Check server timezone matches database timezone
2. Verify `expires_at` is set correctly (15 mins future)
3. Check `now()` vs `Carbon::now()` consistency

### Issue: Can't resend after 3 attempts
**Solutions:**
1. Wait 30 minutes from first resend
2. Or manually reset: `UPDATE email_verifications SET resend_count=0 WHERE email='...'`
3. Check `created_at` timestamp

### Issue: Token verification fails
**Solutions:**
1. Ensure token passed correctly in URL
2. Check for URL encoding issues
3. Verify email parameter matches

---

## 🚀 Production Deployment Checklist

- [ ] Set `QUEUE_CONNECTION=database` or `redis` in `.env`
- [ ] Run queue worker: `php artisan queue:work --daemon`
- [ ] Configure supervisor for queue worker persistence
- [ ] Enable HTTPS for secure token transmission
- [ ] Set up email monitoring (e.g., Mailtrap, SendGrid)
- [ ] Configure rate limiting for production traffic
- [ ] Set up logging for verification events
- [ ] Test email deliverability to major providers (Gmail, Outlook)
- [ ] Set up alerts for high failure rates
- [ ] Document support process for verification issues

---

## 📞 Support

For issues or questions:
- **Email:** charityhub25@gmail.com
- **Support Portal:** `/donor/support`
- **Documentation:** `/docs`

---

*Last Updated: November 2, 2025*  
*Version: 1.0*  
*Status: Production Ready ✅*
