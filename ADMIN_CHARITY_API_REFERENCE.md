# Admin Charity Management - API Reference

## Base URL
```
http://localhost:8000/api
```

## Authentication
All endpoints require admin authentication:
```
Headers:
  Authorization: Bearer {token}
  Accept: application/json
  Content-Type: application/json
```

## Endpoints

### 1. Get All Charities
```http
GET /admin/charities?page=1&status=pending&search=charity
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `status` (optional): Filter by status (pending|approved|rejected)
- `search` (optional): Search by name, email, or reg_no

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Hope Foundation",
      "acronym": "HF",
      "reg_no": "SEC-12345",
      "contact_email": "contact@hope.org",
      "contact_phone": "+63 912 345 6789",
      "mission": "To provide hope...",
      "vision": "A world where...",
      "description": "We are a non-profit...",
      "goals": "Our goals include...",
      "logo": "http://localhost:8000/storage/logos/logo.png",
      "background_image": "http://localhost:8000/storage/covers/bg.jpg",
      "verification_status": "pending",
      "campaigns_count": 5,
      "donations_count": 120,
      "followers_count": 350,
      "created_at": "2025-01-01T00:00:00.000000Z",
      "documents": [
        {
          "id": 1,
          "doc_type": "registration",
          "document_type": "Registration",
          "file_url": "http://localhost:8000/storage/documents/doc.pdf",
          "verification_status": "pending",
          "created_at": "2025-01-01T00:00:00.000000Z"
        }
      ],
      "campaigns": [
        {
          "id": 1,
          "title": "Build a School",
          "description": "Help us build...",
          "goal": 1000000,
          "raised": 750000,
          "status": "active",
          "donors": 250
        }
      ]
    }
  ],
  "current_page": 1,
  "last_page": 5,
  "per_page": 20,
  "total": 100
}
```

---

### 2. Get Charity Details
```http
GET /admin/charities/{charityId}
```

**Response:**
```json
{
  "id": 1,
  "name": "Hope Foundation",
  "acronym": "HF",
  "legal_trading_name": "Hope Foundation Inc.",
  "reg_no": "SEC-12345",
  "tax_id": "TAX-67890",
  "mission": "To provide hope and support...",
  "vision": "A world where everyone has access...",
  "goals": "1. Provide education\n2. Support communities",
  "description": "We are a non-profit organization...",
  "website": "https://hope.org",
  "contact_email": "contact@hope.org",
  "contact_phone": "+63 912 345 6789",
  "phone": "+63 912 345 6789",
  "address": "123 Main St",
  "street_address": "123 Main St",
  "barangay": "Barangay 1",
  "city": "Manila",
  "province": "Metro Manila",
  "region": "NCR",
  "full_address": "123 Main St, Barangay 1, Manila, Metro Manila",
  "category": "Education",
  "operating_hours": "Mon-Fri 9AM-5PM",
  "facebook_url": "https://facebook.com/hope",
  "instagram_url": "https://instagram.com/hope",
  "twitter_url": "https://twitter.com/hope",
  "linkedin_url": "https://linkedin.com/company/hope",
  "youtube_url": "https://youtube.com/hope",
  "logo": "http://localhost:8000/storage/logos/logo.png",
  "background_image": "http://localhost:8000/storage/covers/bg.jpg",
  "verification_status": "pending",
  "verified_at": null,
  "verification_notes": null,
  "created_at": "2025-01-01T00:00:00.000000Z",
  "updated_at": "2025-01-01T00:00:00.000000Z",
  "campaigns_count": 5,
  "donations_count": 120,
  "followers_count": 350,
  "owner": {
    "id": 10,
    "name": "John Doe",
    "email": "john@hope.org"
  },
  "documents": [
    {
      "id": 1,
      "charity_id": 1,
      "doc_type": "registration",
      "document_type": "Registration",
      "file_path": "documents/registration.pdf",
      "file_url": "http://localhost:8000/storage/documents/registration.pdf",
      "verification_status": "approved",
      "rejection_reason": null,
      "verified_at": "2025-01-02T00:00:00.000000Z",
      "verified_by": 1,
      "created_at": "2025-01-01T00:00:00.000000Z"
    },
    {
      "id": 2,
      "charity_id": 1,
      "doc_type": "tax",
      "document_type": "Tax",
      "file_path": "documents/tax.pdf",
      "file_url": "http://localhost:8000/storage/documents/tax.pdf",
      "verification_status": "rejected",
      "rejection_reason": "Document is unclear. Please upload a clearer version.",
      "verified_at": "2025-01-02T00:00:00.000000Z",
      "verified_by": 1,
      "created_at": "2025-01-01T00:00:00.000000Z"
    }
  ],
  "campaigns": [
    {
      "id": 1,
      "charity_id": 1,
      "title": "Build a School",
      "description": "Help us build a school for underprivileged children",
      "goal_amount": 1000000,
      "current_amount": 750000,
      "goal": 1000000,
      "raised": 750000,
      "status": "active",
      "start_date": "2025-01-01",
      "end_date": "2025-12-31",
      "donors": 250
    }
  ]
}
```

---

### 3. Approve Charity
```http
PATCH /admin/charities/{charityId}/approve
```

**Request Body:**
```json
{
  "notes": "All documents verified. Charity approved."
}
```

**Response:**
```json
{
  "message": "Approved"
}
```

---

### 4. Reject Charity
```http
PATCH /admin/charities/{charityId}/reject
```

**Request Body:**
```json
{
  "notes": "Missing required documents",
  "reason": "Please submit your tax exemption certificate"
}
```

**Response:**
```json
{
  "message": "Rejected"
}
```

---

### 5. Approve Document
```http
PATCH /admin/documents/{documentId}/approve
```

**Request Body:** (none required)

**Response:**
```json
{
  "message": "Document approved successfully",
  "document": {
    "id": 1,
    "charity_id": 1,
    "doc_type": "registration",
    "document_type": "Registration",
    "file_url": "http://localhost:8000/storage/documents/registration.pdf",
    "verification_status": "approved",
    "verified_at": "2025-01-02T10:30:00.000000Z",
    "verified_by": 1,
    "rejection_reason": null
  }
}
```

**Side Effects:**
- If all charity documents are approved, the charity is automatically approved

---

### 6. Reject Document
```http
PATCH /admin/documents/{documentId}/reject
```

**Request Body:**
```json
{
  "reason": "Document is blurry and unreadable. Please upload a clearer version with all text visible."
}
```

**Validation:**
- `reason` is required
- `reason` max length: 1000 characters

**Response:**
```json
{
  "message": "Document rejected",
  "document": {
    "id": 2,
    "charity_id": 1,
    "doc_type": "tax",
    "document_type": "Tax",
    "file_url": "http://localhost:8000/storage/documents/tax.pdf",
    "verification_status": "rejected",
    "rejection_reason": "Document is blurry and unreadable. Please upload a clearer version with all text visible.",
    "verified_at": "2025-01-02T10:35:00.000000Z",
    "verified_by": 1
  }
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "message": "Unauthenticated."
}
```

### 403 Forbidden
```json
{
  "message": "This action is unauthorized."
}
```

### 404 Not Found
```json
{
  "message": "Charity not found."
}
```

### 422 Validation Error
```json
{
  "message": "The reason field is required.",
  "errors": {
    "reason": [
      "The reason field is required."
    ]
  }
}
```

### 500 Server Error
```json
{
  "message": "Server Error"
}
```

---

## Document Types

Available document types (`doc_type`):
- `registration` - Registration Certificate
- `tax` - Tax Exemption Certificate
- `bylaws` - Organizational Bylaws
- `audit` - Audit Report
- `other` - Other Documents

---

## Verification Statuses

### Charity Status
- `pending` - Awaiting admin review
- `approved` - Verified and active
- `rejected` - Application denied

### Document Status
- `pending` - Awaiting admin review
- `approved` - Document verified
- `rejected` - Document rejected (needs resubmission)

---

## Data Relationships

```
Charity
  ├─ owner (User)
  ├─ documents[] (CharityDocument)
  ├─ campaigns[] (Campaign)
  ├─ donations[] (Donation)
  └─ followers[] (CharityFollow)

CharityDocument
  ├─ charity (Charity)
  ├─ uploader (User)
  └─ verifier (User)
```

---

## Pagination

All list endpoints support pagination:
- Default per page: 20
- Max per page: 100
- Page parameter: `?page=1`

Response includes:
- `current_page`
- `last_page`
- `per_page`
- `total`

---

## Rate Limiting

- 60 requests per minute per user
- Applies to all admin endpoints

---

## Testing with cURL

### Get All Charities
```bash
curl -X GET "http://localhost:8000/api/admin/charities?status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

### Approve Document
```bash
curl -X PATCH "http://localhost:8000/api/admin/documents/1/approve" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

### Reject Document
```bash
curl -X PATCH "http://localhost:8000/api/admin/documents/2/reject" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"reason": "Document is unclear"}'
```

---

## Frontend Integration

The frontend uses the `adminService` class:

```typescript
// Get all charities
const charities = await adminService.getAllCharities(1, { 
  status: 'pending' 
});

// Get charity details
const charity = await adminService.getCharityDetails(charityId);

// Approve document
await adminService.approveDocument(documentId);

// Reject document
await adminService.rejectDocument(documentId, reason);

// Approve charity
await adminService.approveCharity(charityId, notes);

// Reject charity
await adminService.rejectCharity(charityId, reason);
```
