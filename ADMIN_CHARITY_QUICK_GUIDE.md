# Admin Charity Management - Quick Reference Guide

## 🎯 Access
**URL**: `http://localhost:8080/admin/charities`

## 🔍 Main Features

### 1. Search & Filter
```
┌─────────────────────────────────────────────────┐
│ 🔍 Search charities...        [Filter: All ▼]  │
└─────────────────────────────────────────────────┘
```
- Search by: Name, Email, Registration Number
- Filter by: All, Pending, Approved, Rejected

### 2. Charity Cards
```
┌──────────────────────────────────────┐
│ [Background Image]          [Badge]  │
│ ┌────┐                               │
│ │Logo│ Charity Name                  │
│ └────┘ ✉ email@charity.org           │
│        📄 Reg: 12345                  │
│                                       │
│ Mission: Help communities...          │
│                                       │
│ 🎯 5  💰 120  👥 350                  │
│                                       │
│ ID: #123    Submitted: Jan 1, 2025    │
│ 📄 3 documents submitted              │
│                                       │
│ [✓ Approve]  [✗ Reject]              │
└──────────────────────────────────────┘
```

### 3. Detail View (Click any card)

#### Tab 1: Information
```
┌─────────────────────────────────────────────┐
│ [Large Background Image]                    │
│ ┌──────┐                                    │
│ │ Logo │ Charity Name              [Badge]  │
│ └──────┘ ✉ contact@email.com               │
└─────────────────────────────────────────────┘

┌─ Organization Details ─┐  ┌─ Contact Info ─┐
│ Reg No: 12345          │  │ 📞 Phone        │
│ Type: NGO              │  │ 📍 Address      │
│ Founded: 2020          │  │ 🌐 Website      │
└────────────────────────┘  └─────────────────┘

┌─ Mission Statement ────────────────────────┐
│ Our mission is to...                       │
└────────────────────────────────────────────┘

┌─ Vision Statement ─────────────────────────┐
│ Our vision is to...                        │
└────────────────────────────────────────────┘

┌─ Social Media ─────────────────────────────┐
│ [Facebook] [Instagram] [Twitter] [YouTube] │
└────────────────────────────────────────────┘
```

#### Tab 2: Documents
```
┌──────────────────────────────────────────────┐
│ 📄 SEC Registration Certificate  [Approved]  │
│    Uploaded: Jan 1, 2025                     │
│    Verified: Jan 2, 2025                     │
│    [👁 View] [⬇ Download]                    │
├──────────────────────────────────────────────┤
│ 📄 Tax Exemption Certificate    [Pending]   │
│    Uploaded: Jan 1, 2025                     │
│    [👁 View] [⬇ Download]                    │
│    [✓ Approve] [✗ Reject]                    │
├──────────────────────────────────────────────┤
│ 📄 Bylaws                       [Rejected]   │
│    Uploaded: Jan 1, 2025                     │
│    ⚠ Rejection: Document is unclear          │
│    [👁 View] [⬇ Download]                    │
└──────────────────────────────────────────────┘
```

#### Tab 3: Campaigns
```
┌──────────────────────────────────────────────┐
│ Help Build School                   [Active] │
│ Fundraising for new school building          │
│                                               │
│ Goal:   ₱1,000,000                           │
│ Raised: ₱750,000                             │
│ [████████████░░░░] 75.0% funded              │
│ 250 donors                                    │
└──────────────────────────────────────────────┘
```

#### Tab 4: Compliance
```
┌──────────────────────────────────────────────┐
│ 📅 Registration Details                      │
│    Submitted: January 1, 2025                │
│    Verified: January 5, 2025                 │
│                                               │
│ ⚠ Admin Notes                                │
│    Please update your contact information    │
└──────────────────────────────────────────────┘
```

## 🔄 Document Verification Workflow

### Step 1: View Document
```
Click [👁 View] → Opens Document Viewer
┌─────────────────────────────────────────┐
│ Document Viewer                         │
├─────────────────────────────────────────┤
│ 📄 SEC Registration | Status: Pending   │
│                        [⬇ Download]     │
├─────────────────────────────────────────┤
│ [Document Preview - PDF/Image]          │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│ [✓ Approve Document] [✗ Reject]        │
└─────────────────────────────────────────┘
```

### Step 2: Approve Document
```
Click [✓ Approve] → Document Status: Approved ✓
Toast: "Document approved successfully"
```

### Step 3: Reject Document
```
Click [✗ Reject] → Opens Rejection Form
┌─────────────────────────────────────────┐
│ Reject Document                         │
├─────────────────────────────────────────┤
│ Document: SEC Registration              │
│                                         │
│ Rejection Reason:                       │
│ ┌─────────────────────────────────────┐ │
│ │ Document is blurry and unreadable.  │ │
│ │ Please upload a clearer version.    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Cancel] [Confirm Rejection]            │
└─────────────────────────────────────────┘
```

### Step 4: Charity Resubmits
```
Charity sees rejection reason
Uploads new document
Status: Pending (ready for re-review)
```

## ⚡ Quick Actions

### Approve Charity (Quick)
```
From card: Click [✓ Approve]
→ Charity approved immediately
→ Status changes to "Approved"
```

### Reject Charity
```
From card: Click [✗ Reject]
→ Opens rejection dialog
→ Enter reason
→ Click [Confirm Rejection]
→ Status changes to "Rejected"
```

### Approve All Documents
```
1. Open charity details
2. Go to Documents tab
3. Click [✓ Approve] on each document
4. When all approved → Charity auto-approved
```

## 📊 Status Indicators

| Badge Color | Status | Meaning |
|------------|--------|---------|
| 🟢 Green | Approved | Verified and active |
| 🔴 Red | Rejected | Application denied |
| 🟡 Yellow | Pending | Awaiting review |

## 💡 Tips

1. **Review all documents** before approving charity
2. **Provide clear rejection reasons** so charity knows what to fix
3. **Use search** to quickly find specific charities
4. **Check campaigns** to see charity's fundraising activities
5. **Review social media** to verify charity's online presence

## 🎨 Responsive Design

### Mobile View
- Single column cards
- Stacked information
- Full-width buttons

### Tablet View
- 2-column grid
- Optimized spacing
- Touch-friendly

### Desktop View
- 3-column grid
- Wide modals
- Hover effects

## 🔐 Admin Permissions Required
- Role: `admin`
- Access: Full charity management
- Actions: Approve, Reject, View all data

## ✅ All Features Working
- ✓ Search and filter
- ✓ View all charity information
- ✓ See logo and background images
- ✓ View and download documents
- ✓ Approve/reject documents individually
- ✓ Approve/reject charities
- ✓ View campaigns
- ✓ Responsive on all devices
- ✓ Dark mode support
- ✓ Smooth animations
