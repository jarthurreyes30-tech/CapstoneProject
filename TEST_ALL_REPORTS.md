# 🧪 COMPLETE REPORT TESTING GUIDE

**Quick verification for all 5 report types**

---

## 🚀 BEFORE TESTING

### 1. Start Laravel Server
```bash
cd capstone_backend
php artisan serve
```

Server running at: `http://localhost:8000`

### 2. Get Authentication Tokens

**For Donor Tests:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "testdonor1@charityhub.com", "password": "password123"}'
```

Copy the `token` from response.

**For Charity Tests:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "testcharity1@charityhub.com", "password": "charity123"}'
```

Copy the `token` from response.

---

## ✅ TEST 1: Donor Audit Report (PDF)

### Postman Test
```
Method: GET
URL: http://localhost:8000/api/me/audit-report
Headers:
  Authorization: Bearer {YOUR_DONOR_TOKEN}
  Accept: application/pdf
```

### cURL Test
```bash
curl -X GET "http://localhost:8000/api/me/audit-report" \
  -H "Authorization: Bearer {YOUR_DONOR_TOKEN}" \
  -H "Accept: application/pdf" \
  --output donor_audit_report.pdf
```

### Expected Result
- ✅ File downloads: `donor_audit_report_2025-11-07.pdf`
- ✅ File size: > 10 KB
- ✅ Opens in PDF reader
- ✅ Shows donor name and donations

### Browser Test (JavaScript Console)
```javascript
// Run this in browser console after logging in as donor
const token = localStorage.getItem('auth_token');
fetch('http://localhost:8000/api/me/audit-report', {
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
  a.download = 'test_donor_audit.pdf';
  document.body.appendChild(a);
  a.click();
  a.remove();
  console.log('✅ Downloaded!');
});
```

---

## ✅ TEST 2: Donor CSV Export

### Postman Test
```
Method: GET
URL: http://localhost:8000/api/me/export-csv
Headers:
  Authorization: Bearer {YOUR_DONOR_TOKEN}
Query Params:
  start_date: 2024-01-01
  end_date: 2025-12-31
```

### cURL Test
```bash
curl -X GET "http://localhost:8000/api/me/export-csv?start_date=2024-01-01" \
  -H "Authorization: Bearer {YOUR_DONOR_TOKEN}" \
  --output donations_export.csv
```

### Expected Result
- ✅ File downloads: `donations_{donorname}_{date}.csv`
- ✅ Opens in Excel correctly
- ✅ Headers: Date, Campaign, Charity, Amount, Status
- ✅ UTF-8 characters display properly

### Verification
```bash
# View CSV contents
cat donations_export.csv

# Expected format:
# Date,Campaign,Charity,Amount,Status
# 2024-10-15 14:30:00,School Project,Hope Foundation,1000.00,Completed
```

---

## ✅ TEST 3: Charity Audit Report (PDF)

### Postman Test
```
Method: GET
URL: http://localhost:8000/api/charity/audit-report
Headers:
  Authorization: Bearer {YOUR_CHARITY_TOKEN}
  Accept: application/pdf
Query Params (optional):
  start_date: 2024-01-01
  end_date: 2025-12-31
```

### cURL Test
```bash
curl -X GET "http://localhost:8000/api/charity/audit-report" \
  -H "Authorization: Bearer {YOUR_CHARITY_TOKEN}" \
  -H "Accept: application/pdf" \
  --output charity_audit_report.pdf
```

### Expected Result
- ✅ File downloads: `charity_audit_report_{charityname}_{date}.pdf`
- ✅ Shows charity name and registration number
- ✅ Lists all received donations
- ✅ **Top donors section is included**
- ✅ Campaign breakdown is present
- ✅ Monthly trends are displayed

---

## ✅ TEST 4: Charity CSV Export

### Postman Test
```
Method: GET
URL: http://localhost:8000/api/charity/export-csv
Headers:
  Authorization: Bearer {YOUR_CHARITY_TOKEN}
```

### cURL Test
```bash
curl -X GET "http://localhost:8000/api/charity/export-csv" \
  -H "Authorization: Bearer {YOUR_CHARITY_TOKEN}" \
  --output charity_donations.csv
```

### Expected Result
- ✅ File downloads: `charity_donations_{date}.csv`
- ✅ Headers: Donor Name, Donation Amount, Campaign, Date, Status
- ✅ Anonymous donations show "Anonymous"
- ✅ Opens correctly in Excel

---

## ✅ TEST 5: Admin Platform Report (PDF)

### Postman Test
```
Method: GET
URL: http://localhost:8000/api/admin/platform-report
Headers:
  Authorization: Bearer {YOUR_ADMIN_TOKEN}
  Accept: application/pdf
Query Params (optional):
  days: 90
```

### cURL Test
```bash
curl -X GET "http://localhost:8000/api/admin/platform-report?days=90" \
  -H "Authorization: Bearer {YOUR_ADMIN_TOKEN}" \
  -H "Accept: application/pdf" \
  --output platform_report.pdf
```

### Expected Result
- ✅ File downloads: `platform_report_{Month_Year}.pdf`
- ✅ Shows total users (donors, charities, active users)
- ✅ Lists verified charities count
- ✅ Displays total donations and amount raised
- ✅ **Top 10 charities ranking**
- ✅ Monthly donation trends
- ✅ Campaign type distribution

---

## 🔍 VERIFICATION CHECKLIST

### For Each Report, Verify:

#### PDF Reports
- [ ] File downloads successfully (not blank page)
- [ ] Filename matches specification exactly
- [ ] PDF opens without errors
- [ ] CharityHub logo is visible
- [ ] Header and footer are present
- [ ] Watermark is visible
- [ ] Tables are formatted correctly
- [ ] Summary boxes are displayed
- [ ] Color theme is green (#10b981)
- [ ] All data is accurate
- [ ] Date generated is shown
- [ ] No missing images or broken layout

#### CSV Exports
- [ ] File downloads successfully
- [ ] Filename matches specification
- [ ] Opens in Excel without issues
- [ ] All columns are present
- [ ] Headers are correct
- [ ] UTF-8 characters display properly
- [ ] Numbers are formatted correctly
- [ ] No extra commas or broken rows
- [ ] Data matches database records

---

## 🐛 COMMON ISSUES & FIXES

### Issue: "Unauthenticated" Error (401)
**Cause:** Token is missing or invalid

**Fix:**
```bash
# Get a fresh token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "testdonor1@charityhub.com", "password": "password123"}'

# Copy the new token and use it
```

---

### Issue: "Forbidden" Error (403)
**Cause:** User doesn't have permission

**Fix:**
- Donors can only access `/api/me/audit-report` and `/api/me/export-csv`
- Charities can only access `/api/charity/*` routes
- Admins can only access `/api/admin/*` routes

Check you're using the correct token for the route.

---

### Issue: PDF Download is Blank
**Cause:** No data in database or view error

**Fix:**
```bash
# Check Laravel logs
tail -f storage/logs/laravel.log

# Verify test data exists
php artisan tinker
>>> \App\Models\Donation::count()
>>> \App\Models\User::where('email', 'testdonor1@charityhub.com')->first()

# Clear caches
php artisan config:clear
php artisan view:clear
php artisan cache:clear
```

---

### Issue: CSV Shows Weird Characters
**Cause:** Encoding issue (even though UTF-8 BOM is added)

**Fix:**
1. Open CSV in Notepad
2. File > Save As
3. Encoding: UTF-8
4. Open in Excel: Data > From Text/CSV > UTF-8

---

### Issue: "Class not found" Error
**Cause:** Composer autoload not updated

**Fix:**
```bash
composer dump-autoload
php artisan config:clear
php artisan cache:clear
```

---

### Issue: Route Not Found (404)
**Cause:** Routes not properly registered

**Fix:**
```bash
# Verify routes exist
php artisan route:list --path=audit
php artisan route:list --path=export-csv
php artisan route:list --path=platform-report

# Should show all 3 controllers
```

---

## 📊 SAMPLE OUTPUT VERIFICATION

### Donor Audit Report Should Include:
```
┌─────────────────────────────────────┐
│         CHARITYHUB                  │
│   Philippine Charity Platform       │
├─────────────────────────────────────┤
│      Donation Statement             │
├─────────────────────────────────────┤
│ Donor: Maria Santos                 │
│ Email: testdonor1@charityhub.com    │
│ Period: Jan 01, 2024 - Nov 07, 2025│
├─────────────────────────────────────┤
│ Summary:                            │
│  Total: ₱50,000 | Donations: 15     │
│  Charities: 3   | Avg: ₱3,333       │
├─────────────────────────────────────┤
│ [TABLE: All donations with dates]  │
│ [TABLE: Breakdown by charity]      │
└─────────────────────────────────────┘
```

### Charity Audit Report Should Include:
```
┌─────────────────────────────────────┐
│         CHARITYHUB                  │
├─────────────────────────────────────┤
│   Charity Performance Report        │
├─────────────────────────────────────┤
│ Charity: Hope Foundation            │
│ Reg No: REG-2024-001                │
│ Period: Jan 01, 2024 - Nov 07, 2025│
├─────────────────────────────────────┤
│ Summary:                            │
│  Total Raised: ₱500,000             │
│  Donations: 250 | Donors: 45        │
│  Active Campaigns: 3                │
├─────────────────────────────────────┤
│ [TABLE: Received donations]         │
│ [TABLE: Top 10 donors] ← NEW!       │
│ [TABLE: Breakdown by campaign]      │
│ [TABLE: Monthly trends]             │
└─────────────────────────────────────┘
```

### Platform Report Should Include:
```
┌─────────────────────────────────────┐
│         CHARITYHUB                  │
├─────────────────────────────────────┤
│   Platform Performance Report       │
├─────────────────────────────────────┤
│ Period: Last 90 days                │
├─────────────────────────────────────┤
│ Platform Overview:                  │
│  Users: 1,250 | Donors: 800         │
│  Charities: 45 | Campaigns: 120     │
│  Total Raised: ₱5,000,000           │
├─────────────────────────────────────┤
│ [TABLE: Top 10 charities]           │
│ [TABLE: Monthly trends]             │
│ [TABLE: Campaign types]             │
└─────────────────────────────────────┘
```

---

## ✅ SUCCESS CRITERIA

All tests pass if:

1. ✅ All 5 endpoints return 200 status
2. ✅ All PDF files download and open
3. ✅ All CSV files export and open in Excel
4. ✅ Filenames match exact specifications
5. ✅ Data is accurate and complete
6. ✅ No console or Laravel log errors
7. ✅ Branding is consistent
8. ✅ Layout is professional
9. ✅ All tables and charts render
10. ✅ Permissions are enforced (403 for wrong role)

---

## 🎯 QUICK TEST SCRIPT

Save this as `test_reports.sh`:

```bash
#!/bin/bash

echo "🧪 Testing All Report Endpoints..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Get donor token
echo "📝 Getting donor token..."
DONOR_TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "testdonor1@charityhub.com", "password": "password123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$DONOR_TOKEN" ]; then
  echo -e "${RED}❌ Failed to get donor token${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Donor token obtained${NC}"

# Test 1: Donor Audit Report
echo ""
echo "📄 Test 1: Donor Audit Report (PDF)..."
HTTP_CODE=$(curl -s -o donor_audit.pdf -w "%{http_code}" \
  "http://localhost:8000/api/me/audit-report" \
  -H "Authorization: Bearer $DONOR_TOKEN" \
  -H "Accept: application/pdf")

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ Donor audit PDF downloaded${NC}"
else
  echo -e "${RED}❌ Failed: HTTP $HTTP_CODE${NC}"
fi

# Test 2: Donor CSV
echo ""
echo "📊 Test 2: Donor CSV Export..."
HTTP_CODE=$(curl -s -o donor_donations.csv -w "%{http_code}" \
  "http://localhost:8000/api/me/export-csv" \
  -H "Authorization: Bearer $DONOR_TOKEN")

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ Donor CSV exported${NC}"
else
  echo -e "${RED}❌ Failed: HTTP $HTTP_CODE${NC}"
fi

# Get charity token
echo ""
echo "📝 Getting charity token..."
CHARITY_TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "testcharity1@charityhub.com", "password": "charity123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$CHARITY_TOKEN" ]; then
  echo -e "${RED}❌ Failed to get charity token${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Charity token obtained${NC}"

# Test 3: Charity Audit Report
echo ""
echo "🏥 Test 3: Charity Audit Report (PDF)..."
HTTP_CODE=$(curl -s -o charity_audit.pdf -w "%{http_code}" \
  "http://localhost:8000/api/charity/audit-report" \
  -H "Authorization: Bearer $CHARITY_TOKEN" \
  -H "Accept: application/pdf")

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ Charity audit PDF downloaded${NC}"
else
  echo -e "${RED}❌ Failed: HTTP $HTTP_CODE${NC}"
fi

# Test 4: Charity CSV
echo ""
echo "📊 Test 4: Charity CSV Export..."
HTTP_CODE=$(curl -s -o charity_donations.csv -w "%{http_code}" \
  "http://localhost:8000/api/charity/export-csv" \
  -H "Authorization: Bearer $CHARITY_TOKEN")

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ Charity CSV exported${NC}"
else
  echo -e "${RED}❌ Failed: HTTP $HTTP_CODE${NC}"
fi

echo ""
echo "🎉 All tests complete! Check the downloaded files."
echo ""
echo "Files created:"
ls -lh donor_audit.pdf donor_donations.csv charity_audit.pdf charity_donations.csv 2>/dev/null || echo "Some files may be missing"
```

---

## 🎊 FINAL VERIFICATION

After running all tests, you should have:

```
✅ donor_audit_report_2025-11-07.pdf
✅ donations_maria_santos_2025-11-07.csv
✅ charity_audit_report_hope_foundation_2025-11-07.pdf
✅ charity_donations_2025-11-07.csv
✅ platform_report_November_2025.pdf
```

All files should open correctly with accurate data!

---

**🎉 If all tests pass, your report system is FULLY FUNCTIONAL! 🎉**
