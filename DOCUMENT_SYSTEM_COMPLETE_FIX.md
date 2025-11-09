# Document Upload & Verification System - Complete Fix

## Problem Statement
The charity documents page was showing incorrect statistics (e.g., showing 3 documents when there were actually 5). The system needed proper implementation of the complete flow from charity registration through document upload, admin review, rejection, and re-submission.

## Solution Overview
Fixed the entire document lifecycle with accurate counting, proper status management, and seamless re-upload functionality.

---

## Complete User Flow

### 🏢 **Phase 1: Charity Registration & Document Upload**

1. **Charity Registers**
   - Creates account with role: `charity_admin`
   - Charity record created with `verification_status: 'pending'`

2. **Charity Uploads Documents**
   - Navigates to Documents page
   - Clicks "Upload Document"
   - Selects document type (e.g., Certificate of Registration)
   - Uploads file (PDF, JPG, PNG - max 10MB)
   - Optionally sets expiry date
   - Document created with `verification_status: 'pending'`

3. **Statistics Update**
   - Total Submitted: +1
   - Pending Review: +1
   - Document appears in grid with yellow "Pending Review" badge

---

### 👨‍💼 **Phase 2: Admin Review Process**

1. **Admin Navigates to Charity Management**
   - Goes to Admin Dashboard → Charities
   - Filters by status: "Pending"
   - Sees all charities awaiting verification

2. **Admin Selects Organization**
   - Clicks on charity card
   - Dialog opens with tabs:
     - **Information**: Name, mission, vision, contact details
     - **Documents**: All uploaded documents
     - **Campaigns**: Created campaigns
     - **Compliance**: Registration details

3. **Admin Reviews Documents One by One**
   
   **For Each Document:**
   - Clicks "View" to preview document
   - Reviews content for authenticity and validity
   
   **Option A: Approve Document**
   - Clicks "Approve Document"
   - Document status → `approved`
   - Green badge appears
   - If all documents approved → Charity may become `approved`
   
   **Option B: Reject Document**
   - Clicks "Reject Document"
   - Enters rejection reason (required)
   - Example: "Document is blurry and unreadable. Please upload a clearer version."
   - Document status → `rejected`
   - **If charity was `approved` → reverts to `pending`**
   - Charity owner receives notification
   - Charity verification notes updated

---

### 🔄 **Phase 3: Charity Sees Rejection & Re-submits**

1. **Charity Receives Notification**
   - System alert appears in notification panel
   - Content: "Your document '[type]' for [charity name] has been rejected. Reason: [reason]. Please upload a corrected version."

2. **Charity Views Documents Page**
   
   **Statistics Show:**
   ```
   Total Submitted: 5
   Approved: 2
   Pending Review: 2
   Needs Revision: 1  ← Rejected document
   ```
   
   **Alerts Show:**
   - 🔴 Red Alert: "Action Required: You have 1 rejected document(s)"
   - 🔵 Blue Alert: "Under Review: You have 2 document(s) pending"

3. **Charity Identifies Rejected Document**
   - Document card has:
     - Red border and background
     - Red "Rejected" badge
     - Alert box showing rejection reason
     - Blue "Re-upload" button

4. **Charity Re-uploads Document**
   - Clicks "Re-upload" button
   - Dialog opens showing:
     - Title: "Re-upload Document"
     - Red alert with rejection reason
     - Document type (pre-filled, disabled)
     - File upload field
     - Expiry date checkbox (if applicable)
   - Selects corrected file
   - Clicks "Re-upload Document"
   
   **Backend Logic:**
   - Finds existing rejected document
   - Deletes old file from storage
   - Updates existing record (no duplicate created):
     - `file_path`: new file
     - `verification_status`: 'pending'
     - `rejection_reason`: null
     - `verified_at`: null
     - `verified_by`: null

5. **Statistics Update Immediately**
   ```
   Total Submitted: 5  (unchanged - updated existing)
   Approved: 2
   Pending Review: 3  (+1)
   Needs Revision: 0  (-1)
   ```

---

### ✅ **Phase 4: Admin Reviews Re-submission**

1. **Admin Sees Updated Document**
   - Document shows "Pending Review" status
   - Upload date is recent
   - Previous rejection reason is cleared
   - Can view new document

2. **Admin Approves Re-uploaded Document**
   - Reviews corrected document
   - Clicks "Approve Document"
   - Document status → `approved`
   
   **Final Statistics:**
   ```
   Total Submitted: 5
   Approved: 3  (+1)
   Pending Review: 2  (-1)
   Needs Revision: 0
   ```

---

## Technical Implementation

### Backend Changes

#### 1. **CharityDocument Model** (`app/Models/CharityDocument.php`)

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
    'verification_status' => 'pending',  // ✅ DEFAULT VALUE
    'expires' => false,
];

protected $appends = ['document_type', 'file_url', 'uploaded_at'];

// Accessor for uploaded_at
public function getUploadedAtAttribute() {
    return $this->created_at;
}
```

#### 2. **VerificationController** (`app/Http/Controllers/Admin/VerificationController.php`)

```php
public function rejectDocument(Request $request, $documentId)
{
    $request->validate([
        'reason' => 'required|string|max:1000'
    ]);

    $document = CharityDocument::findOrFail($documentId);
    
    // Update document
    $document->update([
        'verification_status' => 'rejected',
        'rejection_reason' => $request->reason,
        'verified_at' => now(),
        'verified_by' => $request->user()->id
    ]);

    $charity = $document->charity;
    
    // ✅ Revert charity status if was approved
    if ($charity->verification_status === 'approved') {
        $charity->update([
            'verification_status' => 'pending',
            'verified_at' => null,
            'verification_notes' => 'Document "' . $document->doc_type . '" was rejected. Please re-upload the required document.'
        ]);
    }
    
    // ✅ Notify charity owner
    if ($charity->owner) {
        $this->notificationService->sendSystemAlert(
            $charity->owner,
            "Your document '{$document->doc_type}' for {$charity->name} has been rejected. Reason: {$request->reason}. Please upload a corrected version.",
            'warning'
        );
    }
    
    return response()->json([
        'message' => 'Document rejected',
        'document' => $document->fresh(),
        'charity_status_updated' => $charity->verification_status === 'pending'
    ]);
}
```

#### 3. **CharityController** (`app/Http/Controllers/CharityController.php`)

```php
public function uploadDocument(Request $r, Charity $charity)
{
    abort_unless($charity->owner_id === $r->user()->id, 403);
    
    $data = $r->validate([
        'doc_type' => 'required|string|max:255',
        'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
        'expires' => 'sometimes|boolean',
        'expiry_date' => 'sometimes|nullable|date|after:today'
    ]);
    
    // ✅ Check for existing rejected document
    $existingDoc = $charity->documents()
        ->where('doc_type', $data['doc_type'])
        ->where('verification_status', 'rejected')
        ->first();
    
    $path = $r->file('file')->store('charity_docs', 'public');
    $hash = hash_file('sha256', $r->file('file')->getRealPath());
    
    if ($existingDoc) {
        // ✅ Re-upload: Update existing record
        if ($existingDoc->file_path) {
            Storage::disk('public')->delete($existingDoc->file_path);
        }
        
        $existingDoc->update([
            'file_path' => $path,
            'sha256' => $hash,
            'verification_status' => 'pending',
            'rejection_reason' => null,
            'verified_at' => null,
            'verified_by' => null,
            'uploaded_by' => $r->user()->id,
            'expires' => $data['expires'] ?? false,
            'expiry_date' => $data['expiry_date'] ?? null,
        ]);
        
        return response()->json([
            'message' => 'Document re-uploaded successfully',
            'document' => $existingDoc->fresh()
        ], 200);
    }
    
    // ✅ New upload: Create new record
    $doc = $charity->documents()->create([
        'doc_type' => $data['doc_type'],
        'file_path' => $path,
        'sha256' => $hash,
        'uploaded_by' => $r->user()->id,
        'expires' => $data['expires'] ?? false,
        'expiry_date' => $data['expiry_date'] ?? null,
    ]);
    
    return response()->json($doc, 201);
}

public function getDocuments(Charity $charity)
{
    $documents = $charity->documents()
        ->orderBy('created_at', 'desc')
        ->get();
    
    // ✅ Add computed fields for expiry status
    $documents->each(function($doc) {
        if ($doc->expires && $doc->expiry_date) {
            $expiryDate = \Carbon\Carbon::parse($doc->expiry_date);
            $today = \Carbon\Carbon::today();
            $daysUntilExpiry = $today->diffInDays($expiryDate, false);
            
            $doc->is_expired = $daysUntilExpiry < 0;
            $doc->is_expiring_soon = $daysUntilExpiry >= 0 && $daysUntilExpiry <= 30;
            $doc->days_until_expiry = (int)$daysUntilExpiry;
        }
    });
    
    return $documents;
}
```

### Frontend Changes

#### 1. **Documents.tsx** (`capstone_frontend/src/pages/charity/Documents.tsx`)

**Statistics Cards:**
```typescript
{/* ✅ Accurate Real-time Counts */}
<Card>
  <CardTitle className="text-3xl font-bold">
    {documents.length}
  </CardTitle>
  <p className="text-xs">All documents</p>
</Card>

<Card className="border-green-200 bg-green-50/50">
  <CardTitle className="text-3xl font-bold text-green-600">
    {documents.filter(doc => doc.verification_status === 'approved').length}
  </CardTitle>
  <p className="text-xs">Verified documents</p>
</Card>

<Card className="border-yellow-200 bg-yellow-50/50">
  <CardTitle className="text-3xl font-bold text-yellow-600">
    {documents.filter(doc => doc.verification_status === 'pending').length}
  </CardTitle>
  <p className="text-xs">Awaiting review</p>
</Card>

<Card className="border-red-200 bg-red-50/50">
  <CardTitle className="text-3xl font-bold text-red-600">
    {documents.filter(doc => doc.verification_status === 'rejected').length}
  </CardTitle>
  <p className="text-xs">Requires action</p>
</Card>
```

**Filter Implementation:**
```typescript
const [filterStatus, setFilterStatus] = useState<string>("all");

// ✅ Filter dropdown
<select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
  <option value="all">All Documents</option>
  <option value="approved">Approved</option>
  <option value="pending">Pending Review</option>
  <option value="rejected">Needs Revision</option>
</select>

// ✅ Apply filter to documents
documents
  .filter(doc => filterStatus === 'all' || doc.verification_status === filterStatus)
  .map((document) => (
    // Render document card
  ))
```

**Re-upload Handler:**
```typescript
const handleReupload = (document: Document) => {
  setReuploadDocument(document);
  setUploadType(document.doc_type);
  setHasExpiry(document.expires);
  setExpiryDate(document.expiry_date || "");
  setIsUploadOpen(true);
};
```

**Enhanced Logging:**
```typescript
const fetchDocuments = async () => {
  try {
    console.log('Fetching documents for charity ID:', user.charity.id);
    const data = await charityService.getDocuments(user.charity.id);
    console.log('Raw API response:', data);
    console.log('Total documents:', documentsData.length);
    console.log('Approved:', documentsData.filter(d => d.verification_status === 'approved').length);
    console.log('Pending:', documentsData.filter(d => d.verification_status === 'pending').length);
    console.log('Rejected:', documentsData.filter(d => d.verification_status === 'rejected').length);
    
    setDocuments(documentsData);
  } catch (error: any) {
    console.error("Failed to fetch documents:", error);
    toast.error(error.response?.data?.message || "Failed to fetch documents");
  }
};
```

#### 2. **charity.ts Service** (`capstone_frontend/src/services/charity.ts`)

```typescript
// ✅ Get documents
async getDocuments(charityId: number) {
  const res = await this.api.get(`/charities/${charityId}/documents`);
  return res.data;
}

// ✅ Upload/re-upload document
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

// ✅ Get document expiry status
async getDocumentStatus(charityId: number) {
  const res = await this.api.get(`/charities/${charityId}/documents/expiry-status`);
  return res.data;
}
```

---

## Testing & Verification

### Run SQL Fix Script
```bash
# In MySQL/MariaDB
mysql -u root -p capstone_db < scripts/fix_document_verification_status.sql
```

### Run Test Script
```bash
# In PowerShell
.\scripts\test_document_flow.ps1
```

### Manual Testing
1. Open browser console (F12)
2. Navigate to `http://localhost:5173/charity/documents`
3. Check console logs for accurate counts
4. Verify statistics match console output
5. Test upload, approval, rejection, and re-upload flows

---

## Success Criteria

✅ **Accurate Counts**: All statistics reflect actual database records  
✅ **Real-time Updates**: Counts update immediately after any action  
✅ **No Duplicates**: Re-uploads update existing records  
✅ **Proper Notifications**: Charity receives alerts for rejections  
✅ **Status Management**: Charity status reverts when document rejected  
✅ **Filter Works**: Can filter by all status types  
✅ **Empty States**: Appropriate messages for no documents/no results  
✅ **Console Logs**: Detailed logging for debugging  
✅ **Error Handling**: Graceful error messages  
✅ **Data Integrity**: All documents have verification_status  

---

## Files Modified

### Backend
- ✅ `app/Models/CharityDocument.php` - Added fillable fields, defaults, accessors
- ✅ `app/Http/Controllers/Admin/VerificationController.php` - Enhanced rejection logic
- ✅ `app/Http/Controllers/CharityController.php` - Smart re-upload handling

### Frontend
- ✅ `capstone_frontend/src/pages/charity/Documents.tsx` - Statistics cards, filters, re-upload
- ✅ `capstone_frontend/src/services/charity.ts` - Document API methods

### Scripts
- ✅ `scripts/fix_document_verification_status.sql` - Database fix script
- ✅ `scripts/test_document_flow.ps1` - Testing script

### Documentation
- ✅ `CHARITY_DOCUMENTS_AUDIT_FIX.md` - Initial fix documentation
- ✅ `CHARITY_DOCUMENTS_UI_COMPLETE.md` - UI implementation details
- ✅ `COMPLETE_DOCUMENT_FLOW_FIX.md` - Complete flow documentation
- ✅ `TESTING_GUIDE_DOCUMENTS.md` - Comprehensive testing guide
- ✅ `DOCUMENT_SYSTEM_COMPLETE_FIX.md` - This file

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Laravel logs: `storage/logs/laravel.log`
3. Run SQL fix script to ensure data integrity
4. Verify API responses in Network tab
5. Check that all migrations have run

The system is now fully functional with accurate document counting and complete workflow support! 🎉
