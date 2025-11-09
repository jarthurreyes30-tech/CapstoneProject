# 🔐 TEST ACCOUNTS CREDENTIALS

**Generated:** November 7, 2025  
**Total Accounts:** 10 (5 Donors + 5 Charities)  
**Total Donations:** 20  
**Total Campaigns:** 6-8

---

## 👥 DONOR ACCOUNTS

All donor accounts use the password: **`password123`**

| # | Name | Email | Phone | Location |
|---|------|-------|-------|----------|
| 1 | Maria Santos | testdonor1@charityhub.com | +639171234567 | Manila, Metro Manila |
| 2 | Juan Dela Cruz | testdonor2@charityhub.com | +639182345678 | Quezon City, Metro Manila |
| 3 | Ana Reyes | testdonor3@charityhub.com | +639193456789 | Makati, Metro Manila |
| 4 | Carlos Garcia | testdonor4@charityhub.com | +639204567890 | Pasig, Metro Manila |
| 5 | Sofia Mendoza | testdonor5@charityhub.com | +639215678901 | Taguig, Metro Manila |

### Donor Profile Details

**Maria Santos**
- Occupation: Software Engineer
- Company: Tech Solutions Inc.
- Interests: Education, Health, Environment

**Juan Dela Cruz**
- Occupation: Business Owner
- Company: Cruz Enterprises
- Interests: Poverty Alleviation, Children

**Ana Reyes**
- Occupation: Marketing Manager
- Company: Global Marketing Corp
- Interests: Women Empowerment, Education

**Carlos Garcia**
- Occupation: Doctor
- Company: Medical City Hospital
- Interests: Health, Medical Assistance

**Sofia Mendoza**
- Occupation: Lawyer
- Company: Mendoza Law Firm
- Interests: Legal Aid, Human Rights, Education

---

## 🏢 CHARITY ACCOUNTS

All charity accounts use the password: **`charity123`**

| # | Organization Name | Email | Phone | Acronym |
|---|-------------------|-------|-------|---------|
| 1 | Hope Foundation Philippines | testcharity1@charityhub.com | +63280000001 | HFP |
| 2 | Healing Hands Medical Mission | testcharity2@charityhub.com | +63280000002 | HHMM |
| 3 | Green Earth Alliance | testcharity3@charityhub.com | +63280000003 | GEA |
| 4 | Feed the Children PH | testcharity4@charityhub.com | +63280000004 | FTCPH |
| 5 | Disaster Relief Network | testcharity5@charityhub.com | +63280000005 | DRN |

### Charity Profile Details

#### 1. Hope Foundation Philippines (HFP)
- **Mission:** To empower Filipino youth through quality education and character development
- **Vision:** A Philippines where every child has access to quality education
- **Focus Areas:** Education, Youth Development, Scholarship Programs
- **Location:** Manila, Metro Manila
- **Status:** Approved & Verified

#### 2. Healing Hands Medical Mission (HHMM)
- **Mission:** To deliver accessible healthcare to those who need it most
- **Vision:** Healthy communities across the Philippines
- **Focus Areas:** Healthcare, Medical Assistance, Community Health
- **Location:** Quezon City, Metro Manila
- **Status:** Approved & Verified

#### 3. Green Earth Alliance (GEA)
- **Mission:** To protect and restore the Philippine environment through community action
- **Vision:** A sustainable and thriving ecosystem for future generations
- **Focus Areas:** Environment, Climate Change, Conservation
- **Location:** Makati, Metro Manila
- **Status:** Approved & Verified

#### 4. Feed the Children PH (FTCPH)
- **Mission:** To ensure no child goes to bed hungry in the Philippines
- **Vision:** Zero child hunger in our communities
- **Focus Areas:** Nutrition, Child Welfare, Food Security
- **Location:** Pasig, Metro Manila
- **Status:** Approved & Verified

#### 5. Disaster Relief Network (DRN)
- **Mission:** To provide immediate relief and long-term recovery support to disaster victims
- **Vision:** Resilient communities prepared for and recovering from disasters
- **Focus Areas:** Disaster Relief, Emergency Response, Community Resilience
- **Location:** Taguig, Metro Manila
- **Status:** Approved & Verified

---

## 📊 DATA GENERATED

### Campaigns (6-8 per charity)
Sample campaigns include:
- Back to School Program 2025
- Free Medical Mission
- Tree Planting Initiative
- Feeding Program
- Emergency Relief Fund
- Scholarship Fund
- Community Health Center
- Clean Water Project

**Status Mix:**
- Active/Published campaigns (future deadline)
- Closed campaigns (past deadline)

**Target Amounts:** ₱100,000 - ₱1,000,000

### Donations (20 total)
- **Status:** 75% Completed, 25% Pending
- **Amounts:** ₱100 - ₱10,000
- **Distribution:** Randomly assigned across all campaigns and charities
- **Dates:** Created within last 60 days
- **Anonymous:** ~20% of donations are anonymous
- **Purpose:** Mix of General, Project, and Emergency

**Donation Details:**
- Each donation has a unique reference number (TXN...)
- Completed donations have receipt numbers (RCP...)
- All donations have proper donor-charity-campaign relationships
- Timestamps span across different dates for realistic analytics

---

## 🧪 TESTING SCENARIOS

### Test Analytics & Reports
1. **Login as Charity** → View donations dashboard
2. **Check campaign statistics** → See progress bars and donor counts
3. **Export reports** → CSV/Excel downloads
4. **Filter by date range** → Test date pickers
5. **View donor list** → See who donated to each campaign

### Test Donor Features
1. **Login as Donor** → View donation history
2. **Download receipts** → For completed donations
3. **View profile** → See cause preferences
4. **Browse campaigns** → Find active campaigns
5. **Make new donation** → Test donation flow
6. **Request refund** → Test refund system (for recent donations)

### Test Charity Features
1. **Login as Charity** → Access charity dashboard
2. **View campaign performance** → Analytics and metrics
3. **Manage campaigns** → Edit, update, close
4. **Process donations** → Verify pending donations
5. **Respond to refunds** → Approve/deny refund requests
6. **Download donor reports** → Export for records

### Test Admin Features (if admin account exists)
1. **View all donations** → System-wide overview
2. **Monitor charity activity** → Verification status
3. **Review action logs** → Audit trail
4. **Generate reports** → Platform-wide analytics

---

## 💡 QUICK TEST GUIDE

### 1. Login Test
```
URL: /auth/login
Donor Email: testdonor1@charityhub.com
Password: password123

OR

Charity Email: testcharity1@charityhub.com
Password: charity123
```

### 2. View Donations (as Donor)
```
Login → Navigate to "Donation History"
Should see: Multiple donations with various statuses
Can: Download receipts, view details, request refunds
```

### 3. View Campaigns (as Charity)
```
Login → Navigate to "Campaigns"
Should see: Active campaigns with donation stats
Can: Edit campaigns, view donors, manage funds
```

### 4. Analytics Testing
```
Login as Charity → Navigate to "Analytics" or "Reports"
Should see:
- Total donations received
- Campaign progress charts
- Donor demographics
- Monthly/yearly trends
- Top donors
- Export options
```

### 5. Refund System Testing
```
Login as Donor → Find recent donation (< 7 days old)
Request Refund → Fill form → Submit
Login as Charity → Navigate to "Refunds"
Review Request → Approve or Deny
Check Email → Both parties should receive notifications
```

---

## 📧 EMAIL TESTING

All test accounts have verified email addresses. If you have mail configured:

**Expected Emails:**
1. **Donation Confirmation** (to donor)
2. **Donation Notification** (to charity)
3. **Refund Request Confirmation** (to donor)
4. **Refund Request Alert** (to charity)
5. **Refund Decision** (to donor)

---

## 🔧 DATABASE ACCESS

If you need to verify data directly:

```sql
-- View all test donors
SELECT * FROM users WHERE email LIKE 'testdonor%@charityhub.com';

-- View all test charities
SELECT * FROM users WHERE email LIKE 'testcharity%@charityhub.com';

-- View all donations
SELECT d.*, u.name as donor_name, c.name as charity_name, ca.title as campaign_title
FROM donations d
LEFT JOIN users u ON d.donor_id = u.id
LEFT JOIN charities c ON d.charity_id = c.id
LEFT JOIN campaigns ca ON d.campaign_id = ca.id
WHERE u.email LIKE 'testdonor%@charityhub.com'
ORDER BY d.created_at DESC;

-- View donation statistics
SELECT 
    c.name as charity,
    COUNT(d.id) as total_donations,
    SUM(d.amount) as total_amount,
    SUM(CASE WHEN d.status = 'completed' THEN d.amount ELSE 0 END) as completed_amount
FROM charities c
LEFT JOIN donations d ON c.id = d.charity_id
WHERE c.contact_email LIKE 'testcharity%@charityhub.com'
GROUP BY c.id;
```

---

## 🎯 WHAT TO TEST

### ✅ Must Test
- [ ] Login with all donor accounts
- [ ] Login with all charity accounts
- [ ] View donation history (donor side)
- [ ] View campaign donations (charity side)
- [ ] Download receipts
- [ ] Export analytics/reports
- [ ] Filter donations by date
- [ ] Search donations
- [ ] View campaign statistics
- [ ] Request refund (< 7 days old donation)
- [ ] Review refund request (charity)

### ✅ Bonus Testing
- [ ] Create new donation
- [ ] Create new campaign (as charity)
- [ ] Edit donor profile
- [ ] Edit charity profile
- [ ] View notifications
- [ ] Test responsive design (mobile)
- [ ] Test email notifications
- [ ] Export data to CSV/Excel
- [ ] View charts and graphs
- [ ] Test pagination (if applicable)

---

## 🚨 IMPORTANT NOTES

1. **Passwords are simple** - These are TEST accounts only. Use `password123` for donors and `charity123` for charities.

2. **Data is randomized** - Donation amounts, dates, and assignments are randomly generated for realistic testing.

3. **Email verification** - All accounts are pre-verified (`email_verified_at` is set).

4. **Charity verification** - All charities are pre-approved and verified.

5. **Donation dates** - Span across last 60 days for time-based analytics testing.

6. **Refund testing** - Some donations are recent (< 7 days) specifically for refund feature testing.

7. **Status mix** - 75% completed, 25% pending donations for workflow testing.

8. **Re-running seeder** - You can run the seeder again anytime. It will delete existing test accounts and create fresh data.

---

## 🔄 REGENERATING TEST DATA

To regenerate all test data:

```bash
cd capstone_backend
php artisan db:seed --class=TestDataSeeder
```

This will:
1. Delete all existing test accounts (testdonor*, testcharity*)
2. Delete all related campaigns and donations
3. Create fresh 5 donors, 5 charities, 6-8 campaigns, and 20 donations

---

## 📝 FEEDBACK & ISSUES

When testing, note any issues with:
- Login problems
- Data not displaying correctly
- Analytics calculations
- Export functionality
- Email sending
- Performance issues
- UI/UX problems

---

**Ready to test! 🎉**

All accounts are active and ready for comprehensive testing of:
- Analytics dashboards
- Donation tracking
- Campaign management
- Report generation
- Refund system
- Email notifications
- Data exports

---

**Last Updated:** November 7, 2025  
**Seeder Version:** 1.0  
**Total Test Accounts:** 10
