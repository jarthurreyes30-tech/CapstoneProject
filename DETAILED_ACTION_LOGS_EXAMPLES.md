# Detailed Action Logs - Examples

## Overview

Each action log now displays as **individual entries** with **detailed information**. Donations are no longer totaled - each donation shows separately with the amount.

---

## 📋 Example Log Entries

### 💰 **Donation Actions**

#### 1. Donation Created (Donor)
```
User: John Doe (donor)
Action: donation_created
Description: Made a donation of ₱5,000.00 (Campaign ID: 12)
Date: 2024-12-15 10:30 AM
IP: 127.0.0.1
```

#### 2. Donation Created (Another Donor)
```
User: Jane Smith (donor)
Action: donation_created
Description: Made a donation of ₱10,000.00 (Campaign ID: 15)
Date: 2024-12-15 11:00 AM
IP: 192.168.1.100
```

#### 3. Donation Confirmed (Charity Admin)
```
User: Hope Foundation (charity_admin)
Action: donation_confirmed
Description: Confirmed donation ₱5,000.00 (Donation #45)
Date: 2024-12-15 02:00 PM
IP: 192.168.1.50
```

#### 4. Donation Rejected
```
User: Admin User (admin)
Action: donation_rejected
Description: Rejected donation #48 - Reason: Invalid payment proof
Date: 2024-12-15 03:30 PM
IP: 127.0.0.1
```

---

### 📢 **Campaign Actions**

#### 1. Campaign Created (Charity)
```
User: Save the Children PH (charity_admin)
Action: campaign_created
Description: Created campaign: "Help Build Community Center" (ID: 23)
Date: 2024-12-14 09:00 AM
IP: 192.168.1.45
```

#### 2. Campaign Updated (Charity)
```
User: Save the Children PH (charity_admin)
Action: campaign_updated
Description: Updated Help Build Community Center - Updated: title, description, goal_amount
Date: 2024-12-14 10:30 AM
IP: 192.168.1.45
```

#### 3. Campaign Activated (Charity)
```
User: Hope Foundation (charity_admin)
Action: campaign_activated
Description: Activated campaign: Medical Fund Drive
Date: 2024-12-14 11:00 AM
IP: 192.168.1.50
```

#### 4. Campaign Paused (Charity)
```
User: Red Cross PH (charity_admin)
Action: campaign_paused
Description: Paused campaign: Emergency Relief Fund
Date: 2024-12-14 02:00 PM
IP: 192.168.1.60
```

---

### 🏢 **Charity Actions**

#### 1. Charity Registered
```
User: Maria Santos (charity_admin)
Action: charity_created
Description: Registered charity: Hope for Tomorrow Foundation
Date: 2024-12-10 08:00 AM
IP: 192.168.1.70
```

#### 2. Charity Approved (Admin Action)
```
User: Admin User (admin)
Action: charity_approved
Description: Approved charity application: Hope for Tomorrow Foundation
Date: 2024-12-10 10:00 AM
IP: 127.0.0.1
```

#### 3. Charity Rejected (Admin Action)
```
User: Admin User (admin)
Action: charity_rejected
Description: Rejected charity application: Fake Charity Inc - Reason: Incomplete documents
Date: 2024-12-10 11:00 AM
IP: 127.0.0.1
```

#### 4. Charity Suspended (Admin Action)
```
User: Admin User (admin)
Action: charity_suspended
Description: Suspended charity: Suspicious Org - Reason: Multiple fraud reports
Date: 2024-12-11 03:00 PM
IP: 127.0.0.1
```

#### 5. Charity Updated
```
User: Red Cross PH (charity_admin)
Action: charity_updated
Description: Updated charity profile: Red Cross PH - Updated: address, phone, website
Date: 2024-12-12 09:30 AM
IP: 192.168.1.60
```

---

### 👤 **Profile & Account Actions**

#### 1. Profile Updated (Donor)
```
User: John Doe (donor)
Action: profile_updated
Description: Updated profile: name, bio, profile_image
Date: 2024-12-13 10:00 AM
IP: 127.0.0.1
```

#### 2. Password Changed
```
User: Jane Smith (donor)
Action: password_changed
Description: Changed account password
Date: 2024-12-13 11:00 AM
IP: 192.168.1.100
```

#### 3. Email Changed
```
User: Mark Johnson (donor)
Action: email_changed
Description: Changed email from mark@old.com to mark@new.com
Date: 2024-12-13 12:00 PM
IP: 192.168.1.110
```

#### 4. Account Deactivated
```
User: Sarah Lee (donor)
Action: account_deactivated
Description: Deactivated account
Date: 2024-12-13 01:00 PM
IP: 192.168.1.120
```

---

### 📝 **Post & Comment Actions**

#### 1. Post Created (Charity)
```
User: Save the Children PH (charity_admin)
Action: post_created
Description: Created new post/update for Charity #5
Date: 2024-12-14 08:00 AM
IP: 192.168.1.45
```

#### 2. Comment Created (Donor)
```
User: John Doe (donor)
Action: comment_created
Description: Posted a comment on Campaign #12
Date: 2024-12-14 09:00 AM
IP: 127.0.0.1
```

#### 3. Comment Updated (Donor)
```
User: John Doe (donor)
Action: comment_updated
Description: Edited comment
Date: 2024-12-14 09:15 AM
IP: 127.0.0.1
```

---

### 📄 **Document Actions**

#### 1. Document Uploaded (Charity)
```
User: Hope Foundation (charity_admin)
Action: document_uploaded
Description: Uploaded SEC Registration for Charity #8
Date: 2024-12-09 10:00 AM
IP: 192.168.1.50
```

#### 2. Document Approved (Admin)
```
User: Admin User (admin)
Action: document_approved
Description: Approved document #15
Date: 2024-12-09 11:00 AM
IP: 127.0.0.1
```

#### 3. Document Rejected (Admin)
```
User: Admin User (admin)
Action: document_rejected
Description: Rejected document #16 - Document unclear or expired
Date: 2024-12-09 11:30 AM
IP: 127.0.0.1
```

---

### 💸 **Fund Usage Actions**

#### 1. Fund Usage Logged (Charity)
```
User: Red Cross PH (charity_admin)
Action: fund_usage_created
Description: Logged fund usage of ₱25,000.00 for Campaign #10
Date: 2024-12-14 02:00 PM
IP: 192.168.1.60
```

#### 2. Fund Usage Updated (Charity)
```
User: Red Cross PH (charity_admin)
Action: fund_usage_updated
Description: Updated fund usage record (₱25,500.00)
Date: 2024-12-14 03:00 PM
IP: 192.168.1.60
```

---

### 🔄 **Refund Actions**

#### 1. Refund Requested (Donor)
```
User: John Doe (donor)
Action: refund_requested
Description: Requested refund for Donation #45
Date: 2024-12-15 01:00 PM
IP: 127.0.0.1
```

#### 2. Refund Approved (Admin)
```
User: Admin User (admin)
Action: refund_approved
Description: Approved refund of ₱5,000.00 (Donation #45)
Date: 2024-12-15 02:00 PM
IP: 127.0.0.1
```

#### 3. Refund Rejected (Admin)
```
User: Admin User (admin)
Action: refund_rejected
Description: Rejected refund for Donation #48 - Outside refund period
Date: 2024-12-15 03:00 PM
IP: 127.0.0.1
```

---

### ❤️ **Follow Actions**

#### 1. Followed Charity (Donor)
```
User: Jane Smith (donor)
Action: charity_followed
Description: Started following charity (Charity #5)
Date: 2024-12-14 10:00 AM
IP: 192.168.1.100
```

#### 2. Unfollowed Charity (Donor)
```
User: Mark Johnson (donor)
Action: charity_unfollowed
Description: Unfollowed charity (Charity #8)
Date: 2024-12-14 11:00 AM
IP: 192.168.1.110
```

---

### 🔐 **Authentication Actions**

#### 1. Login
```
User: John Doe (donor)
Action: login
Description: Logged in to the system
Date: 2024-12-15 08:00 AM
IP: 127.0.0.1
```

#### 2. Logout
```
User: John Doe (donor)
Action: logout
Description: Logged out from the system
Date: 2024-12-15 05:00 PM
IP: 127.0.0.1
```

#### 3. User Registered
```
User: New User (donor)
Action: user_registered
Description: Registered as Donor
Date: 2024-12-14 09:00 AM
IP: 192.168.1.130
```

---

### 🛡️ **Admin Actions**

#### 1. User Suspended
```
User: Admin User (admin)
Action: user_suspended
Description: Suspended user: Spammer123 - Multiple violations
Date: 2024-12-15 10:00 AM
IP: 127.0.0.1
```

#### 2. User Activated
```
User: Admin User (admin)
Action: user_activated
Description: Activated user: John Doe
Date: 2024-12-15 11:00 AM
IP: 127.0.0.1
```

---

## 🎯 Key Features

### ✅ **Individual Entries**
- Each donation shows as a separate log entry
- Each campaign action shows as a separate log entry
- No grouping or totaling

### ✅ **Detailed Information**
- **Amounts:** All monetary values shown (₱5,000.00)
- **IDs:** Campaign IDs, Donation IDs, Charity IDs displayed
- **Titles:** Campaign titles, charity names included
- **Reasons:** Rejection/suspension reasons shown
- **Changes:** Updated fields listed

### ✅ **Clear Context**
- Donor actions clearly labeled
- Charity actions clearly labeled
- Admin actions clearly labeled
- All actions traceable

---

## 📊 **What You'll See in Admin Dashboard**

### Filter: "Donation Created"
```
1. John Doe (donor) - Made a donation of ₱5,000.00 (Campaign ID: 12) - Dec 15, 10:30 AM
2. Jane Smith (donor) - Made a donation of ₱10,000.00 (Campaign ID: 15) - Dec 15, 11:00 AM
3. Mark Johnson (donor) - Made a donation of ₱2,500.00 (Campaign ID: 12) - Dec 15, 01:00 PM
```

### Filter: "Campaign Created"
```
1. Save the Children PH (charity_admin) - Created campaign: "Help Build Community Center" (ID: 23) - Dec 14, 09:00 AM
2. Hope Foundation (charity_admin) - Created campaign: "Medical Fund Drive" (ID: 24) - Dec 14, 10:00 AM
```

### Filter: "Profile Updated"
```
1. John Doe (donor) - Updated profile: name, bio, profile_image - Dec 13, 10:00 AM
2. Red Cross PH (charity_admin) - Updated charity profile: Red Cross PH - Updated: address, phone - Dec 12, 09:30 AM
```

---

## 🔍 **How to Verify**

### 1. Check Individual Donations
```sql
SELECT 
    u.name,
    al.action,
    JSON_EXTRACT(al.details, '$.amount') as amount,
    al.created_at
FROM activity_logs al
JOIN users u ON u.id = al.user_id
WHERE al.action = 'donation_created'
ORDER BY al.created_at DESC
LIMIT 10;
```

### 2. Check Campaign Actions
```sql
SELECT 
    u.name,
    al.action,
    JSON_EXTRACT(al.details, '$.campaign_title') as title,
    al.created_at
FROM activity_logs al
JOIN users u ON u.id = al.user_id
WHERE al.action LIKE 'campaign_%'
ORDER BY al.created_at DESC
LIMIT 10;
```

---

## ✨ Summary

**Before:**
- ❌ Generic descriptions: "Made a donation"
- ❌ No amounts shown
- ❌ No campaign titles
- ❌ Missing context

**After:**
- ✅ Detailed descriptions: "Made a donation of ₱5,000.00 (Campaign ID: 12)"
- ✅ All amounts visible
- ✅ Campaign titles shown
- ✅ Complete context for every action
- ✅ Individual entries (not grouped)
- ✅ Easy to track each donation separately

**Each donation now appears as its own log entry with the full amount and details! 🎯**
