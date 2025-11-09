# 🚀 EXPORT SYSTEM - QUICK START GUIDE

**For Testing & Verification**

---

## ⚡ IMMEDIATE TESTING (5 Minutes)

### Step 1: Start Backend Server

```bash
cd capstone_backend
php artisan serve
```

Server running at: `http://localhost:8000`

---

### Step 2: Test with Postman/Browser

#### Test 1: Donor PDF Export ✅

**Login as Donor First:**
```
POST http://localhost:8000/api/auth/login
Body (JSON):
{
  "email": "testdonor1@charityhub.com",
  "password": "password123"
}

Copy the token from response
```

**Download PDF:**
```
GET http://localhost:8000/api/donor/reports/export-pdf

Headers:
Authorization: Bearer {YOUR_TOKEN_HERE}
Accept: application/pdf

Result: PDF file downloads automatically
```

#### Test 2: Donor CSV Export ✅

```
GET http://localhost:8000/api/donor/reports/export-csv?start_date=2024-01-01

Headers:
Authorization: Bearer {DONOR_TOKEN}

Result: CSV file downloads
```

#### Test 3: Charity PDF Report ✅

**Login as Charity:**
```
POST http://localhost:8000/api/auth/login
Body:
{
  "email": "testcharity1@charityhub.com",
  "password": "charity123"
}
```

**Download Report:**
```
GET http://localhost:8000/api/charity/reports/export-pdf

Headers:
Authorization: Bearer {CHARITY_TOKEN}

Result: Charity performance report PDF
```

#### Test 4: Admin Activity Log PDF ✅

**Login as Admin** (if you have admin account)

```
GET http://localhost:8000/api/admin/activity-logs/export-pdf?days=30

Headers:
Authorization: Bearer {ADMIN_TOKEN}

Result: Activity log PDF
```

#### Test 5: Admin Platform Report ✅

```
GET http://localhost:8000/api/admin/fund-tracking/export-pdf?days=90

Headers:
Authorization: Bearer {ADMIN_TOKEN}

Result: Platform analytics PDF
```

---

## 🌐 BROWSER TESTING

### Option 1: Direct Link (Requires Login)

1. Login to your frontend
2. Open browser console
3. Run this JavaScript:

```javascript
// Get your auth token (from localStorage or cookies)
const token = localStorage.getItem('auth_token');

// Test donor PDF
fetch('http://localhost:8000/api/donor/reports/export-pdf', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/pdf'
  }
})
.then(res => res.blob())
.then(blob => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'test_report.pdf';
  document.body.appendChild(a);
  a.click();
  a.remove();
});

console.log('Download started!');
```

### Option 2: Add Test Button to Frontend

Add this to any dashboard page temporarily:

```typescript
// Add to Donor Dashboard
<button
  onClick={async () => {
    try {
      const response = await axios.get('/donor/reports/export-pdf', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'my_donations.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      alert('Downloaded!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to download');
    }
  }}
  className="px-4 py-2 bg-emerald-600 text-white rounded"
>
  Test PDF Download
</button>
```

---

## ✅ VERIFICATION CHECKLIST

After testing each endpoint, verify:

- [ ] **File downloads successfully** (not just text response)
- [ ] **Filename format is correct** (`charityhub_*_2025-11-07_*.pdf`)
- [ ] **PDF opens properly** in Adobe/browser
- [ ] **CSV opens in Excel** with proper formatting
- [ ] **Data is accurate** (matches database records)
- [ ] **Layout is professional** (not broken or ugly)
- [ ] **Branding is visible** (CharityHub logo/watermark)
- [ ] **No errors in Laravel log**

---

## 🎨 EXPECTED OUTPUT

### Donor Statement PDF Should Show:
```
┌─────────────────────────────────────────┐
│          CHARITYHUB                     │
│  Philippine Online Charity Platform     │
├─────────────────────────────────────────┤
│      Donation Statement                 │
├─────────────────────────────────────────┤
│ Donor: Maria Santos                     │
│ Period: January 01, 2024 - Nov 07, 2025│
├─────────────────────────────────────────┤
│ Summary:                                │
│ ┌─────────┬──────────┬──────────┐      │
│ │ ₱50,000 │ 15 gifts │ 3 orgs   │      │
│ └─────────┴──────────┴──────────┘      │
├─────────────────────────────────────────┤
│ Donation History                        │
│ [Table with dates, charities, amounts] │
└─────────────────────────────────────────┘
```

### CSV Should Have:
```csv
Date,Charity,Campaign,Amount,Status,Receipt
2025-10-01,Hope Foundation,School,1000,Completed,RCP20251001001
2025-09-15,Medical Mission,Health,500,Completed,RCP20250915002
```

---

## 🐛 TROUBLESHOOTING

### Problem: 500 Error
```bash
# Check Laravel log
tail -f storage/logs/laravel.log

# Common fix:
php artisan config:clear
php artisan cache:clear
composer dump-autoload
```

### Problem: PDF is blank
```bash
# Check if views exist
ls -la resources/views/reports/

# Expected files:
# - layouts/pdf.blade.php
# - donor-statement.blade.php
# - charity-report.blade.php
# - platform-report.blade.php
# - activity-log.blade.php
```

### Problem: "Class ReportGenerator not found"
```bash
composer dump-autoload
```

### Problem: Authentication errors
```bash
# Make sure you're using the correct token
# Token should start with: Bearer ...
```

---

## 📋 AVAILABLE ENDPOINTS

### Donor
- `GET /api/donor/reports/export-pdf` - PDF Statement
- `GET /api/donor/reports/export-csv` - CSV History

### Charity
- `GET /api/charity/reports/export-pdf` - PDF Report
- `GET /api/charity/reports/export-csv` - CSV Donations

### Admin
- `GET /api/admin/activity-logs/export` - CSV Activity Log
- `GET /api/admin/activity-logs/export-pdf` - PDF Activity Log
- `GET /api/admin/fund-tracking/export` - CSV Fund Tracking
- `GET /api/admin/fund-tracking/export-pdf` - PDF Platform Report

---

## 🎯 INTEGRATION TO-DO LIST

- [ ] Add "Download PDF" button to Donor Dashboard
- [ ] Add "Download CSV" button to Donor Donations page
- [ ] Add "Export Report" button to Charity Dashboard
- [ ] Add "Download Logs" button to Admin Activity page
- [ ] Add "Platform Report" button to Admin Dashboard
- [ ] Add loading spinner during export
- [ ] Add success toast notification
- [ ] Test on mobile devices
- [ ] Test with large datasets (1000+ records)

---

## ✨ SUCCESS CRITERIA

Your export system is working if:

1. ✅ You can download a PDF from each endpoint
2. ✅ The PDF opens and looks professional
3. ✅ The CSV opens in Excel with proper formatting
4. ✅ Data matches what's in the database
5. ✅ No errors in console or Laravel log
6. ✅ File naming follows the standard format
7. ✅ Branding (logo/colors) is visible
8. ✅ All tables and charts render correctly

---

## 🎊 YOU'RE DONE!

Once all tests pass, your export system is **production-ready**!

Next steps:
1. Integrate download buttons in frontend
2. Test with real users
3. Deploy to production
4. Celebrate! 🎉

---

**Need help? Check:**
- `EXPORT_IMPLEMENTATION_SUMMARY.md` - Full technical docs
- Laravel logs - `storage/logs/laravel.log`
- Browser console - Network tab for API errors
