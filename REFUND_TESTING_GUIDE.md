# 🧪 REFUND SYSTEM - END-TO-END TESTING GUIDE

**Date:** November 7, 2025  
**Purpose:** Verify complete refund system functionality

---

## ✅ PRE-TESTING CHECKLIST

### Backend Setup
- [ ] Database migrated: `php artisan migrate`
- [ ] Mail configured in `.env`
- [ ] Queue worker running: `php artisan queue:work`
- [ ] Storage linked: `php artisan storage:link`
- [ ] Backend server running

### Frontend Setup
- [ ] Dependencies installed: `npm install`
- [ ] Build successful: `npm run build`
- [ ] Dev server running: `npm run dev`
- [ ] API_URL configured

### Test Data Required
- [ ] At least 1 donor account
- [ ] At least 1 charity account
- [ ] At least 1 admin account
- [ ] At least 1 completed donation (made within last 7 days)
- [ ] At least 1 completed donation (older than 7 days)
- [ ] At least 1 campaign with end_date in future
- [ ] At least 1 campaign that has ended

---

## 🎯 TEST SCENARIO 1: SUCCESSFUL REFUND REQUEST (HAPPY PATH)

### Setup
1. Log in as **Donor**
2. Have a completed donation made within last 7 days
3. Campaign is still active (not ended)

### Steps to Test

#### 1.1 Navigate to Donation History
- [ ] Go to `/donor/history`
- [ ] Verify donation list loads
- [ ] Locate the recent completed donation

#### 1.2 View Donation Details
- [ ] Click "View Details" on the donation
- [ ] Modal opens with donation details
- [ ] Verify refund section is visible
- [ ] Check "Days remaining" message shows correct number
- [ ] Verify "Request Refund" button is enabled

#### 1.3 Open Refund Request Dialog
- [ ] Click "Request Refund" button
- [ ] Refund dialog opens
- [ ] Verify warning banner displays (red background)
- [ ] Check donation information is correctly shown
- [ ] Verify all form fields are present:
  - Reason textarea
  - Proof upload area
  - Acknowledgement checkbox
  - "What happens next" info box

#### 1.4 Fill Out Refund Form
- [ ] Enter reason: "Accidental duplicate payment"
- [ ] Character counter shows correct count
- [ ] Optionally upload a proof file (JPG/PNG/PDF)
- [ ] Verify file preview shows after upload
- [ ] Check acknowledgement checkbox
- [ ] "Submit" button becomes enabled

#### 1.5 Submit Refund Request
- [ ] Click "Submit Refund Request"
- [ ] Success toast appears
- [ ] Dialog closes
- [ ] Verify donation details modal closes

#### 1.6 Verify Emails Sent
- [ ] Check donor's email inbox
- [ ] Verify confirmation email received
- [ ] Email subject: "Refund Request Confirmation"
- [ ] Email contains refund details
- [ ] "View Refund Status" button present

- [ ] Check charity admin's email inbox
- [ ] Verify notification email received
- [ ] Email subject: "New Refund Request"
- [ ] Email contains donor info and reason
- [ ] Link to review request present

#### 1.7 Check Donor Refund History
- [ ] Navigate to `/donor/refunds`
- [ ] Page loads successfully
- [ ] Statistics show:
  - Total: 1
  - Pending: 1
  - Approved: 0
  - Denied: 0
- [ ] Refund request card displays
- [ ] Status badge shows "Pending" (yellow)
- [ ] Click "View" button
- [ ] Details modal opens
- [ ] All information correct
- [ ] Status banner shows "Pending Review"

---

## 🎯 TEST SCENARIO 2: CHARITY APPROVAL FLOW

### Setup
- Use refund request from Test Scenario 1
- Log in as **Charity Admin**

### Steps to Test

#### 2.1 Navigate to Refund Requests
- [ ] Go to `/charity/refunds`
- [ ] Page loads successfully
- [ ] Statistics display correctly:
  - Total: 1
  - Pending: 1
  - Approved: 0
  - Denied: 0
  - Total Requested: correct amount
  - Total Approved: ₱0

#### 2.2 View Refund Request
- [ ] Refund request card displays
- [ ] Donor information visible (name, email)
- [ ] Campaign name correct
- [ ] Amount correct
- [ ] Dates correct
- [ ] Reason displayed
- [ ] Proof link shown (if uploaded)
- [ ] Status badge shows "Pending"

#### 2.3 Click to Approve
- [ ] Click "Approve" button
- [ ] Review dialog opens
- [ ] Green approval banner displays
- [ ] Refund details summary shown
- [ ] Donor's reason displayed
- [ ] Response textarea available

#### 2.4 Submit Approval
- [ ] Enter response: "Approved – refund sent via GCash"
- [ ] Click "Approve Refund" button
- [ ] Success toast appears
- [ ] Dialog closes
- [ ] Page refreshes
- [ ] Statistics update:
  - Pending: 0
  - Approved: 1
  - Total Approved: correct amount

#### 2.5 Verify Updated Display
- [ ] Refund card now shows "Approved" badge (green)
- [ ] "Your Response" box displays below
- [ ] Response message visible
- [ ] Reviewed date shown
- [ ] No action buttons (already reviewed)

#### 2.6 Verify Donor Email
- [ ] Check donor's email inbox
- [ ] Decision email received
- [ ] Email subject contains "Approved"
- [ ] Green approval banner in email
- [ ] Charity response message shown
- [ ] Next steps information present
- [ ] Link to view refund status

#### 2.7 Verify Donor Can See Update
- [ ] Log in as donor
- [ ] Go to `/donor/refunds`
- [ ] Statistics updated (Approved: 1)
- [ ] Click "Approved" tab
- [ ] Refund request shows
- [ ] Status badge green "Approved"
- [ ] Click "View"
- [ ] Green status banner in modal
- [ ] Charity response visible
- [ ] "Next Steps" shows approved message

---

## 🎯 TEST SCENARIO 3: CHARITY DENIAL FLOW

### Setup
- Create a new refund request
- Log in as **Charity Admin**

### Steps to Test

#### 3.1 Submit New Refund (as Donor)
- [ ] Create another refund request
- [ ] Verify it appears in charity's pending list

#### 3.2 Deny Refund Request
- [ ] Go to `/charity/refunds`
- [ ] Click "Deny" button on request
- [ ] Review dialog opens
- [ ] Red denial banner displays
- [ ] Enter response: "Cannot approve as campaign is already completed"
- [ ] Click "Deny Refund"
- [ ] Success toast shows
- [ ] Statistics update (Denied: 1)

#### 3.3 Verify Denial Email
- [ ] Check donor's email
- [ ] Decision email received
- [ ] Email subject contains "Denied"
- [ ] Red denial banner in email
- [ ] Charity response message shown
- [ ] Contact information provided

#### 3.4 Verify Donor View
- [ ] Log in as donor
- [ ] Go to `/donor/refunds`
- [ ] Click "Denied" tab
- [ ] Refund shows with red badge
- [ ] Click "View"
- [ ] Red status banner
- [ ] Charity response visible

---

## 🎯 TEST SCENARIO 4: VALIDATION RULES

### Test 4.1: 7-Day Window Expired
- [ ] Log in as donor
- [ ] Find donation older than 7 days
- [ ] View details
- [ ] Verify "Request Refund" section NOT shown
- [ ] Or shows message "Refund window expired"

### Test 4.2: Campaign Ended
- [ ] Find donation to ended campaign
- [ ] Attempt to request refund
- [ ] Verify error: "Refunds not allowed for ended campaigns"

### Test 4.3: Non-Completed Donation
- [ ] Find pending/rejected donation
- [ ] View details
- [ ] Verify no refund button
- [ ] Or attempt API call returns error

### Test 4.4: Duplicate Request
- [ ] Request refund for donation
- [ ] Attempt to request again
- [ ] Verify error: "Refund request already pending"

### Test 4.5: Missing Required Fields
- [ ] Open refund dialog
- [ ] Leave reason empty
- [ ] Try to submit
- [ ] Verify error toast
- [ ] Enter reason but don't check acknowledgement
- [ ] Try to submit
- [ ] Verify error toast

### Test 4.6: File Upload Validation
- [ ] Try to upload 10MB file
- [ ] Verify error: "File size must be less than 5MB"
- [ ] Try to upload .exe file
- [ ] Verify only JPG/PNG/PDF accepted

### Test 4.7: Unauthorized Access
- [ ] As donor, try to access another donor's refund
- [ ] Verify 403 or not shown
- [ ] As charity, try to respond to another charity's refund
- [ ] Verify 403 or not found

---

## 🎯 TEST SCENARIO 5: PROOF UPLOAD

### Test 5.1: Upload Image
- [ ] Request refund
- [ ] Click upload area
- [ ] Select JPG/PNG image (< 5MB)
- [ ] Verify preview shows
- [ ] File name displays
- [ ] File size shows
- [ ] Submit refund
- [ ] Success

### Test 5.2: Remove Uploaded File
- [ ] Upload file
- [ ] Click X button to remove
- [ ] Verify file removed
- [ ] Can submit without file (optional)

### Test 5.3: Upload PDF
- [ ] Upload PDF document
- [ ] Verify accepted
- [ ] Submit refund
- [ ] Success

### Test 5.4: Charity View Proof
- [ ] Log in as charity
- [ ] View refund with proof
- [ ] Click proof link
- [ ] File opens in new tab
- [ ] Verify correct file

---

## 🎯 TEST SCENARIO 6: ADMIN ACTION LOGS

### Test 6.1: Log Creation
- [ ] Submit refund request as donor
- [ ] Log in as admin
- [ ] Go to Action Logs
- [ ] Find `refund_requested` event
- [ ] Verify data includes:
  - refund_request_id
  - donation_id
  - charity_id
  - amount

### Test 6.2: Approval Log
- [ ] Approve refund as charity
- [ ] Check admin action logs
- [ ] Find `refund_approved` event
- [ ] Verify includes charity response

### Test 6.3: Denial Log
- [ ] Deny refund as charity
- [ ] Check admin action logs
- [ ] Find `refund_denied` event
- [ ] Verify all data present

---

## 🎯 TEST SCENARIO 7: UI/UX TESTING

### Test 7.1: Responsive Design
- [ ] Test on mobile (375px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1920px width)
- [ ] All pages responsive
- [ ] No overflow issues
- [ ] Buttons accessible

### Test 7.2: Loading States
- [ ] Submit refund request
- [ ] Verify "Submitting..." button text
- [ ] Button disabled during submission
- [ ] Loading spinner shown on lists

### Test 7.3: Error Handling
- [ ] Disconnect internet
- [ ] Try to submit refund
- [ ] Verify error toast shows
- [ ] Reconnect and retry
- [ ] Success

### Test 7.4: Navigation
- [ ] From donation history to refund page
- [ ] Back button works
- [ ] Breadcrumbs if present
- [ ] All links work

---

## 🎯 TEST SCENARIO 8: EMAIL TESTING

### Test 8.1: Email Queue
- [ ] Stop queue worker
- [ ] Submit refund request
- [ ] Verify emails queued (check jobs table)
- [ ] Start queue worker
- [ ] Verify emails sent

### Test 8.2: Email Content
- [ ] Check all email templates render
- [ ] No broken images
- [ ] Links work
- [ ] Styling correct
- [ ] Mobile-friendly

### Test 8.3: Email Links
- [ ] Click "View Refund Status" in donor email
- [ ] Goes to `/donor/refunds`
- [ ] Click review link in charity email
- [ ] Goes to `/charity/refunds`

---

## 🎯 TEST SCENARIO 9: EDGE CASES

### Test 9.1: Exactly 7 Days
- [ ] Create donation exactly 7 days ago (to the hour)
- [ ] Verify can still request refund
- [ ] Create donation 7 days + 1 minute ago
- [ ] Verify cannot request refund

### Test 9.2: Campaign Ends During Review
- [ ] Submit refund
- [ ] Campaign ends while pending
- [ ] Charity can still approve/deny
- [ ] No errors

### Test 9.3: Large Amounts
- [ ] Request refund for ₱1,000,000
- [ ] Verify displays correctly
- [ ] No formatting issues
- [ ] Decimals handled properly

### Test 9.4: Special Characters
- [ ] Enter reason with special chars: `<script>alert('test')</script>`
- [ ] Verify sanitized/escaped
- [ ] No XSS vulnerability

### Test 9.5: Very Long Reason
- [ ] Enter 1000 character reason
- [ ] Verify accepted
- [ ] Try 1001 characters
- [ ] Verify rejected

---

## 🎯 TEST SCENARIO 10: STATISTICS & FILTERING

### Test 10.1: Donor Statistics
- [ ] Create multiple refunds (various statuses)
- [ ] Go to `/donor/refunds`
- [ ] Verify counts correct
- [ ] Click each tab
- [ ] Only relevant refunds show

### Test 10.2: Charity Statistics
- [ ] Multiple refunds for charity
- [ ] Check statistics dashboard
- [ ] All counts accurate
- [ ] Amounts calculated correctly
- [ ] Filter by status works

---

## ✅ FINAL VERIFICATION

### Checklist
- [ ] All donor features work
- [ ] All charity features work
- [ ] All emails send correctly
- [ ] All validations enforce
- [ ] No console errors
- [ ] No PHP errors in logs
- [ ] Database records correct
- [ ] Action logs complete
- [ ] UI responsive
- [ ] Performance acceptable
- [ ] Security validated

---

## 🐛 BUG REPORTING TEMPLATE

If issues found during testing:

```markdown
**Bug Title:** [Brief description]

**Severity:** Critical / High / Medium / Low

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happens]

**Screenshots:**
[If applicable]

**Environment:**
- Browser: 
- OS: 
- User Role: 
- Test Scenario: 

**Error Messages:**
[Console/Network/Server logs]
```

---

## 📊 TEST RESULTS SUMMARY

**Test Date:** _______________  
**Tester:** _______________

| Scenario | Status | Notes |
|----------|--------|-------|
| 1. Successful Request | ⬜ Pass ⬜ Fail | |
| 2. Charity Approval | ⬜ Pass ⬜ Fail | |
| 3. Charity Denial | ⬜ Pass ⬜ Fail | |
| 4. Validation Rules | ⬜ Pass ⬜ Fail | |
| 5. Proof Upload | ⬜ Pass ⬜ Fail | |
| 6. Admin Logs | ⬜ Pass ⬜ Fail | |
| 7. UI/UX | ⬜ Pass ⬜ Fail | |
| 8. Emails | ⬜ Pass ⬜ Fail | |
| 9. Edge Cases | ⬜ Pass ⬜ Fail | |
| 10. Statistics | ⬜ Pass ⬜ Fail | |

**Overall Result:** ⬜ All Tests Passed ⬜ Issues Found

**Issues Found:** _____ 
**Critical:** _____ 
**High:** _____ 
**Medium:** _____ 
**Low:** _____

---

## 🚀 PRODUCTION READINESS

- [ ] All critical tests passed
- [ ] All high-priority tests passed
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Backups configured
- [ ] Monitoring in place
- [ ] Documentation complete

**READY FOR PRODUCTION:** ⬜ YES ⬜ NO

---

**Testing Guide Version:** 1.0  
**Last Updated:** November 7, 2025
