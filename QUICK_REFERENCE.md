# 🚀 REPORT SYSTEM - QUICK REFERENCE CARD

**Use this as a cheat sheet for implementation**

---

## 📋 ALL ENDPOINTS AT A GLANCE

### Donor Endpoints
```
🔵 GET /api/me/audit-report
   └─ Downloads: donor_audit_report_{date}.pdf
   └─ Shows: Complete donation history + summary

🔵 GET /api/me/export-csv
   └─ Downloads: donations_{donorname}_{date}.csv
   └─ Columns: Date, Campaign, Charity, Amount, Status
```

### Charity Endpoints
```
🟢 GET /api/charity/audit-report
   └─ Downloads: charity_audit_report_{charityname}_{date}.pdf
   └─ Shows: Received donations + top donors + stats

🟢 GET /api/charity/export-csv
   └─ Downloads: charity_donations_{date}.csv
   └─ Columns: Donor Name, Donation Amount, Campaign, Date, Status
```

### Admin Endpoints
```
🔴 GET /api/admin/platform-report
   └─ Downloads: platform_report_{month_year}.pdf
   └─ Shows: Platform stats + top charities + trends
```

---

## 🎯 WHERE TO ADD BUTTONS

### 1. Donor Dashboard (`/donor/my-donations`)
```jsx
<Button onClick={downloadDonorAudit}>
  📄 Download Audit Report
</Button>

<Button onClick={exportDonorCSV}>
  📊 Export CSV
</Button>
```

### 2. Charity Dashboard (`/charity/dashboard`)
```jsx
<Button onClick={downloadCharityAudit}>
  📄 Download Audit Report
</Button>

<Button onClick={exportCharityCSV}>
  📊 Export Donations CSV
</Button>
```

### 3. Admin Dashboard (`/admin/dashboard`)
```jsx
<Button onClick={downloadPlatformReport}>
  📄 Generate Platform Report
</Button>
```

---

## 💻 COPY-PASTE CODE

### Donor Audit Download
```typescript
const downloadDonorAudit = async () => {
  try {
    const response = await api.get('/me/audit-report', {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = `donor_audit_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    toast.success('Report downloaded!');
  } catch (error) {
    toast.error('Download failed');
  }
};
```

### Charity Audit Download
```typescript
const downloadCharityAudit = async () => {
  try {
    const response = await api.get('/charity/audit-report', {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = `charity_audit_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    toast.success('Report downloaded!');
  } catch (error) {
    toast.error('Download failed');
  }
};
```

### Platform Report Download
```typescript
const downloadPlatformReport = async () => {
  try {
    const response = await api.get('/admin/platform-report', {
      responseType: 'blob',
      params: { days: 90 }
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    const monthYear = new Date().toLocaleString('default', { month: 'long', year: 'numeric' }).replace(' ', '_');
    link.download = `platform_report_${monthYear}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    toast.success('Report generated!');
  } catch (error) {
    toast.error('Generation failed');
  }
};
```

### CSV Export (Universal)
```typescript
const exportCSV = async (endpoint: string, filename: string) => {
  try {
    const response = await api.get(endpoint, {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    toast.success('CSV exported!');
  } catch (error) {
    toast.error('Export failed');
  }
};

// Usage:
exportCSV('/me/export-csv', 'donations');
exportCSV('/charity/export-csv', 'charity_donations');
```

---

## 🧪 QUICK TEST (Postman)

### Test Donor Report
```
1. POST http://localhost:8000/api/auth/login
   Body: {"email": "testdonor1@charityhub.com", "password": "password123"}
   
2. Copy token from response

3. GET http://localhost:8000/api/me/audit-report
   Headers: 
     Authorization: Bearer {token}
     Accept: application/pdf
     
✅ Should download PDF
```

### Test Charity Report
```
1. POST http://localhost:8000/api/auth/login
   Body: {"email": "testcharity1@charityhub.com", "password": "charity123"}
   
2. Copy token

3. GET http://localhost:8000/api/charity/audit-report
   Headers: 
     Authorization: Bearer {token}
     Accept: application/pdf
     
✅ Should download PDF with top donors
```

---

## 🎨 BUTTON STYLING

### TailwindCSS Style
```jsx
<button
  onClick={downloadReport}
  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
  disabled={loading}
>
  {loading ? (
    <>
      <Loader2 className="w-4 h-4 animate-spin" />
      Generating...
    </>
  ) : (
    <>
      <FileText className="w-4 h-4" />
      Download Report
    </>
  )}
</button>
```

### shadcn/ui Style
```jsx
<Button 
  onClick={downloadReport}
  disabled={loading}
  className="gap-2"
>
  {loading ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : (
    <Download className="h-4 w-4" />
  )}
  {loading ? 'Downloading...' : 'Download PDF'}
</Button>
```

---

## 🔐 AUTH TOKENS

### Get Donor Token
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "testdonor1@charityhub.com", "password": "password123"}'
```

### Get Charity Token
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "testcharity1@charityhub.com", "password": "charity123"}'
```

---

## ⚠️ COMMON ERRORS

| Error | Cause | Fix |
|-------|-------|-----|
| 401 Unauthorized | No token | Add `Authorization: Bearer {token}` header |
| 403 Forbidden | Wrong role | Use correct token for endpoint |
| 404 Not Found | Wrong URL | Check endpoint spelling |
| 500 Server Error | Backend issue | Check Laravel logs |
| Blank PDF | No data | Ensure test data exists |

---

## 📊 EXPECTED FILE OUTPUTS

```
✅ donor_audit_report_2025-11-07.pdf (50-200 KB)
✅ donations_maria_santos_2025-11-07.csv (1-10 KB)
✅ charity_audit_report_hope_foundation_2025-11-07.pdf (100-500 KB)
✅ charity_donations_2025-11-07.csv (2-20 KB)
✅ platform_report_November_2025.pdf (200-1000 KB)
```

---

## ✅ VERIFICATION CHECKLIST

After implementing frontend:
- [ ] Click donor download button → PDF downloads
- [ ] Click donor CSV button → CSV downloads
- [ ] Click charity download button → PDF downloads
- [ ] Click charity CSV button → CSV downloads
- [ ] Click admin report button → PDF downloads
- [ ] All files open correctly
- [ ] Data is accurate
- [ ] No console errors
- [ ] Toast notifications appear
- [ ] Loading states work

---

## 🚀 DEPLOYMENT STEPS

1. **Backend:**
   ```bash
   git add .
   git commit -m "Add all report generation features"
   git push
   php artisan config:cache
   php artisan route:cache
   ```

2. **Frontend:**
   - Add download buttons to pages
   - Implement axios blob handling
   - Add loading/error states
   - Test in development
   - Build and deploy

3. **Verify:**
   - Test each endpoint in production
   - Check file downloads
   - Monitor error logs

---

## 📚 FULL DOCUMENTATION

- **Complete Guide:** `REPORT_SYSTEM_COMPLETE.md`
- **Testing Guide:** `TEST_ALL_REPORTS.md`
- **Final Summary:** `IMPLEMENTATION_FINAL_SUMMARY.md`

---

**🎉 All 5 reports are ready to use! 🎉**

**Backend Status:** ✅ Complete  
**Frontend Status:** 📝 Needs integration  
**Testing:** ✅ Routes verified

---

_Keep this file handy while implementing the frontend buttons!_
