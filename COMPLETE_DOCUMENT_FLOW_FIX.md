# Complete Document Upload & Verification Flow - Fixed

## Issue Identified
The document counts were showing incorrect numbers (showing 3 instead of 5) because:
1. Missing fillable fields in the model
2. Missing default values for verification_status
3. Potential data inconsistency in the database

## Complete Flow Implementation

### 1. Charity Registration & Document Upload

#### Step 1: Charity Registers
```
POST /register
- User creates account with role: 'charity_admin'
- Charity record created with verification_status: 'pending'
```

#### Step 2: Charity Uploads Documents
```
POST /charities/{charity_id}/documents
- File uploaded to storage
- Document record created with:
  - doc_type: (certificate_of_registration, tax_exemption_certificate, etc.)
  - file_path: storage path
  - verification_status: 'pending' (DEFAULT)
  - uploaded_by: user_id
  - expires: boolean
  - expiry_date: date (if applicable)
```

**Backend Controller:**
```php
public function uploadDocument(Request $r, Charity $charity){
    // Validates and creates document
    // If re-uploading rejected doc, updates existing record
    // Otherwise creates new record with status 'pending'
}
```

### 2. Admin Reviews Charity

#### Step 1: Admin Navigates to Charity Management
```
GET /admin/charities?status=pending
- Shows all charities with verification_status: 'pending'
```

#### Step 2: Admin Selects Organization
- Clicks on charity card
- Dialog opens showing:
  - Charity Info (name, mission, vision, contact)
  - Documents Tab
  - Campaigns Tab
  - Compliance Tab

#### Step 3: Admin Reviews Documents One by One

**View Document:**
```
GET /charities/{charity_id}/documents
- Returns all documents with verification_status
```

**Approve Document:**
```
PATCH /admin/documents/{document_id}/approve
- Sets verification_status: 'approved'
- Sets verified_at: now()
- Sets verified_by: admin_user_id
- If all documents approved → charity status may change to 'approved'
```

**Reject Document:**
```
PATCH /admin/documents/{document_id}/reject
Body: { reason: "Document is blurry..." }

Backend Logic:
1. Set document verification_status: 'rejected'
2. Set rejection_reason: provided reason
3. Set verified_at: now()
4. Set verified_by: admin_user_id
5. If charity was 'approved' → revert to 'pending'
6. Send notification to charity owner
7. Update charity verification_notes
```

### 3. Charity Sees Rejection & Re-submits

#### Step 1: Charity Receives Notification
- System notification appears
- Email sent (if configured)
- Content: "Your document '[type]' has been rejected. Reason: [reason]"

#### Step 2: Charity Views Documents Page
```
GET /charities/{charity_id}/documents
```

**Page Shows:**
- Statistics Cards:
  - Total Submitted: ALL documents count
  - Approved: documents where verification_status = 'approved'
  - Pending Review: documents where verification_status = 'pending'
  - Needs Revision: documents where verification_status = 'rejected'

- Red Alert: "Action Required: X rejected document(s)"
- Rejected Document Cards:
  - Red border and background
  - "Rejected" badge
  - Rejection reason in alert box
  - "Re-upload" button

#### Step 3: Charity Re-uploads Document
```
Click "Re-upload" button
→ Dialog opens with:
  - Rejection reason displayed
  - Document type pre-filled (disabled)
  - File upload field
  - Expiry date (if applicable)

Submit:
POST /charities/{charity_id}/documents
Body: FormData with file, doc_type, expires, expiry_date

Backend Logic:
1. Find existing rejected document with same doc_type
2. If found:
   - Delete old file from storage
   - Update existing record:
     - file_path: new file
     - verification_status: 'pending'
     - rejection_reason: null
     - verified_at: null
     - verified_by: null
     - uploaded_by: current user
3. If not found:
   - Create new document record
```

#### Step 4: Statistics Update
After re-upload:
- Total Submitted: remains same (updated existing record)
- Approved: unchanged
- Pending Review: +1 (rejected → pending)
- Needs Revision: -1

### 4. Admin Reviews Re-submission

#### Step 1: Admin Sees Updated Document
```
GET /admin/charities/{charity_id}
- Document shows "Pending Review" status
- Previous rejection reason is cleared
- New upload date shown
```

#### Step 2: Admin Approves/Rejects Again
- Can approve → document becomes 'approved'
- Can reject again → charity receives new notification

## Fixed Backend Files

### 1. CharityDocument Model
**File:** `app/Models/CharityDocument.php`

**Changes:**
```php
protected $fillable = [
    'charity_id', 'doc_type', 'file_path', 'sha256',
    'uploaded_by', 'verification_status', 'rejection_reason',
    'verified_at', 'verified_by', 'expires', 'expiry_date',
    'renewal_reminder_sent_at',
];

protected $casts = [
    'verified_at' => 'datetime',
    'expiry_date' => 'date',
    'renewal_reminder_sent_at' => 'date',
    'expires' => 'boolean',
];

protected $attributes = [
    'verification_status' => 'pending',  // DEFAULT
    'expires' => false,
];

protected $appends = ['document_type', 'file_url', 'uploaded_at'];
```

### 2. VerificationController
**File:** `app/Http/Controllers/Admin/VerificationController.php`

**Key Method:**
```php
public function rejectDocument(Request $request, $documentId)
{
    // 1. Update document status
    $document->update([
        'verification_status' => 'rejected',
        'rejection_reason' => $request->reason,
        'verified_at' => now(),
        'verified_by' => $request->user()->id
    ]);

    // 2. Revert charity status if was approved
    if ($charity->verification_status === 'approved') {
        $charity->update([
            'verification_status' => 'pending',
            'verified_at' => null,
            'verification_notes' => 'Document "' . $document->doc_type . '" was rejected...'
        ]);
    }

    // 3. Notify charity owner
    $this->notificationService->sendSystemAlert(
        $charity->owner,
        "Your document '{$document->doc_type}' has been rejected...",
        'warning'
    );
}
```

### 3. CharityController
**File:** `app/Http/Controllers/CharityController.php`

**Key Method:**
```php
public function uploadDocument(Request $r, Charity $charity){
    // Check for existing rejected document
    $existingDoc = $charity->documents()
        ->where('doc_type', $data['doc_type'])
        ->where('verification_status', 'rejected')
        ->first();
    
    if ($existingDoc) {
        // Re-upload: Update existing record
        Storage::disk('public')->delete($existingDoc->file_path);
        $existingDoc->update([
            'file_path' => $path,
            'verification_status' => 'pending',
            'rejection_reason' => null,
            'verified_at' => null,
            'verified_by' => null,
            // ... other fields
        ]);
    } else {
        // New upload: Create new record
        $charity->documents()->create([...]);
    }
}
```

## Fixed Frontend Files

### 1. Documents.tsx
**File:** `capstone_frontend/src/pages/charity/Documents.tsx`

**Key Features:**
```typescript
// Statistics Cards - Accurate Counts
<Card>
  <CardTitle>{documents.length}</CardTitle>  // Total
</Card>
<Card>
  <CardTitle>
    {documents.filter(d => d.verification_status === 'approved').length}
  </CardTitle>  // Approved
</Card>
<Card>
  <CardTitle>
    {documents.filter(d => d.verification_status === 'pending').length}
  </CardTitle>  // Pending
</Card>
<Card>
  <CardTitle>
    {documents.filter(d => d.verification_status === 'rejected').length}
  </CardTitle>  // Rejected
</Card>

// Filter Implementation
documents
  .filter(doc => filterStatus === 'all' || doc.verification_status === filterStatus)
  .map(document => ...)

// Re-upload Handler
const handleReupload = (document: Document) => {
  setReuploadDocument(document);
  setUploadType(document.doc_type);
  setIsUploadOpen(true);
};
```

### 2. charity.ts Service
**File:** `capstone_frontend/src/services/charity.ts`

**Methods:**
```typescript
async getDocuments(charityId: number) {
  const res = await this.api.get(`/charities/${charityId}/documents`);
  return res.data;
}

async uploadDocument(
  charityId: number,
  file: File,
  docType: string,
  expires: boolean = false,
  expiryDate?: string
) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('doc_type', docType);
  fd.append('expires', expires ? '1' : '0');
  if (expires && expiryDate) {
    fd.append('expiry_date', expiryDate);
  }
  
  const res = await this.api.post(`/charities/${charityId}/documents`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}
```

## Data Integrity Checks

### Check 1: Verify All Documents Have verification_status
```sql
SELECT id, doc_type, verification_status 
FROM charity_documents 
WHERE verification_status IS NULL;
```
**Expected:** 0 rows (all should have status)

### Check 2: Count Documents by Status
```sql
SELECT 
    charity_id,
    COUNT(*) as total,
    SUM(CASE WHEN verification_status = 'approved' THEN 1 ELSE 0 END) as approved,
    SUM(CASE WHEN verification_status = 'pending' THEN 1 ELSE 0 END) as pending,
    SUM(CASE WHEN verification_status = 'rejected' THEN 1 ELSE 0 END) as rejected
FROM charity_documents
GROUP BY charity_id;
```

### Check 3: Verify No Duplicate Active Documents
```sql
SELECT charity_id, doc_type, COUNT(*) as count
FROM charity_documents
WHERE verification_status IN ('pending', 'approved')
GROUP BY charity_id, doc_type
HAVING count > 1;
```
**Expected:** 0 rows (no duplicates for same type)

## Troubleshooting Guide

### Issue: Statistics Show Wrong Numbers

**Diagnosis Steps:**
1. Open browser console (F12)
2. Navigate to Documents page
3. Check console logs:
   ```
   Fetching documents for charity ID: X
   Raw API response: [...]
   Total documents: X
   Approved: X
   Pending: X
   Rejected: X
   ```

**Common Causes:**
- API returning wrong data → Check backend
- Frontend filtering incorrectly → Check filter logic
- Documents missing verification_status → Check database

**Fix:**
```sql
-- Set default status for documents without one
UPDATE charity_documents 
SET verification_status = 'pending' 
WHERE verification_status IS NULL;
```

### Issue: Re-upload Creates Duplicate

**Cause:** Backend not finding existing rejected document

**Fix:** Ensure uploadDocument method checks for existing rejected doc:
```php
$existingDoc = $charity->documents()
    ->where('doc_type', $data['doc_type'])
    ->where('verification_status', 'rejected')
    ->first();
```

### Issue: Charity Status Not Reverting When Document Rejected

**Cause:** rejectDocument method not updating charity status

**Fix:** Ensure VerificationController has:
```php
if ($charity->verification_status === 'approved') {
    $charity->update(['verification_status' => 'pending']);
}
```

## Testing Checklist

- [ ] Charity uploads 5 documents → All show "Pending Review"
- [ ] Statistics show: Total=5, Approved=0, Pending=5, Rejected=0
- [ ] Admin approves 2 documents → Statistics: Total=5, Approved=2, Pending=3, Rejected=0
- [ ] Admin rejects 1 document → Statistics: Total=5, Approved=2, Pending=2, Rejected=1
- [ ] Charity sees red alert about 1 rejected document
- [ ] Charity clicks "Re-upload" → Dialog shows rejection reason
- [ ] Charity uploads new file → Statistics: Total=5, Approved=2, Pending=3, Rejected=0
- [ ] Admin sees re-uploaded document with "Pending Review" status
- [ ] Admin approves re-uploaded document → Statistics: Total=5, Approved=3, Pending=2, Rejected=0
- [ ] Filter by "Approved" → Shows only 3 documents
- [ ] Filter by "Pending Review" → Shows only 2 documents
- [ ] Filter by "Needs Revision" → Shows 0 documents

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/charities/{id}/documents` | Get all documents for charity |
| POST | `/charities/{id}/documents` | Upload/re-upload document |
| PATCH | `/admin/documents/{id}/approve` | Admin approves document |
| PATCH | `/admin/documents/{id}/reject` | Admin rejects document |
| GET | `/admin/charities?status=pending` | Get pending charities |
| GET | `/admin/charities/{id}` | Get charity details with documents |

## Database Schema

```sql
charity_documents:
- id
- charity_id (FK)
- doc_type (VARCHAR)
- file_path (VARCHAR)
- sha256 (VARCHAR)
- uploaded_by (FK to users)
- verification_status (ENUM: pending, approved, rejected) DEFAULT 'pending'
- rejection_reason (TEXT, nullable)
- verified_at (TIMESTAMP, nullable)
- verified_by (FK to users, nullable)
- expires (BOOLEAN) DEFAULT false
- expiry_date (DATE, nullable)
- renewal_reminder_sent_at (DATE, nullable)
- created_at
- updated_at
```

## Success Criteria

✅ All document counts are accurate and match database
✅ Statistics update in real-time after any action
✅ Admin can approve/reject documents individually
✅ Charity receives notifications for rejections
✅ Charity can re-upload rejected documents
✅ Re-upload updates existing record (no duplicates)
✅ Filter works correctly for all statuses
✅ Empty states show appropriate messages
✅ No console errors
✅ All data persists correctly in database
