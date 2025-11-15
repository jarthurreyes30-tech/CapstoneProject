# 🧪 QUICK TEST GUIDE - Donor Registration Fix

## ⚡ **FAST TESTING (5 Minutes)**

### **Test 1: Register Donor (Normal Flow)**

1. Go to: http://localhost:8082/auth/register
2. Fill form:
   - Name: Test Donor
   - Email: test@example.com
   - Password: password123
3. Click "Register"
4. **✅ Expected:** "Verification code sent" message
5. Check email for 6-digit OTP
6. Enter OTP on verification page
7. **✅ Expected:** Account created, auto-logged in

**Database Check:**
```sql
-- Should be 0 before OTP verification
SELECT * FROM pending_users WHERE email='test@example.com';

-- Should be 1 after OTP verification
SELECT * FROM users WHERE email='test@example.com';
```

---

### **Test 2: Press Back and Re-register**

1. Register as donor (same as Test 1)
2. **DON'T** enter OTP
3. Press browser **BACK** button
4. Register **AGAIN** with **same email**
5. **✅ Expected:** Works! No "email exists" error
6. New OTP sent to email
7. Verify with new OTP
8. **✅ Expected:** Account created successfully

---

### **Test 3: Expired OTP**

1. Register as donor
2. Wait **10+ minutes**
3. Try to verify with old OTP
4. **✅ Expected:** Error "Verification code expired"
5. Must register again

---

### **Test 4: Wrong OTP (5 times)**

1. Register as donor
2. Enter **wrong** OTP 5 times
3. **✅ Expected:** 
   - First 4: "Invalid code" + remaining attempts
   - 5th: "Too many failed attempts"
   - Must register again

---

### **Test 5: Charity Registration (Should Still Work)**

1. Go to: http://localhost:8082/auth/register-charity
2. Fill charity form
3. Submit
4. **✅ Expected:** Works as before
5. Check database:
   ```sql
   -- Should be 1 (charity uses DB immediately)
   SELECT * FROM pending_users WHERE role='charity_admin';
   ```

---

## 🔍 **VERIFY IN DATABASE**

### **After Donor Registration (Before OTP):**

```sql
-- Should return 0 rows ✅
SELECT * FROM pending_users WHERE email='test@example.com';

-- Should return 0 rows ✅  
SELECT * FROM users WHERE email='test@example.com';
```

### **After Donor OTP Verification:**

```sql
-- Should return 0 rows ✅
SELECT * FROM pending_users WHERE email='test@example.com';

-- Should return 1 row ✅
SELECT * FROM users WHERE email='test@example.com' AND role='donor';
```

### **After Charity Registration (Before OTP):**

```sql
-- Should return 1 row ✅
SELECT * FROM pending_users WHERE email='charity@example.com' AND role='charity_admin';

-- Should return 0 rows ✅
SELECT * FROM users WHERE email='charity@example.com';
```

---

## 📊 **EXPECTED BEHAVIOR**

| Action | Donor | Charity |
|--------|-------|---------|
| **Register** | Session only | DB insert |
| **Before OTP** | Not in DB | In `pending_users` |
| **After OTP** | In `users` | In `users` |
| **Can retry** | ✅ Yes | ❌ No (by design) |
| **Max attempts** | 5 | 5 |
| **Max resends** | 3 | 3 |
| **Expiration** | 10 min | 15 min |

---

## ✅ **SUCCESS INDICATORS**

### **✅ Donor Registration Working:**
- No "email exists" error on retry
- Can press back and re-register
- Not in `pending_users` before OTP
- In `users` after OTP
- Session clears after verification

### **✅ Charity Registration Working:**
- In `pending_users` before OTP
- In `users` after OTP
- Can't re-register (email exists error)
- Flow unchanged from before

---

## 🚨 **RED FLAGS**

### **❌ If You See These:**

1. **Donor in `pending_users` before OTP**
   - ❌ FIX NOT WORKING
   - Check backend deployed

2. **"Email already exists" on donor retry**
   - ❌ FIX NOT WORKING
   - Check session storage

3. **Charity NOT in `pending_users` before OTP**
   - ❌ BROKE CHARITY FLOW
   - Rollback deployment

---

## 🔧 **TROUBLESHOOTING**

### **Problem: No OTP email received**

**Check:**
1. Spam folder
2. Brevo service status
3. Railway logs:
   ```bash
   railway logs --tail | grep "verification email"
   ```

### **Problem: Session not working**

**Check:**
1. Railway deployment status
2. Session configuration
3. Clear browser cache

### **Problem: Database still polluted**

**Check:**
1. Backend version deployed
2. Run test script:
   ```bash
   php test_donor_registration_flow.php
   ```

---

## 📝 **QUICK COMMANDS**

### **Check Railway Deployment:**

```bash
cd c:\Users\sagan\CapstoneProject\Backend\capstone_backend
git log --oneline -5

# Should see:
# b2f0680 fix: Donor registration now uses session storage...
# 5f46107 fix: Add localhost:8082 to CORS allowed origins...
```

### **Run Backend Tests:**

```bash
cd c:\Users\sagan\CapstoneProject\Backend\capstone_backend
php test_donor_registration_flow.php

# Should see:
# ✅✅✅ ALL TESTS PASSED! ✅✅✅
```

### **Check Database:**

```sql
-- Donors in pending_users (should be 0)
SELECT COUNT(*) FROM pending_users WHERE role='donor';

-- Verified donors in users
SELECT COUNT(*) FROM users WHERE role='donor' AND email_verified_at IS NOT NULL;

-- Charities in pending_users (waiting approval)
SELECT COUNT(*) FROM pending_users WHERE role='charity_admin';
```

---

## ✅ **FINAL CHECKLIST**

Before considering testing complete:

- [ ] Donor registration works
- [ ] Can press back and re-register
- [ ] Not in DB before OTP
- [ ] In DB after OTP
- [ ] Charity registration still works
- [ ] Charity in DB before OTP
- [ ] All tests passed
- [ ] Backend deployed to Railway
- [ ] No CORS errors
- [ ] Session expiration works
- [ ] Attempt limiting works
- [ ] Resend limiting works

---

## 🎉 **IF ALL TESTS PASS:**

**Congratulations! The donor registration fix is working perfectly!**

You can now:
- ✅ Use donor registration in production
- ✅ Users can retry without errors
- ✅ Database stays clean
- ✅ Charity flow works as before

**No further action needed!** 🚀
