# Manual Testing Checklist
**System:** Charity Donation Platform
**Date:** November 6, 2025
**Tester:** _________________

---

## Testing Instructions

1. Open the application in a browser
2. Test each item in the checklist
3. Mark ✅ if working, ❌ if broken, ⚠️ if partially working
4. Note any issues in the "Notes" column

---

## 1. Public Pages (No Login Required)

| Page | URL | Status | All Buttons Work? | All Links Work? | Notes |
|------|-----|--------|-------------------|-----------------|-------|
| Landing Page | `/` | ☐ | ☐ | ☐ | |
| About Page | `/about` | ☐ | ☐ | ☐ | |
| Contact Page | `/contact` | ☐ | ☐ | ☐ | |
| Charities Directory | `/charities` | ☐ | ☐ | ☐ | |
| Campaigns Directory | `/campaigns` | ☐ | ☐ | ☐ | |
| Campaign Detail | `/campaigns/:id` | ☐ | ☐ | ☐ | |
| Charity Detail | `/charities/:id` | ☐ | ☐ | ☐ | |
| Login Page | `/login` | ☐ | ☐ | ☐ | |
| Register Page | `/register` | ☐ | ☐ | ☐ | |
| Forgot Password | `/forgot-password` | ☐ | ☐ | ☐ | |

---

## 2. Authentication Flow

| Action | Expected Result | Status | Notes |
|--------|----------------|--------|-------|
| Register as Donor | Account created, redirected to dashboard | ☐ | |
| Register as Charity | Account created, redirected to setup | ☐ | |
| Login with valid credentials | Redirected to dashboard | ☐ | |
| Login with invalid credentials | Error message shown | ☐ | |
| Logout | Redirected to login page | ☐ | |
| Forgot password | Email sent (check logs) | ☐ | |
| Reset password | Password changed successfully | ☐ | |
| Email verification | Email verified | ☐ | |

---

## 3. Donor Dashboard & Features

### Dashboard
| Feature | Status | Clickable? | Working? | Notes |
|---------|--------|------------|----------|-------|
| View donation statistics | ☐ | ☐ | ☐ | |
| View recent donations | ☐ | ☐ | ☐ | |
| View followed charities | ☐ | ☐ | ☐ | |
| View notifications | ☐ | ☐ | ☐ | |
| Navigate to make donation | ☐ | ☐ | ☐ | |

### Make Donation Page (`/donor/donate`)
| Feature | Status | Clickable? | Working? | Notes |
|---------|--------|------------|----------|-------|
| Select charity dropdown | ☐ | ☐ | ☐ | |
| Select campaign dropdown | ☐ | ☐ | ☐ | |
| Enter donation amount | ☐ | ☐ | ☐ | |
| Enter reference number | ☐ | ☐ | ☐ | |
| Upload proof of payment | ☐ | ☐ | ☐ | |
| **OCR scanning triggers** | ☐ | ☐ | ☐ | |
| **OCR detects amount** | ☐ | ☐ | ☐ | |
| **OCR detects reference** | ☐ | ☐ | ☐ | |
| **Amount validation (±₱1)** | ☐ | ☐ | ☐ | |
| **Mismatch error shows** | ☐ | ☐ | ☐ | |
| Submit donation button | ☐ | ☐ | ☐ | |
| Success notification | ☐ | ☐ | ☐ | |

### Donation History
| Feature | Status | Clickable? | Working? | Notes |
|---------|--------|------------|----------|-------|
| View all donations | ☐ | ☐ | ☐ | |
| Filter by status | ☐ | ☐ | ☐ | |
| Filter by charity | ☐ | ☐ | ☐ | |
| View donation details | ☐ | ☐ | ☐ | |
| Request refund button | ☐ | ☐ | ☐ | |
| Export donations | ☐ | ☐ | ☐ | |

### Notifications Page (`/donor/notifications`)
| Feature | Status | Clickable? | Working? | Notes |
|---------|--------|------------|----------|-------|
| Page loads | ☐ | ☐ | ☐ | |
| Notifications display | ☐ | ☐ | ☐ | |
| Mark as read button | ☐ | ☐ | ☐ | |
| Mark all as read button | ☐ | ☐ | ☐ | |
| Delete notification button | ☐ | ☐ | ☐ | |
| Refresh button | ☐ | ☐ | ☐ | |
| Unread highlighted | ☐ | ☐ | ☐ | |

### Followed Charities
| Feature | Status | Clickable? | Working? | Notes |
|---------|--------|------------|----------|-------|
| View followed charities | ☐ | ☐ | ☐ | |
| Unfollow button | ☐ | ☐ | ☐ | |
| View charity details link | ☐ | ☐ | ☐ | |

### Profile Settings
| Feature | Status | Clickable? | Working? | Notes |
|---------|--------|------------|----------|-------|
| Edit profile information | ☐ | ☐ | ☐ | |
| Upload profile picture | ☐ | ☐ | ☐ | |
| Change password | ☐ | ☐ | ☐ | |
| Update email | ☐ | ☐ | ☐ | |
| Save changes button | ☐ | ☐ | ☐ | |

---

## 4. Charity Dashboard & Features

### Dashboard
| Feature | Status | Clickable? | Working? | Notes |
|---------|--------|------------|----------|-------|
| View donation statistics | ☐ | ☐ | ☐ | |
| View active campaigns | ☐ | ☐ | ☐ | |
| View recent donations | ☐ | ☐ | ☐ | |
| View notifications | ☐ | ☐ | ☐ | |
| Create campaign button | ☐ | ☐ | ☐ | |

### Campaign Management
| Feature | Status | Clickable? | Working? | Notes |
|---------|--------|------------|----------|-------|
| View all campaigns | ☐ | ☐ | ☐ | |
| Create new campaign | ☐ | ☐ | ☐ | |
| Edit campaign | ☐ | ☐ | ☐ | |
| Delete campaign | ☐ | ☐ | ☐ | |
| Pause/Resume campaign | ☐ | ☐ | ☐ | |
| Upload campaign image | ☐ | ☐ | ☐ | |

### Campaign Updates
| Feature | Status | Clickable? | Working? | Notes |
|---------|--------|------------|----------|-------|
| View campaign updates | ☐ | ☐ | ☐ | |
| Create new update | ☐ | ☐ | ☐ | |
| Mark as milestone | ☐ | ☐ | ☐ | |
| **Mark as completion report** | ☐ | ☐ | ☐ | |
| **Add fund summary** | ☐ | ☐ | ☐ | |
| Upload update image | ☐ | ☐ | ☐ | |
| Edit update | ☐ | ☐ | ☐ | |
| Delete update | ☐ | ☐ | ☐ | |

### Fund Usage Logs
| Feature | Status | Clickable? | Working? | Notes |
|---------|--------|------------|----------|-------|
| View fund usage logs | ☐ | ☐ | ☐ | |
| **Add new fund usage log** | ☐ | ☐ | ☐ | |
| **Select category** | ☐ | ☐ | ☐ | |
| **Enter amount** | ☐ | ☐ | ☐ | |
| **Enter description** | ☐ | ☐ | ☐ | |
| **Upload receipt** | ☐ | ☐ | ☐ | |
| **Enter receipt number** | ☐ | ☐ | ☐ | |
| Submit button | ☐ | ☐ | ☐ | |
| View receipt | ☐ | ☐ | ☐ | |
| Edit fund log | ☐ | ☐ | ☐ | |
| Delete fund log | ☐ | ☐ | ☐ | |

### Notifications Page (`/charity/notifications`)
| Feature | Status | Clickable? | Working? | Notes |
|---------|--------|------------|----------|-------|
| Page loads | ☐ | ☐ | ☐ | |
| Notifications display | ☐ | ☐ | ☐ | |
| Type-specific icons show | ☐ | ☐ | ☐ | |
| Mark as read button | ☐ | ☐ | ☐ | |
| Mark all as read button | ☐ | ☐ | ☐ | |
| Delete notification button | ☐ | ☐ | ☐ | |
| Refresh button | ☐ | ☐ | ☐ | |

### Charity Profile
| Feature | Status | Clickable? | Working? | Notes |
|---------|--------|------------|----------|-------|
| Edit charity information | ☐ | ☐ | ☐ | |
| Upload logo | ☐ | ☐ | ☐ | |
| Upload cover image | ☐ | ☐ | ☐ | |
| Upload documents | ☐ | ☐ | ☐ | |
| Add donation channels | ☐ | ☐ | ☐ | |
| Save changes | ☐ | ☐ | ☐ | |

---

## 5. Admin Dashboard & Features

### Dashboard
| Feature | Status | Clickable? | Working? | Notes |
|---------|--------|------------|----------|-------|
| View system statistics | ☐ | ☐ | ☐ | |
| View pending verifications | ☐ | ☐ | ☐ | |
| View recent reports | ☐ | ☐ | ☐ | |
| Navigate to sections | ☐ | ☐ | ☐ | |

### Charity Verification
| Feature | Status | Clickable? | Working? | Notes |
|---------|--------|------------|----------|-------|
| View pending charities | ☐ | ☐ | ☐ | |
| View charity details | ☐ | ☐ | ☐ | |
| View uploaded documents | ☐ | ☐ | ☐ | |
| Approve charity button | ☐ | ☐ | ☐ | |
| Reject charity button | ☐ | ☐ | ☐ | |
| Add rejection reason | ☐ | ☐ | ☐ | |
| Approve document | ☐ | ☐ | ☐ | |
| Reject document | ☐ | ☐ | ☐ | |

### User Management
| Feature | Status | Clickable? | Working? | Notes |
|---------|--------|------------|----------|-------|
| View all users | ☐ | ☐ | ☐ | |
| Filter by role | ☐ | ☐ | ☐ | |
| Filter by status | ☐ | ☐ | ☐ | |
| View user details | ☐ | ☐ | ☐ | |
| Suspend user | ☐ | ☐ | ☐ | |
| Activate user | ☐ | ☐ | ☐ | |

### Donation Monitoring
| Feature | Status | Clickable? | Working? | Notes |
|---------|--------|------------|----------|-------|
| View all donations | ☐ | ☐ | ☐ | |
| Filter by status | ☐ | ☐ | ☐ | |
| Filter by charity | ☐ | ☐ | ☐ | |
| View donation details | ☐ | ☐ | ☐ | |
| Export donations | ☐ | ☐ | ☐ | |

### Report Management
| Feature | Status | Clickable? | Working? | Notes |
|---------|--------|------------|----------|-------|
| View all reports | ☐ | ☐ | ☐ | |
| View report details | ☐ | ☐ | ☐ | |
| Review report | ☐ | ☐ | ☐ | |
| Resolve report | ☐ | ☐ | ☐ | |
| Dismiss report | ☐ | ☐ | ☐ | |

### Notifications Page (`/admin/notifications`)
| Feature | Status | Clickable? | Working? | Notes |
|---------|--------|------------|----------|-------|
| Page loads | ☐ | ☐ | ☐ | |
| Notifications display | ☐ | ☐ | ☐ | |
| Unread count shows | ☐ | ☐ | ☐ | |
| Mark all as read button | ☐ | ☐ | ☐ | |
| Refresh button | ☐ | ☐ | ☐ | |

---

## 6. Campaign Detail Page (Public)

| Feature | Status | Clickable? | Working? | Notes |
|---------|--------|------------|----------|-------|
| Campaign information displays | ☐ | ☐ | ☐ | |
| Progress bar shows | ☐ | ☐ | ☐ | |
| Donate button | ☐ | ☐ | ☐ | |
| Follow charity button | ☐ | ☐ | ☐ | |
| View updates tab | ☐ | ☐ | ☐ | |
| **View completion report** | ☐ | ☐ | ☐ | |
| **View fund usage tab** | ☐ | ☐ | ☐ | |
| **Financial breakdown shows** | ☐ | ☐ | ☐ | |
| **Fund usage logs display** | ☐ | ☐ | ☐ | |
| **Download receipts** | ☐ | ☐ | ☐ | |
| View comments | ☐ | ☐ | ☐ | |
| Add comment | ☐ | ☐ | ☐ | |
| Share campaign | ☐ | ☐ | ☐ | |

---

## 7. Notification Testing

### Donor Notifications
| Notification Type | Triggered? | Received? | Correct Info? | Notes |
|-------------------|-----------|-----------|---------------|-------|
| Donation Confirmed | ☐ | ☐ | ☐ | |
| Refund Status Update | ☐ | ☐ | ☐ | |
| **Campaign Completion Report** | ☐ | ☐ | ☐ | |
| **Campaign Update Posted** | ☐ | ☐ | ☐ | |
| **Fund Usage Logged** | ☐ | ☐ | ☐ | |
| Campaign Milestone | ☐ | ☐ | ☐ | |

### Charity Notifications
| Notification Type | Triggered? | Received? | Correct Info? | Notes |
|-------------------|-----------|-----------|---------------|-------|
| Donation Received | ☐ | ☐ | ☐ | |
| Charity Approved | ☐ | ☐ | ☐ | |
| Charity Rejected | ☐ | ☐ | ☐ | |
| Refund Request | ☐ | ☐ | ☐ | |
| **Completion Reminder** | ☐ | ☐ | ☐ | |
| Campaign Expiring | ☐ | ☐ | ☐ | |

### Admin Notifications
| Notification Type | Triggered? | Received? | Correct Info? | Notes |
|-------------------|-----------|-----------|---------------|-------|
| New Charity Registration | ☐ | ☐ | ☐ | |
| New Report Submitted | ☐ | ☐ | ☐ | |

---

## 8. End-to-End User Flows

### Flow 1: Complete Donation Process
| Step | Status | Notes |
|------|--------|-------|
| 1. Donor logs in | ☐ | |
| 2. Navigate to Make Donation | ☐ | |
| 3. Select charity and campaign | ☐ | |
| 4. Enter amount (e.g., ₱2,070) | ☐ | |
| 5. Upload receipt image | ☐ | |
| 6. OCR scans and detects ₱2,070.00 | ☐ | |
| 7. Amount validation passes | ☐ | |
| 8. Submit donation | ☐ | |
| 9. Donor receives confirmation notification | ☐ | |
| 10. Charity receives donation notification | ☐ | |

### Flow 2: Campaign Completion (NEW)
| Step | Status | Notes |
|------|--------|-------|
| 1. Campaign ends (manually set end_date) | ☐ | |
| 2. Charity sees completion requirements | ☐ | |
| 3. Charity posts completion report | ☐ | |
| 4. Donors receive completion notification | ☐ | |
| 5. Charity logs fund usage | ☐ | |
| 6. Donors receive fund usage notification | ☐ | |
| 7. Donors can view financial breakdown | ☐ | |
| 8. Donors can download receipts | ☐ | |

### Flow 3: Charity Verification
| Step | Status | Notes |
|------|--------|-------|
| 1. Charity registers | ☐ | |
| 2. Upload required documents | ☐ | |
| 3. Admin receives notification | ☐ | |
| 4. Admin reviews documents | ☐ | |
| 5. Admin approves charity | ☐ | |
| 6. Charity receives approval notification | ☐ | |
| 7. Charity can create campaigns | ☐ | |

---

## 9. Responsive Design Testing

Test on different screen sizes:

| Screen Size | Status | Issues Found |
|-------------|--------|--------------|
| Desktop (1920x1080) | ☐ | |
| Laptop (1366x768) | ☐ | |
| Tablet (768x1024) | ☐ | |
| Mobile (375x667) | ☐ | |

---

## 10. Browser Compatibility

| Browser | Version | Status | Issues Found |
|---------|---------|--------|--------------|
| Chrome | Latest | ☐ | |
| Firefox | Latest | ☐ | |
| Edge | Latest | ☐ | |
| Safari | Latest | ☐ | |

---

## 11. Performance Testing

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Page Load Time | < 3s | | ☐ |
| API Response Time | < 500ms | | ☐ |
| Image Load Time | < 2s | | ☐ |
| No Console Errors | 0 | | ☐ |

---

## 12. Critical Bugs Found

| Bug # | Page/Feature | Description | Severity | Status |
|-------|-------------|-------------|----------|--------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |

**Severity Levels:**
- 🔴 Critical: System unusable
- 🟠 High: Major feature broken
- 🟡 Medium: Feature partially working
- 🟢 Low: Minor cosmetic issue

---

## 13. Missing Features

| Feature | Expected Location | Priority |
|---------|------------------|----------|
| | | |
| | | |
| | | |

---

## 14. Recommendations

### High Priority
1. 
2. 
3. 

### Medium Priority
1. 
2. 
3. 

### Low Priority
1. 
2. 
3. 

---

## 15. Sign-Off

**Tester Name:** _________________
**Date Completed:** _________________
**Overall Status:** ☐ Pass ☐ Pass with Issues ☐ Fail

**Summary:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

**Next Steps:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
