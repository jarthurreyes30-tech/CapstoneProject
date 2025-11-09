# 🧪 Login Security Testing Guide

## Quick Test Commands

### Test 1: Check Database Columns
```bash
cd capstone_backend
php artisan tinker
```
Then run:
```php
$user = User::first();
echo "Failed Attempts: " . $user->failed_attempts . "\n";
echo "Locked Until: " . $user->locked_until . "\n";
exit
```

### Test 2: Test Failed Login via Postman/cURL

**Endpoint:** `POST http://localhost:8000/api/auth/login`

**Request Body:**
```json
{
  "email": "testdonor1@charityhub.com",
  "password": "wrongpassword"
}
```

**Expected Responses:**

**Attempt 1:**
```json
{
  "message": "⚠️ Incorrect password. You have 4 attempt(s) remaining before your account is locked.",
  "attempts_remaining": 4,
  "locked": false,
  "error_type": "invalid_password"
}
```

**Attempt 5:**
```json
{
  "message": "🚫 Too many failed login attempts. Your account has been locked for 10 minutes for security. You will receive an email with further instructions.",
  "attempts_remaining": 0,
  "locked": true,
  "error_type": "account_locked"
}
```

**Attempt 6 (already locked):**
```json
{
  "message": "🚫 Too many failed login attempts. Please try again in 9 minute(s).",
  "locked_until": "2025-11-07T09:40:00.000000Z",
  "error_type": "account_locked"
}
```

### Test 3: Check Email in Logs
```bash
tail -f storage/logs/laravel.log | grep "TooManyLoginAttempts"
```

Or check `storage/logs/laravel.log` for email content if using `MAIL_MAILER=log`

### Test 4: Unlock Account Manually
```bash
php artisan tinker
```
```php
$user = User::where('email', 'testdonor1@charityhub.com')->first();
$user->failed_attempts = 0;
$user->locked_until = null;
$user->save();
echo "Account unlocked!\n";
exit
```

### Test 5: Check Security Logs
```bash
php artisan tinker
```
```php
use App\Models\ActivityLog;
ActivityLog::where('action', 'failed_login_attempt')->latest()->take(5)->get();
ActivityLog::where('action', 'account_locked')->latest()->take(5)->get();
exit
```

---

## Full End-to-End Test Scenarios

### Scenario A: Normal Failed Attempts
1. Open your login page
2. Enter: `testdonor1@charityhub.com` / `wrongpass1`
3. **See:** "You have 4 attempts remaining"
4. Enter: `testdonor1@charityhub.com` / `wrongpass2`
5. **See:** "You have 3 attempts remaining"
6. Enter: `testdonor1@charityhub.com` / `wrongpass3`
7. **See:** "You have 2 attempts remaining"
8. Enter: `testdonor1@charityhub.com` / `wrongpass4`
9. **See:** "You have 1 attempt remaining"
10. Enter: `testdonor1@charityhub.com` / `wrongpass5`
11. **See:** "Account locked for 10 minutes" ✅
12. **Check email** - should receive security alert ✉️

### Scenario B: Locked Account Cannot Login
1. After Scenario A, account is locked
2. Enter **CORRECT** password: `password123`
3. **See:** "Please try again in X minutes" ❌
4. Login should be denied even with correct password

### Scenario C: Auto-Unlock After Timeout
1. After locking account in Scenario A
2. Wait 10 minutes (or manually unlock with tinker)
3. Enter correct password
4. **See:** Login successful ✅
5. `failed_attempts` should be reset to 0

### Scenario D: Reset on Successful Login
1. Enter wrong password 3 times
2. Then enter **correct** password
3. **See:** Login successful ✅
4. Check database: `failed_attempts` = 0
5. Try wrong password again
6. **See:** "You have 4 attempts remaining" (counter reset)

### Scenario E: Different User Isolation
1. Lock account for `testdonor1@charityhub.com`
2. Try logging in as `testcharity1@charityhub.com`
3. **See:** Login works normally ✅
4. Each account has its own counter

---

## Manual Database Checks

### Check Current Lock Status:
```sql
SELECT 
    id, 
    email, 
    failed_attempts, 
    locked_until,
    CASE 
        WHEN locked_until IS NULL THEN 'Not Locked'
        WHEN locked_until > NOW() THEN 'LOCKED'
        ELSE 'Lock Expired'
    END as lock_status
FROM users 
WHERE email IN ('testdonor1@charityhub.com', 'testcharity1@charityhub.com')
ORDER BY id;
```

### Check Activity Logs:
```sql
SELECT 
    created_at,
    user_id,
    action,
    JSON_EXTRACT(details, '$.attempts') as attempts,
    JSON_EXTRACT(details, '$.remaining') as remaining,
    ip_address
FROM activity_logs
WHERE action IN ('failed_login_attempt', 'account_locked')
ORDER BY created_at DESC
LIMIT 10;
```

### Reset All Locked Accounts:
```sql
UPDATE users 
SET failed_attempts = 0, locked_until = NULL 
WHERE locked_until IS NOT NULL;
```

---

## Email Testing

### Option 1: Mailtrap (Recommended for Development)
1. Sign up at https://mailtrap.io
2. Get SMTP credentials
3. Update `.env`:
```env
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls
```
4. Lock an account
5. Check Mailtrap inbox for email

### Option 2: Log Emails to File
Update `.env`:
```env
MAIL_MAILER=log
```
Then check `storage/logs/laravel.log` for email content

### Option 3: Real Email (Production)
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@charityhub.com
```

---

## Expected Email Content

**Subject:** 🔒 Security Alert: Multiple Failed Login Attempts

**Body Contains:**
- ⚠️ Warning message
- Failed attempt count (5)
- Lock duration (10 minutes)
- User account details
- "Was this you?" section
- Reset password button
- Security tips
- CharityHub branding

---

## Performance Test

Test with multiple rapid attempts:
```bash
# Bash script to test rapid attempts
for i in {1..10}; do
  curl -X POST http://localhost:8000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' \
    -w "\nAttempt $i: %{http_code}\n"
  sleep 0.5
done
```

**Expected:**
- First 5 attempts: HTTP 401
- Attempts 6-10: HTTP 429 (locked)

---

## Checklist

Before marking complete, verify:

- [ ] Database columns exist (`failed_attempts`, `locked_until`)
- [ ] Wrong password increments counter
- [ ] 5th attempt locks account
- [ ] Locked account rejects correct password
- [ ] Account unlocks after 10 minutes
- [ ] Successful login resets counter
- [ ] Email sent on lockout
- [ ] Email contains correct information
- [ ] Works for donor accounts
- [ ] Works for charity accounts
- [ ] Works for admin accounts
- [ ] Each account tracked separately
- [ ] Security logs created properly
- [ ] Frontend shows proper error messages

---

## Troubleshooting

### Email Not Sending?
```bash
php artisan tinker
```
```php
use App\Models\User;
use App\Mail\TooManyLoginAttempts;
use Illuminate\Support\Facades\Mail;

$user = User::first();
Mail::to($user->email)->send(new TooManyLoginAttempts($user, 10, 5));
echo "Test email sent!\n";
exit
```

### Counter Not Incrementing?
```bash
php artisan tinker
```
```php
$user = User::where('email', 'testdonor1@charityhub.com')->first();
echo "Current attempts: " . $user->failed_attempts . "\n";
$user->failed_attempts++;
$user->save();
echo "New attempts: " . $user->failed_attempts . "\n";
exit
```

### Lock Not Working?
```bash
php artisan tinker
```
```php
$user = User::where('email', 'testdonor1@charityhub.com')->first();
$user->locked_until = now()->addMinutes(10);
$user->save();
echo "Locked until: " . $user->locked_until . "\n";
exit
```

---

## Success! 🎉

If all tests pass, the login security system is fully functional!
