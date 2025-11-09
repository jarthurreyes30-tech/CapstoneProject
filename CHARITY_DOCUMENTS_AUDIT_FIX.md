# Charity Documents Upload & Audit Submission Fix

## Overview
Fixed the charity document upload and audit submission system to properly handle document rejections by admin. When an admin rejects documents one by one, the system now:
1. Properly updates charity verification status
2. Notifies the charity owner
3. Allows easy re-uploading of rejected documents
4. Shows clear rejection reasons

## Changes Made

### Backend Changes

#### 1. VerificationController.php - Document Rejection Logic
**File:** `capstone_backend/app/Http/Controllers/Admin/VerificationController.php`

**Changes:**
- Enhanced `rejectDocument()` method to handle charity status updates
- When a document is rejected:
  - If charity was approved, revert status to 'pending'
  - Clear verified_at timestamp
  - Add verification note explaining which document was rejected
  - Send notification to charity owner with rejection reason
- Returns additional info about charity status update

**Key Logic:**
```php
// If charity was approved, revert to pending since a document was rejected
if ($charity->verification_status === 'approved') {
    $charity->update([
        'verification_status' => 'pending',
        'verified_at' => null,
        'verification_notes' => 'Document "' . $document->doc_type . '" was rejected. Please re-upload the required document.'
    ]);
}

// Notify charity owner about document rejection
if ($charity->owner) {
    $this->notificationService->sendSystemAlert(
        $charity->owner,
        "Your document '{$document->doc_type}' for {$charity->name} has been rejected. Reason: {$request->reason}. Please upload a corrected version.",
        'warning'
    );
}
```

#### 2. CharityController.php - Document Upload & Re-upload
**File:** `capstone_backend/app/Http/Controllers/CharityController.php`

**Changes:**
- Enhanced `uploadDocument()` method to handle re-uploads
- Added validation for expires and expiry_date fields
- Checks for existing rejected documents of the same type
- If re-uploading a rejected document:
  - Updates existing document record instead of creating new one
  - Deletes old file
  - Resets verification status to 'pending'
  - Clears rejection reason and verified fields
- Enhanced `getDocuments()` method to include expiry status calculations

**Key Features:**
- Prevents duplicate documents when re-uploading
- Maintains document history
- Automatic expiry status calculation (expired, expiring soon)
- Supports documents with and without expiry dates

### Frontend Changes

#### 3. Documents.tsx - Charity Documents Page
**File:** `capstone_frontend/src/pages/charity/Documents.tsx`

**Major Enhancements:**

**a) Document Interface Updated:**
```typescript
interface Document {
  id: number;
  doc_type: string;
  file_path: string;
  expires: boolean;
  expiry_date?: string;
  uploaded_at: string;
  is_expired?: boolean;
  is_expiring_soon?: boolean;
  days_until_expiry?: number;
  verification_status: 'pending' | 'approved' | 'rejected';  // NEW
  rejection_reason?: string;  // NEW
  verified_at?: string;  // NEW
}
```

**b) New Features:**
- **Re-upload Functionality:** Click "Re-upload" button on rejected documents
- **Rejection Reason Display:** Shows admin's rejection reason prominently
- **Status Badges:** Clear visual indicators for pending/approved/rejected status
- **Alert System:** 
  - Red alert for rejected documents requiring action
  - Blue alert for documents pending review
  - Yellow alert for expiring documents
  - Red alert for expired documents

**c) Enhanced Upload Dialog:**
- Shows rejection reason when re-uploading
- Pre-fills document type for re-uploads
- Disables document type selection for re-uploads
- Different button text and icon for re-uploads

**d) Visual Improvements:**
- Color-coded document cards:
  - Red border/background for rejected documents
  - Yellow border/background for pending documents
  - Standard for approved documents
- Inline rejection reason display in document cards
- Prominent "Re-upload" button for rejected documents

#### 4. charity.ts - Service Layer
**File:** `capstone_frontend/src/services/charity.ts`

**New Methods Added:**
```typescript
// Get charity documents
async getDocuments(charityId: number)

// Upload document (supports both new uploads and re-uploads)
async uploadDocument(
  charityId: number,
  file: File,
  docType: string,
  expires: boolean = false,
  expiryDate?: string
)

// Get document expiry status
async getDocumentStatus(charityId: number)
```

## User Flow

### Admin Rejecting a Document

1. Admin views charity details in admin panel
2. Admin reviews document in Documents tab
3. Admin clicks "Reject" button on a document
4. Admin enters rejection reason in dialog
5. System:
   - Marks document as rejected
   - Reverts charity status to pending (if was approved)
   - Sends notification to charity owner
   - Updates verification notes

### Charity Re-uploading Rejected Document

1. Charity logs in and sees red alert: "Action Required: You have X rejected document(s)"
2. Charity navigates to Documents page
3. Rejected documents show:
   - Red border and background
   - "Rejected" badge
   - Rejection reason in alert box
   - "Re-upload" button
4. Charity clicks "Re-upload" button
5. Upload dialog opens with:
   - Document type pre-filled and disabled
   - Rejection reason displayed at top
   - File upload field
   - Expiry date options (if applicable)
6. Charity selects corrected file and submits
7. System:
   - Replaces old file with new one
   - Resets status to "pending"
   - Clears rejection reason
   - Notifies admin of re-submission

## Database Schema

Documents now include verification fields:
- `verification_status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'
- `rejection_reason` TEXT NULL
- `verified_at` TIMESTAMP NULL
- `verified_by` FOREIGN KEY to users.id NULL

## Benefits

1. **Clear Communication:** Charity owners know exactly why documents were rejected
2. **Easy Re-submission:** One-click re-upload with context preserved
3. **Audit Trail:** All document versions and statuses tracked
4. **Status Integrity:** Charity verification status properly reflects document approval state
5. **User Experience:** Visual cues and alerts guide users through the process
6. **No Duplicates:** Re-uploads update existing records instead of creating duplicates

## Testing Checklist

- [ ] Admin can reject individual documents with reason
- [ ] Charity receives notification when document is rejected
- [ ] Charity status reverts to pending when approved charity has document rejected
- [ ] Rejected documents show rejection reason on charity documents page
- [ ] Re-upload button appears for rejected documents
- [ ] Re-upload dialog shows rejection reason
- [ ] Re-uploading replaces old document (no duplicates)
- [ ] Re-uploaded document status resets to pending
- [ ] Admin can review re-uploaded documents
- [ ] Approved documents show correct status
- [ ] Pending documents show correct status
- [ ] Document expiry status still works correctly

## API Endpoints Used

### Admin Endpoints
- `PATCH /admin/documents/{document}/reject` - Reject a document with reason
- `PATCH /admin/documents/{document}/approve` - Approve a document

### Charity Endpoints
- `GET /charities/{charity}/documents` - Get all documents for charity
- `POST /charities/{charity}/documents` - Upload/re-upload document
- `GET /charities/{charity}/documents/expiry-status` - Get document expiry statistics

## Notes

- The system maintains a complete audit trail of all document submissions
- Old files are deleted when re-uploading to save storage space
- Document type cannot be changed when re-uploading (maintains integrity)
- Expiry dates can be updated during re-upload if needed
- Notifications are sent via the NotificationService system
