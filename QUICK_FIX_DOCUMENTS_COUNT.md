# Quick Fix: Documents Count Not Updating

## Problem
Page `http://localhost:8080/charity/documents` still shows "Total Submitted: 3" instead of the correct count.

## Solution (Choose One)

---

### ✅ **Option 1: Automatic Restart (Recommended)**

Run this script to automatically restart the frontend:

```powershell
.\scripts\restart_frontend.ps1
```

This will:
1. Stop the current dev server
2. Clear Vite cache
3. Start a new dev server in a new terminal
4. Show you instructions

---

### ✅ **Option 2: Manual Restart**

#### Step 1: Stop Frontend Server
1. Find the terminal/command prompt running the frontend
2. Press `Ctrl+C` to stop it
3. Wait for it to fully stop

#### Step 2: Clear Cache (Optional but Recommended)
```powershell
cd capstone_frontend
Remove-Item -Recurse -Force node_modules\.vite
```

#### Step 3: Restart Server
```powershell
cd capstone_frontend
npm run dev
# OR if using bun:
bun run dev
```

#### Step 4: Wait for Server to Start
Look for this message:
```
➜  Local:   http://localhost:8080/
➜  Network: use --host to expose
```

#### Step 5: Refresh Browser
1. Go to `http://localhost:8080/charity/documents`
2. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. Or open in Incognito/Private window

---

### ✅ **Option 3: Just Clear Browser Cache**

If you don't want to restart the server:

1. Open browser DevTools: `F12`
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. Or: Go to Settings → Clear browsing data → Cached images and files

---

## Verification Steps

After restarting, verify the fix worked:

### 1. Check Browser Console
1. Open DevTools: `F12`
2. Go to Console tab
3. Refresh the page
4. Look for these messages:
   ```
   Fetching documents for charity ID: X
   Raw API response: [...]
   Total documents: 5  ← Should show correct count
   Approved: X
   Pending: X
   Rejected: X
   ```

### 2. Check UI
Look at the top of the page. You should see **4 statistics cards**:

```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│Total Submitted│ │  Approved    │ │Pending Review│ │Needs Revision│
│      5       │ │      X       │ │      X       │ │      X       │
│All documents │ │Verified docs │ │Awaiting review│ │Requires action│
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

### 3. Check Document Grid
Below the statistics, you should see:
- **Submission History** header
- **Filter dropdown** (All Documents / Approved / Pending Review / Needs Revision)
- **Document cards** with color-coded borders

---

## Still Not Working?

### Quick Diagnostic

Run this in PowerShell to check everything:

```powershell
# Check if file has the new code
Select-String -Path "capstone_frontend\src\pages\charity\Documents.tsx" -Pattern "Document Statistics Cards"

# Check if backend is running
Invoke-WebRequest -Uri "http://localhost:8000/api/health" -Method Get

# Check if frontend is running
Invoke-WebRequest -Uri "http://localhost:8080" -Method Get
```

### Check Database Directly

```sql
-- Count documents for your charity
SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN verification_status = 'approved' THEN 1 ELSE 0 END) as approved,
    SUM(CASE WHEN verification_status = 'pending' THEN 1 ELSE 0 END) as pending,
    SUM(CASE WHEN verification_status = 'rejected' THEN 1 ELSE 0 END) as rejected
FROM charity_documents
WHERE charity_id = YOUR_CHARITY_ID;
```

Replace `YOUR_CHARITY_ID` with your actual charity ID.

### Test API Directly

```powershell
.\scripts\check_documents_api.ps1
```

This will show you exactly what the API is returning.

---

## Common Issues & Solutions

### Issue: "Port 8080 is already in use"

**Solution:**
```powershell
# Find and kill the process
Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess | Stop-Process -Force
```

### Issue: "Module not found" errors

**Solution:**
```powershell
cd capstone_frontend
npm install
# OR
bun install
```

### Issue: Statistics cards not appearing

**Cause:** Code changes didn't apply

**Solution:**
1. Check if file was saved
2. Restart dev server
3. Clear browser cache
4. Check browser console for errors

### Issue: Console shows correct count but UI shows wrong count

**Cause:** React state not updating

**Solution:**
1. Hard refresh browser: `Ctrl+Shift+R`
2. Clear React DevTools cache (if installed)
3. Try different browser

### Issue: API returns 401 Unauthorized

**Cause:** Authentication token expired

**Solution:**
1. Logout and login again
2. Check if token is in localStorage/sessionStorage
3. Check backend logs for auth errors

---

## Expected Result

After the fix, you should see:

### Statistics Cards (Top of Page)
```
Total Submitted: 5  ← Correct count
Approved: 2
Pending Review: 2
Needs Revision: 1
```

### Console Logs
```
Fetching documents for charity ID: 1
Raw API response: [Array(5)]
Documents array: [Array(5)]
Total documents: 5
Approved: 2
Pending: 2
Rejected: 1
```

### Document Grid
- 5 document cards visible
- Each card shows correct status badge
- Rejected documents show rejection reason
- Filter dropdown works

---

## Need More Help?

If none of the above works:

1. **Read the full troubleshooting guide:**
   ```
   TROUBLESHOOTING_DOCUMENTS_PAGE.md
   ```

2. **Check complete documentation:**
   ```
   DOCUMENT_SYSTEM_COMPLETE_FIX.md
   ```

3. **Collect debug information:**
   - Database count (SQL query)
   - API response (PowerShell script)
   - Browser console output (screenshot)
   - UI screenshot

4. **Check for errors:**
   - Browser console (F12 → Console)
   - Network tab (F12 → Network)
   - Laravel logs (`storage/logs/laravel.log`)

---

## Summary

**Most Common Fix:** Just restart the frontend dev server!

```powershell
# Quick command:
.\scripts\restart_frontend.ps1

# Then:
# 1. Wait for server to start
# 2. Hard refresh browser (Ctrl+Shift+R)
# 3. Check console for logs
# 4. Verify statistics cards show correct count
```

That's it! 🎉
