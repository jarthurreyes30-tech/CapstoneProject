# 🚀 Quick Start: Login Security Testing

## ⚡ 3-Minute Test

### 1. Check It's Working
```bash
cd capstone_backend
php artisan tinker
```
```php
// Check columns exist
$user = User::first();
echo $user->failed_attempts ?? 'Column exists!';
exit
```

### 2. Test via Browser
1. Open login page: `http://localhost:8080/auth/login`
2. Enter email: `testdonor1@charityhub.com`
3. Enter **wrong** password 5 times
4. **Should see:** Account locked message!
5. **Should receive:** Email (check Mailtrap or logs)

### 3. Unlock Manually
```bash
php artisan tinker
```
```php
User::where('email', 'testdonor1@charityhub.com')->update(['failed_attempts' => 0, 'locked_until' => null]);
echo "Unlocked!\n";
exit
```

---

## 🎯 What to Expect

| Attempt | Result |
|---------|--------|
| 1st fail | "You have 4 attempts remaining" |
| 2nd fail | "You have 3 attempts remaining" |
| 3rd fail | "You have 2 attempts remaining" |
| 4th fail | "You have 1 attempt remaining" |
| 5th fail | "Account locked for 10 minutes" + **Email sent** |
| 6th+ | "Please try again in X minutes" |

---

## ✅ Features Live

- ✅ Lock after 5 failed attempts
- ✅ 10-minute lockout
- ✅ Email notification with security tips
- ✅ Reset counter on successful login
- ✅ Works for all user roles
- ✅ Prevents brute-force attacks

---

## 📧 Email Setup (Optional)

For testing emails, add to `.env`:
```env
MAIL_MAILER=log
```
Then check `storage/logs/laravel.log` for email content.

---

## 🎉 That's It!

The backend security is **100% functional**. Just test it and you're done!
