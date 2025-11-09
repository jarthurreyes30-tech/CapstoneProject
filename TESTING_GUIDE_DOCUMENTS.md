# Testing Guide: Charity Documents & Audit Submissions

## Test Scenario 1: Admin Rejects a Document

### Prerequisites
- Have a charity account with uploaded documents
- Have an admin account
- At least one document should be in "pending" status

### Steps
1. Login as **Admin**
2. Navigate to **Admin Dashboard** → **Charities**
3. Click on a charity with pending documents
4. Go to **Documents** tab
5. Find a document with "Pending Review" badge
6. Click **View** button to preview the document
7. Click **Reject Document** button
8. Enter rejection reason: "Document is blurry and unreadable. Please upload a clearer version."
9. Click **Confirm Rejection**

### Expected Results
✅ Document status changes to "Rejected"
✅ Rejection reason is displayed
✅ If charity was "Approved", status reverts to "Pending"
✅ Charity owner receives notification

---

## Test Scenario 2: Charity Views Rejected Document

### Prerequisites
- Complete Test Scenario 1 first
- Have the charity account credentials

### Steps
1. Login as **Charity Admin** (the charity that had document rejected)
2. Navigate to **Documents** page

### Expected Results
✅ Red alert at top: "Action Required: You have 1 rejected document(s)"
✅ Blue alert showing pending documents count
✅ Rejected document card has:
  - Red border and light red background
  - "Rejected" badge in red
  - Alert box showing rejection reason
  - "Re-upload" button (blue, prominent)
✅ Other documents show correct status badges

---

## Test Scenario 3: Charity Re-uploads Rejected Document

### Prerequisites
- Complete Test Scenario 2
- Have a corrected document file ready (PDF, JPG, or PNG)

### Steps
1. On the Documents page, find the rejected document
2. Click the **Re-upload** button
3. Upload dialog opens

### Expected Results in Dialog
✅ Title shows "Re-upload Document"
✅ Description: "Upload a corrected version of the rejected document"
✅ Red alert box displays the rejection reason
✅ Document type field is pre-filled and disabled
✅ Text below shows: "Re-uploading: [Document Type]"
✅ File upload field is active
✅ Expiry date checkbox and field (if document had expiry)

### Continue Steps
4. Select a new file (corrected version)
5. If document has expiry, update expiry date if needed
6. Click **Re-upload Document** button

### Expected Results
✅ Success toast: "Document uploaded successfully" or "Document re-uploaded successfully"
✅ Dialog closes
✅ Document card updates:
  - Status badge changes to "Pending Review" (yellow)
  - Card background changes to yellow
  - Rejection reason alert disappears
  - "Re-upload" button changes to "View" button
✅ Red "Action Required" alert disappears (if no other rejected documents)

---

## Test Scenario 4: Admin Reviews Re-uploaded Document

### Prerequisites
- Complete Test Scenario 3

### Steps
1. Login as **Admin**
2. Navigate to **Admin Dashboard** → **Charities**
3. Find the same charity
4. Click to view details
5. Go to **Documents** tab
6. Find the re-uploaded document (should show "Pending Review")

### Expected Results
✅ Document shows "Pending Review" badge
✅ Upload date is updated to recent time
✅ Previous rejection reason is cleared
✅ Can view the new document
✅ Can approve or reject again

### Continue Steps
7. Click **View** button
8. Review the document
9. Click **Approve Document** button

### Expected Results
✅ Document status changes to "Approved" (green badge)
✅ Verified date is set to current date
✅ If all documents are approved, charity status may change to "Approved"

---

## Test Scenario 5: Multiple Document Rejections

### Prerequisites
- Charity with multiple documents uploaded

### Steps
1. As **Admin**, reject 3 different documents with different reasons
2. Login as **Charity Admin**
3. Navigate to Documents page

### Expected Results
✅ Red alert shows: "You have 3 rejected document(s)"
✅ All 3 rejected documents show:
  - Red borders
  - "Rejected" badges
  - Individual rejection reasons
  - "Re-upload" buttons
✅ Can re-upload each document independently
✅ Alert count decreases as documents are re-uploaded

---

## Test Scenario 6: Approved Charity Gets Document Rejected

### Prerequisites
- Have a charity with "Approved" status
- Charity has multiple approved documents

### Steps
1. As **Admin**, go to approved charity
2. Reject ONE document from the approved set
3. Enter reason: "This certificate has expired. Please upload a current version."

### Expected Results
✅ Document status changes to "Rejected"
✅ **Charity verification status reverts to "Pending"**
✅ Charity's verified_at timestamp is cleared
✅ Verification notes updated: "Document '[type]' was rejected. Please re-upload the required document."
✅ Charity owner receives notification

### Verify Charity Side
4. Login as that **Charity Admin**
5. Check dashboard and documents page

### Expected Results
✅ Charity status shows "Pending" (not "Approved")
✅ Red alert about rejected document
✅ Can re-upload the rejected document
✅ Other documents still show as approved

---

## Test Scenario 7: Document with Expiry Date

### Prerequisites
- Charity account

### Steps
1. Login as **Charity Admin**
2. Navigate to Documents page
3. Click **Upload Document**
4. Select document type: "Tax Exemption Certificate"
5. Upload a file
6. Check "This document has an expiry date"
7. Set expiry date to 20 days from now
8. Click **Upload Document**

### Expected Results
✅ Document uploads successfully
✅ Shows "Pending Review" badge
✅ Shows expiry date
✅ Shows "Expiring Soon" indicator (since < 30 days)
✅ Yellow alert at top about expiring documents

### Admin Rejects It
9. As **Admin**, reject this document
10. As **Charity**, re-upload with new expiry date

### Expected Results
✅ Re-upload dialog shows expiry checkbox already checked
✅ Previous expiry date is pre-filled
✅ Can update expiry date during re-upload
✅ New expiry date is saved

---

## Edge Cases to Test

### Edge Case 1: Re-upload Same Document Type (Not Rejected)
**Steps:** Try to upload a document of the same type when one already exists (not rejected)
**Expected:** Should create a new document record (or show error if business logic prevents duplicates)

### Edge Case 2: Large File Upload
**Steps:** Try to upload a file larger than 10MB
**Expected:** Validation error: "File size must not exceed 10MB"

### Edge Case 3: Invalid File Type
**Steps:** Try to upload a .docx or .txt file
**Expected:** Validation error: "Only PDF, JPG, PNG files are accepted"

### Edge Case 4: No Rejection Reason
**Steps:** As admin, try to reject without entering a reason
**Expected:** Error: "Please provide a rejection reason"

### Edge Case 5: Concurrent Rejections
**Steps:** 
1. Admin A starts rejecting a document
2. Admin B rejects the same document first
3. Admin A submits rejection
**Expected:** Should handle gracefully (last rejection wins or show error)

---

## Visual Verification Checklist

### Document Cards
- [ ] Rejected: Red border, red background tint, red badge
- [ ] Pending: Yellow border, yellow background tint, yellow badge
- [ ] Approved: Green badge, normal border
- [ ] Expired: Red indicators
- [ ] Expiring Soon: Yellow indicators

### Alerts
- [ ] Rejected documents: Red alert with XCircle icon
- [ ] Pending review: Blue alert with Clock icon
- [ ] Expired: Red alert with AlertTriangle icon
- [ ] Expiring soon: Yellow alert with Clock icon

### Buttons
- [ ] Re-upload: Blue button with RefreshCw icon
- [ ] View: Outline button with Eye icon
- [ ] Download: Outline button with Download icon

### Dialog
- [ ] Upload: "Upload New Document" title
- [ ] Re-upload: "Re-upload Document" title
- [ ] Rejection reason shown in red alert box
- [ ] Document type disabled for re-upload

---

## Performance Checks

- [ ] Documents page loads within 2 seconds
- [ ] File upload completes within 5 seconds for 5MB file
- [ ] Re-upload updates immediately without page refresh
- [ ] Notifications appear in real-time
- [ ] No console errors during any operation

---

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Safari (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

---

## Cleanup After Testing

1. Delete test documents
2. Reset charity verification statuses
3. Clear test notifications
4. Remove uploaded test files from storage
