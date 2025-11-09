# Quick Testing Checklist - Data Fetching Fixes

## 🚀 Quick Start Testing

### 1. Backend Server Setup
```bash
cd capstone_backend
php artisan serve
```
Server should run on: `http://localhost:8000`

### 2. Frontend Server Setup
```bash
cd capstone_frontend
npm run dev
```
Frontend should run on: `http://localhost:5173` (or similar)

---

## ✅ Testing Checklist

### DONOR ROLE TESTS

#### ✅ Donor Dashboard
- [ ] Login as donor
- [ ] Navigate to dashboard
- [ ] **Check:** Total donated amount displays (should be sum of completed donations)
- [ ] **Check:** Charities supported count shows
- [ ] **Check:** Donations made count displays
- [ ] **Check:** First donation date appears
- [ ] **Check:** Latest donation date appears
- [ ] **Check:** Analytics preview shows (if data available)
- [ ] **Check:** Updates from supported charities load
- [ ] **Check:** Suggested campaigns display

**API Endpoint:** `GET /api/donor/dashboard`
**Expected Response:**
```json
{
  "stats": {
    "total_donated": 5000,
    "charities_supported": 3,
    "donations_made": 8
  },
  "by_charity": [...],
  "monthly_trend": [...]
}
```

#### ✅ Donation History Page
- [ ] Navigate to "My Donations" or donation history
- [ ] **Check:** Each row shows charity name (not "Unknown")
- [ ] **Check:** Campaign title shows (or "General Fund")
- [ ] **Check:** Amount displayed correctly with ₱ symbol
- [ ] **Check:** Date formatted properly
- [ ] **Check:** Status badge shows (Pending/Completed/Rejected)
- [ ] **Check:** "View Details" button opens modal with complete info
- [ ] **Check:** Download receipt works for completed donations

**API Endpoint:** `GET /api/me/donations`
**Expected Response:**
```json
{
  "data": [
    {
      "id": 1,
      "amount": 1000,
      "charity": {
        "id": 1,
        "name": "Charity Name",
        "logo_path": "charity_logos/..."
      },
      "campaign": {
        "id": 1,
        "title": "Campaign Title"
      }
    }
  ]
}
```

#### ✅ Donation Details Modal
- [ ] Click "View Details" on any donation
- [ ] **Check:** Charity name displays
- [ ] **Check:** Campaign name shows
- [ ] **Check:** Amount formatted correctly
- [ ] **Check:** Date readable
- [ ] **Check:** Donation type shown (one-time/recurring)
- [ ] **Check:** Status visible
- [ ] **Check:** Channel used displays (if available)
- [ ] **Check:** Reference number shows (if available)

#### ✅ Campaign Viewing (Donor Side)
- [ ] Browse campaigns
- [ ] Click on any campaign
- [ ] **Check:** Charity logo displays
- [ ] **Check:** Campaign cover image shows
- [ ] **Check:** Donor count displays ("X supporters")
- [ ] **Check:** Total donations amount shows
- [ ] **Check:** Progress bar calculates correctly
- [ ] **Check:** All campaign details present

**API Endpoint:** `GET /api/campaigns/{id}`
**Expected Response:**
```json
{
  "id": 1,
  "title": "Campaign",
  "charity": {
    "name": "Charity Name",
    "logo_path": "charity_logos/..."
  },
  "donors_count": 15,
  "total_donations": 25,
  "current_amount": 50000
}
```

---

### CHARITY ROLE TESTS

#### ✅ Charity Dashboard
- [ ] Login as charity admin
- [ ] Navigate to dashboard
- [ ] **Check:** Total donations amount displays
- [ ] **Check:** Active campaigns count shows
- [ ] **Check:** Pending proofs count displays
- [ ] **Check:** Verified documents count shows
- [ ] **Check:** Total donors count appears
- [ ] **Check:** Donations over time chart renders
- [ ] **Check:** Recent activities list shows
- [ ] **Check:** Top campaigns list displays

**API Endpoint:** `GET /api/charity/dashboard`
**Expected Response:**
```json
{
  "charity": {
    "id": 1,
    "name": "My Charity",
    "logo_path": "charity_logos/..."
  },
  "stats": {
    "totalDonations": 100000,
    "activeCampaigns": 5,
    "pendingProofs": 3,
    "totalDonors": 50
  },
  "donationsOverTime": [...],
  "topCampaigns": [...]
}
```

#### ✅ Donation Inbox (Charity)
- [ ] Navigate to donation inbox
- [ ] **Check:** Each donation shows donor name (or "Anonymous")
- [ ] **Check:** Campaign title displays
- [ ] **Check:** Amount visible
- [ ] **Check:** Proof image link/thumbnail shows
- [ ] **Check:** Status badge displays
- [ ] **Check:** Approve/Reject buttons work
- [ ] **Check:** Channel used shows
- [ ] **Check:** Reference number displays

**API Endpoint:** `GET /api/charities/{id}/donations`
**Expected Response:**
```json
{
  "data": [
    {
      "id": 1,
      "donor": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "campaign": {
        "title": "Campaign Name"
      },
      "amount": 1000,
      "channel_used": "GCash",
      "proof_path": "proofs/..."
    }
  ]
}
```

#### ✅ Campaign Management (Charity)
- [ ] View campaign list
- [ ] Click on campaign
- [ ] **Check:** Cover image displays
- [ ] **Check:** All campaign details show
- [ ] **Check:** Donor count accurate
- [ ] **Check:** Total raised correct
- [ ] **Check:** Progress percentage calculated
- [ ] **Check:** Can edit campaign
- [ ] **Check:** Donation channels listed

---

### ADMIN ROLE TESTS

#### ✅ Admin Dashboard
- [ ] Login as admin
- [ ] Navigate to dashboard
- [ ] **Check:** Total users count displays
- [ ] **Check:** Total donors count shows
- [ ] **Check:** Charity admins count displays
- [ ] **Check:** Approved charities count shows
- [ ] **Check:** Pending verifications count displays
- [ ] **Check:** Total campaigns count shows
- [ ] **Check:** Total donations count displays
- [ ] **Check:** Total donated amount displays
- [ ] **Check:** Registration trend chart renders
- [ ] **Check:** Donation trend chart renders

**API Endpoint:** `GET /api/admin/dashboard`
**Expected Response:**
```json
{
  "stats": {
    "total_users": 150,
    "total_donors": 100,
    "total_charity_admins": 20,
    "approved_charities": 15,
    "pending_charities": 5,
    "total_donations": 500,
    "total_donated_amount": 500000
  },
  "registrationTrend": [...],
  "donationTrend": [...]
}
```

#### ✅ Charity Verification Page
- [ ] Navigate to charity verification/management
- [ ] **Check:** Pending charities list shows
- [ ] **Check:** Charity logos display
- [ ] **Check:** Charity names visible
- [ ] **Check:** Owner information shows
- [ ] **Check:** Document count displays
- [ ] **Check:** Created date visible
- [ ] **Check:** Approve button works
- [ ] **Check:** Reject button works
- [ ] **Check:** Can view documents

**API Endpoint:** `GET /api/admin/charities`
**Expected Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Charity Name",
      "logo_path": "charity_logos/...",
      "owner": {
        "name": "Admin Name",
        "email": "admin@charity.org"
      },
      "documents": [...],
      "campaigns_count": 5,
      "donations_count": 100
    }
  ]
}
```

#### ✅ User Management (Admin)
- [ ] Navigate to user management
- [ ] **Check:** Recent users list displays
- [ ] **Check:** User names visible
- [ ] **Check:** Email addresses show
- [ ] **Check:** Role badges display
- [ ] **Check:** Status badges show (Active/Suspended)
- [ ] **Check:** Suspend button works
- [ ] **Check:** Activate button works

**API Endpoint:** `GET /api/admin/users`

#### ✅ Document Viewing (Admin)
- [ ] View charity details
- [ ] Navigate to documents section
- [ ] **Check:** All uploaded documents listed
- [ ] **Check:** Document type shown (registration, tax, etc.)
- [ ] **Check:** Upload date visible
- [ ] **Check:** Status displayed (approved/pending/rejected)
- [ ] **Check:** View/download links work
- [ ] **Check:** Can approve/reject documents

---

## 🖼️ Image Display Tests

### All Roles Should See:

#### Charity Logos
- [ ] Charity list pages show logos
- [ ] Charity profile pages display logo
- [ ] Donation history shows charity logos
- [ ] Campaign pages show charity logos
- [ ] Admin verification pages show charity logos

**Check:** Images load from `/storage/charity_logos/...`

#### Campaign Cover Images
- [ ] Campaign list shows cover images
- [ ] Campaign detail page displays cover
- [ ] Suggested campaigns show covers
- [ ] Featured campaigns display covers

**Check:** Images load from `/storage/campaign_covers/...`

#### Donation Proof Images
- [ ] Charity inbox shows proof thumbnails/links
- [ ] Donation details modal shows proof
- [ ] Admin can view proof images

**Check:** Images load from `/storage/proofs/...`

#### QR Codes
- [ ] Donation channels show QR codes (if uploaded)
- [ ] GCash/PayMaya QR codes display
- [ ] QR codes downloadable

**Check:** Images load from `/storage/donation_qr/...`

---

## 🐛 Common Issues to Check

### Backend Issues
- [ ] **500 Error on dashboard:** Check database connection
- [ ] **404 on endpoints:** Check routes in `api.php`
- [ ] **401 Unauthorized:** Check token in localStorage/sessionStorage
- [ ] **Images not loading:** Run `php artisan storage:link`
- [ ] **Missing data:** Check database has seeded data

### Frontend Issues
- [ ] **Blank dashboard:** Check API_URL in `.env`
- [ ] **"Unknown Charity":** Check relationship loading in backend
- [ ] **NaN or 0 when should have data:** Check data structure mapping
- [ ] **Images broken:** Check `buildStorageUrl()` function
- [ ] **Charts not rendering:** Check data format for chart library

---

## 🔧 Quick Fixes

### If images don't load:
```bash
cd capstone_backend
php artisan storage:link
```

### If dashboard shows no data:
1. Check you have donations in database
2. Verify user role is correct
3. Check browser console for API errors
4. Verify API_URL in frontend `.env`

### If getting 401 errors:
1. Check token exists in localStorage
2. Re-login to get fresh token
3. Check middleware on routes

### If totals are wrong:
1. Check donation status (should be 'completed')
2. Verify database relationships
3. Check calculation logic in DashboardController

---

## ✅ Success Criteria

All tests pass when:
- ✅ No "Unknown" or missing charity/campaign names
- ✅ All totals calculate correctly (no NaN or 0 when data exists)
- ✅ All images/logos display properly
- ✅ All donor counts match actual donations
- ✅ All charts render with data
- ✅ All donation details complete and informational
- ✅ All verification info displays with documents
- ✅ No console errors related to data fetching
- ✅ No 404/500 errors on API calls
- ✅ All CRUD operations work correctly

---

## 📞 If Issues Persist

Check these files for errors:
1. **Backend logs:** `capstone_backend/storage/logs/laravel.log`
2. **Browser console:** F12 → Console tab
3. **Network tab:** F12 → Network tab → Check API responses
4. **Database:** Verify data exists with correct relationships

Common debugging SQL:
```sql
-- Check donations have charity_id
SELECT id, charity_id, campaign_id, amount, status FROM donations;

-- Check charities exist
SELECT id, name, logo_path FROM charities;

-- Check campaigns have charity_id
SELECT id, title, charity_id FROM campaigns;
```

---

**Last Updated:** October 28, 2024
**Status:** ✅ All fixes implemented and ready for testing
