# Troubleshooting: Documents Page Showing Wrong Count

## Problem
The documents page at `http://localhost:8080/charity/documents` is still showing "Total Submitted: 3" when there should be 5 documents.

## Possible Causes & Solutions

### 1. Frontend Dev Server Not Restarted

**Cause:** The React/Vite dev server is still serving the old cached version of the code.

**Solution:**
```bash
# Stop the frontend dev server (Ctrl+C in the terminal where it's running)
# Then restart it:
cd capstone_frontend
npm run dev
# OR
bun run dev
```

**How to verify:**
- After restart, hard refresh the browser (Ctrl+Shift+R or Ctrl+F5)
- Check if the statistics cards appear at the top of the page
- Open browser console (F12) and look for the new console.log messages

---

### 2. Browser Cache

**Cause:** Browser is serving cached JavaScript files.

**Solution:**
```
1. Open browser DevTools (F12)
2. Go to Network tab
3. Check "Disable cache" checkbox
4. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
5. Or clear browser cache completely
```

**Alternative:**
- Open in Incognito/Private window
- Try a different browser

---

### 3. API Returning Wrong Data

**Cause:** Backend is not returning all documents or returning incorrect data.

**Solution:**

#### Step A: Check Database Directly
```sql
-- Run this in your MySQL/MariaDB client
SELECT 
    cd.id,
    cd.charity_id,
    cd.doc_type,
    cd.verification_status,
    cd.created_at
FROM charity_documents cd
WHERE cd.charity_id = YOUR_CHARITY_ID
ORDER BY cd.created_at DESC;

-- Count by status
SELECT 
    verification_status,
    COUNT(*) as count
FROM charity_documents
WHERE charity_id = YOUR_CHARITY_ID
GROUP BY verification_status;
```

#### Step B: Test API Directly
```bash
# Run the PowerShell script
.\scripts\check_documents_api.ps1

# Or use curl/Postman to test:
curl -X GET "http://localhost:8000/api/charities/YOUR_CHARITY_ID/documents" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

#### Step C: Check Laravel Logs
```bash
# View recent errors
tail -f capstone_backend/storage/logs/laravel.log
```

---

### 4. Wrong Charity ID

**Cause:** The user object doesn't have the correct charity ID.

**Solution:**

#### Check in Browser Console:
```javascript
// Open browser console (F12) and type:
console.log('User:', JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user')));
console.log('Charity ID:', JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'))?.charity?.id);
```

#### Check in Database:
```sql
-- Find your user and charity
SELECT 
    u.id as user_id,
    u.name as user_name,
    u.email,
    c.id as charity_id,
    c.name as charity_name
FROM users u
LEFT JOIN charities c ON c.owner_id = u.id
WHERE u.email = 'your@email.com';
```

---

### 5. Documents Missing verification_status

**Cause:** Old documents in database don't have verification_status set.

**Solution:**
```sql
-- Check for NULL status
SELECT COUNT(*) 
FROM charity_documents 
WHERE verification_status IS NULL;

-- Fix NULL status
UPDATE charity_documents 
SET verification_status = 'pending' 
WHERE verification_status IS NULL;

-- Verify fix
SELECT 
    verification_status,
    COUNT(*) as count
FROM charity_documents
GROUP BY verification_status;
```

---

### 6. Frontend Not Fetching Data

**Cause:** API call is failing silently or not being made.

**Solution:**

#### Check Browser Console:
1. Open DevTools (F12)
2. Go to Console tab
3. Look for these messages:
   ```
   Fetching documents for charity ID: X
   Raw API response: [...]
   Total documents: X
   Approved: X
   Pending: X
   Rejected: X
   ```

4. If you see errors, check:
   - Authentication token is valid
   - API endpoint is correct
   - CORS is configured properly

#### Check Network Tab:
1. Open DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Look for request to `/api/charities/{id}/documents`
5. Check:
   - Status code (should be 200)
   - Response body (should contain array of documents)
   - Request headers (should have Authorization token)

---

### 7. Code Changes Not Applied

**Cause:** The file was edited but changes weren't saved or compiled.

**Solution:**

#### Verify File Contents:
```bash
# Check if statistics cards are in the file
grep -n "Document Statistics Cards" capstone_frontend/src/pages/charity/Documents.tsx

# Or open the file and look for line ~335:
# {/* Document Statistics Cards */}
```

#### Check for Syntax Errors:
```bash
# In frontend directory
cd capstone_frontend
npm run build
# OR
bun run build

# Look for any compilation errors
```

---

## Step-by-Step Debugging Process

### Step 1: Verify Database Has Correct Data
```sql
SELECT COUNT(*) as total_documents
FROM charity_documents
WHERE charity_id = YOUR_CHARITY_ID;
```
**Expected:** Should return 5 (or whatever the actual count is)

### Step 2: Test API Directly
```bash
.\scripts\check_documents_api.ps1
```
**Expected:** Should show count matching database

### Step 3: Check Browser Console
1. Open `http://localhost:8080/charity/documents`
2. Open DevTools (F12) → Console tab
3. Look for log messages
**Expected:** Should see "Total documents: 5"

### Step 4: Check UI
1. Look at the statistics cards at top of page
2. Check if they show correct numbers
**Expected:** Total Submitted should match console log

### Step 5: If Still Wrong
1. Stop frontend dev server (Ctrl+C)
2. Clear browser cache
3. Restart frontend dev server
4. Hard refresh browser (Ctrl+Shift+R)
5. Check again

---

## Quick Fixes

### Fix 1: Restart Everything
```bash
# Stop all servers
# Then:

# Terminal 1 - Backend
cd capstone_backend
php artisan serve

# Terminal 2 - Frontend
cd capstone_frontend
npm run dev
# OR
bun run dev
```

### Fix 2: Clear All Caches
```bash
# Backend cache
cd capstone_backend
php artisan cache:clear
php artisan config:clear
php artisan view:clear

# Frontend - delete node_modules/.vite folder
cd capstone_frontend
rm -rf node_modules/.vite
# OR on Windows:
Remove-Item -Recurse -Force node_modules/.vite

# Then restart dev server
npm run dev
```

### Fix 3: Hard Reset Browser
1. Close all browser tabs
2. Clear all browsing data (Ctrl+Shift+Delete)
3. Close browser completely
4. Reopen and navigate to page

---

## Verification Checklist

After applying fixes, verify:

- [ ] Database shows correct count (SQL query)
- [ ] API returns correct count (curl/Postman or PowerShell script)
- [ ] Browser console shows correct count (console.log messages)
- [ ] UI statistics cards show correct count
- [ ] All four statistics cards are visible
- [ ] Filter dropdown is present
- [ ] Document cards show correct status badges
- [ ] No errors in browser console
- [ ] No errors in Laravel logs

---

## Still Not Working?

If you've tried everything above and it's still showing wrong count:

### Collect Debug Information:

1. **Database Count:**
   ```sql
   SELECT COUNT(*) FROM charity_documents WHERE charity_id = X;
   ```
   Result: _____

2. **API Response Count:**
   ```bash
   .\scripts\check_documents_api.ps1
   ```
   Result: _____

3. **Browser Console Count:**
   ```
   Open console, look for "Total documents: X"
   ```
   Result: _____

4. **UI Shows:**
   ```
   Total Submitted: _____
   ```

5. **Screenshot:**
   - Take screenshot of the page
   - Take screenshot of browser console
   - Take screenshot of Network tab showing API response

### Common Patterns:

| Database | API | Console | UI | Issue |
|----------|-----|---------|----|----|
| 5 | 5 | 5 | 3 | Frontend not updated - restart dev server |
| 5 | 5 | 3 | 3 | API response not parsed correctly - check code |
| 5 | 3 | 3 | 3 | Backend filtering wrong - check controller |
| 3 | 3 | 3 | 3 | Database actually has 3 - check charity_id |

---

## Contact Information

If issue persists after all troubleshooting:
1. Provide the debug information collected above
2. Share screenshots of console and Network tab
3. Share relevant Laravel log entries
4. Confirm which steps you've already tried
