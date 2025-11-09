# Charity Documents Page - Complete Implementation

## Overview
The charity documents page now displays accurate statistics and document information based on the charity's actual submissions and admin verification status.

## Features Implemented

### 1. Statistics Dashboard
Four summary cards showing real-time counts:

- **Total Submitted**: Total number of documents uploaded by the charity
- **Approved**: Count of documents verified and approved by admin (Green)
- **Pending Review**: Count of documents awaiting admin review (Yellow)
- **Needs Revision**: Count of documents rejected by admin (Red)

All counts are dynamically calculated from the actual documents array.

### 2. Document Status Alerts
Smart alerts that appear based on document status:

- **Red Alert**: Shows when there are rejected documents requiring action
- **Blue Alert**: Shows count of documents pending admin review
- **Yellow Alert**: Shows documents expiring within 30 days
- **Red Alert**: Shows expired documents

### 3. Filters & Search Section
- **Submission History** header with description
- **Status Filter Dropdown**:
  - All Documents
  - Approved
  - Pending Review
  - Needs Revision
- Filter dynamically updates the document grid

### 4. Document Grid
Displays all documents with:
- Color-coded cards based on verification status
- Document type and upload date
- Status badges (Approved/Pending/Rejected)
- Rejection reasons (for rejected documents)
- Expiry information (if applicable)
- Action buttons (Re-upload/View/Download)

### 5. Empty States
- Shows appropriate message when no documents exist
- Shows filter-specific message when filter returns no results

## Data Flow

```
Backend API → charityService.getDocuments(charityId) → documents state → UI Components
```

### API Endpoint
```
GET /charities/{charity_id}/documents
```

### Response Structure
```json
[
  {
    "id": 1,
    "doc_type": "certificate_of_registration",
    "file_path": "charity_docs/abc123.pdf",
    "expires": true,
    "expiry_date": "2025-12-31",
    "uploaded_at": "2024-10-15T10:30:00Z",
    "verification_status": "approved",
    "rejection_reason": null,
    "verified_at": "2024-10-16T14:20:00Z",
    "is_expired": false,
    "is_expiring_soon": false,
    "days_until_expiry": 61
  }
]
```

## Statistics Calculation

### Total Submitted
```typescript
documents.length
```

### Approved Count
```typescript
documents.filter(doc => doc.verification_status === 'approved').length
```

### Pending Review Count
```typescript
documents.filter(doc => doc.verification_status === 'pending').length
```

### Needs Revision Count
```typescript
documents.filter(doc => doc.verification_status === 'rejected').length
```

## Filter Implementation

```typescript
const [filterStatus, setFilterStatus] = useState<string>("all");

// In the render:
documents
  .filter(doc => filterStatus === 'all' || doc.verification_status === filterStatus)
  .map((document) => (
    // Render document card
  ))
```

## Visual Design

### Statistics Cards
- **Total**: Standard card with default styling
- **Approved**: Green border (`border-green-200`) and background (`bg-green-50/50`)
- **Pending**: Yellow border (`border-yellow-200`) and background (`bg-yellow-50/50`)
- **Needs Revision**: Red border (`border-red-200`) and background (`bg-red-50/50`)

### Document Cards
- **Rejected**: Red border (`border-red-300`) and tinted background (`bg-red-50/50`)
- **Pending**: Yellow border (`border-yellow-300`) and tinted background (`bg-yellow-50/50`)
- **Approved**: Standard styling
- **Expired**: Red border (`border-red-200`)
- **Expiring Soon**: Yellow border (`border-yellow-200`)

## User Interactions

### Viewing Statistics
1. User navigates to Documents page
2. Statistics cards load with accurate counts
3. Cards update in real-time when documents are uploaded/updated

### Filtering Documents
1. User selects filter from dropdown
2. Document grid updates to show only matching documents
3. Empty state appears if no documents match filter
4. Statistics cards remain unchanged (show all documents)

### Re-uploading Rejected Documents
1. User sees red "Needs Revision" count
2. User sees red alert with count of rejected documents
3. User scrolls to rejected document (red card)
4. User sees rejection reason in alert box
5. User clicks "Re-upload" button
6. Dialog opens with rejection reason displayed
7. User uploads corrected document
8. Statistics update automatically

## Component Structure

```
CharityDocuments
├── Header (Title + Upload Button)
├── Statistics Cards (4 cards)
│   ├── Total Submitted
│   ├── Approved (Green)
│   ├── Pending Review (Yellow)
│   └── Needs Revision (Red)
├── Status Alerts (Conditional)
│   ├── Rejected Documents Alert (Red)
│   ├── Pending Review Alert (Blue)
│   ├── Expired Documents Alert (Red)
│   └── Expiring Soon Alert (Yellow)
├── Filters & Search Section
│   ├── Submission History Header
│   └── Status Filter Dropdown
├── Documents Grid (Filtered)
│   └── Document Cards (with status-based styling)
├── Empty States (Conditional)
│   ├── No Documents Message
│   └── No Filtered Results Message
└── Required Documents Info
```

## State Management

```typescript
const [documents, setDocuments] = useState<Document[]>([]);
const [documentStatus, setDocumentStatus] = useState<DocumentStatus | null>(null);
const [loading, setLoading] = useState(true);
const [filterStatus, setFilterStatus] = useState<string>("all");
const [isUploadOpen, setIsUploadOpen] = useState(false);
const [uploadFile, setUploadFile] = useState<File | null>(null);
const [uploadType, setUploadType] = useState("");
const [expiryDate, setExpiryDate] = useState("");
const [hasExpiry, setHasExpiry] = useState(false);
const [reuploadDocument, setReuploadDocument] = useState<Document | null>(null);
```

## Key Functions

### fetchDocuments()
Fetches all documents for the charity from the backend.

### fetchDocumentStatus()
Fetches document expiry statistics.

### handleUpload()
Handles new document uploads and re-uploads.

### handleReupload(document)
Prepares the upload dialog for re-uploading a rejected document.

### getDocumentBadge(document)
Returns the appropriate badge component based on document status.

## Testing Scenarios

### Scenario 1: Fresh Charity (No Documents)
- Statistics show: 0, 0, 0, 0
- No alerts appear
- Empty state message displayed
- Required documents section shows all unchecked

### Scenario 2: Charity with Mixed Status Documents
- Statistics show accurate counts
- Appropriate alerts appear
- Documents display with correct styling
- Filter works correctly

### Scenario 3: All Documents Approved
- Statistics show: 3, 3, 0, 0
- Only green cards visible
- No action alerts
- All required documents checked

### Scenario 4: Documents Rejected
- Statistics show: 3, 1, 1, 1
- Red alert appears
- Rejected documents show with red styling
- Re-upload buttons available

### Scenario 5: Filtering
- Select "Approved" → Shows only approved documents
- Select "Pending Review" → Shows only pending documents
- Select "Needs Revision" → Shows only rejected documents
- Select "All Documents" → Shows all documents

## Benefits

1. **Accurate Data**: All statistics reflect actual database records
2. **Real-time Updates**: Counts update immediately after actions
3. **Clear Status**: Visual indicators make status obvious
4. **Easy Navigation**: Filter helps find specific documents quickly
5. **Actionable Insights**: Alerts guide users to take necessary actions
6. **Professional UI**: Clean, organized layout with proper spacing

## Technical Details

### Performance
- Single API call fetches all documents
- Client-side filtering (no additional API calls)
- Efficient array operations for counting

### Accessibility
- Semantic HTML structure
- Color coding supplemented with text labels
- Keyboard navigation support
- Screen reader friendly

### Responsive Design
- 4-column grid on desktop (statistics)
- 3-column grid on large screens (documents)
- 2-column grid on tablets
- Single column on mobile
- All cards stack properly on small screens

## Future Enhancements

Potential improvements:
- Search by document name
- Sort by upload date, status, expiry
- Bulk actions (approve multiple, download all)
- Document preview in modal
- Upload progress indicator
- Drag-and-drop upload
- Document versioning history
