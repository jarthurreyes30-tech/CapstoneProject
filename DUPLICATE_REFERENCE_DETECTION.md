# Duplicate Reference Number Detection - Implementation Guide

## Overview
This feature prevents donors from accidentally submitting duplicate donations by checking if a reference number has already been used in the system.

## Backend Implementation

### Location
`capstone_backend/app/Http/Controllers/DonationController.php`

### Methods Enhanced
1. **`submitManualDonation()`** - Campaign donations (lines 96-147)
2. **`submitCharityDonation()`** - Direct charity donations (lines 149-195)

### Validation Logic
Before storing a new donation, the system:
1. Checks if the reference number exists in the database
2. Retrieves the previous donation details (with campaign and charity info)
3. Returns a 422 error with comprehensive details if duplicate found

### API Response (Duplicate Detected)
```json
{
  "message": "Duplicate Reference Number Detected",
  "error": "This reference number has already been used for a previous donation.",
  "details": {
    "reference_number": "REF123456789",
    "previous_donation_date": "November 08, 2025 at 08:30 PM",
    "previous_donation_to": "Campaign Name or Charity Name",
    "previous_donation_amount": "₱1,000.00",
    "status": "pending" // or "confirmed", "rejected", etc.
  }
}
```

## Frontend Implementation

### Location
`capstone_frontend/src/pages/donor/MakeDonation.tsx`

### Features
1. **Enhanced Error Handling** (lines 248-271)
   - Detects duplicate reference errors from API
   - Displays detailed toast notification with:
     - Reference number that's duplicated
     - Previous donation amount
     - Who received the previous donation
     - Date of previous donation
     - Status of previous donation
   - Shows for 10 seconds to ensure donor reads it

2. **Visual Notification**
   - Red-themed error notification
   - Structured layout showing all duplicate details
   - Action guidance: "Please verify your reference number or contact support"

### User Experience Flow
1. Donor fills out donation form including reference number
2. Donor uploads proof of payment (OCR may auto-detect reference)
3. Donor submits donation
4. System checks for duplicate reference
5. If duplicate:
   - ❌ Donation is NOT saved
   - 🔔 Detailed notification appears showing previous donation info
   - 👤 Donor can verify and correct the reference number
6. If unique:
   - ✅ Donation is saved successfully
   - 🎉 Success confirmation shown

## Database Schema

### Table: `donations`
Reference number column:
- **Field**: `reference_number`
- **Type**: VARCHAR(255)
- **Nullable**: Yes (for some donation types)
- **Indexed**: Recommended for performance

## Testing Scenarios

### Test 1: Submit New Donation (Success)
**Steps:**
1. Go to donation page
2. Fill form with unique reference number: `REF20251108001`
3. Upload proof and submit
**Expected:** ✅ Success message, donation saved

### Test 2: Submit Duplicate Reference (Error)
**Steps:**
1. Try to submit another donation with same reference: `REF20251108001`
2. Submit form
**Expected:** 
- ❌ Error notification appears
- Shows previous donation details
- Donation NOT saved

### Test 3: Different Donor, Same Reference (Error)
**Steps:**
1. Login as different donor
2. Try to use same reference: `REF20251108001`
3. Submit form
**Expected:** 
- ❌ Still blocked
- Shows previous donation details (protected data per privacy)

### Test 4: OCR Auto-Detection with Duplicate
**Steps:**
1. Upload receipt with reference number already in system
2. OCR auto-fills reference field
3. Submit form
**Expected:**
- ❌ Duplicate detected
- Notification appears with details

## Security Considerations

1. **Privacy**: Donor details of previous donation are NOT exposed (only donation metadata)
2. **Validation**: Server-side validation ensures no bypass
3. **Performance**: Database query indexed on reference_number field
4. **Logging**: Consider logging duplicate attempts for fraud detection

## Benefits

✅ **Prevents Accidental Duplicates**: Stops donors from submitting same receipt twice
✅ **Clear Communication**: Donors know exactly why submission failed
✅ **Data Integrity**: Maintains accurate donation records
✅ **User-Friendly**: Shows actionable information to resolve issue
✅ **Fraud Prevention**: Makes it harder to claim same donation multiple times

## Future Enhancements

- [ ] Add admin panel to view duplicate attempt logs
- [ ] Allow donors to view their submission history to verify
- [ ] Implement similarity detection for near-duplicate references
- [ ] Add option to "force" submission with admin approval if legitimate
- [ ] Email notification to charity admin when duplicate detected
- [ ] Generate unique QR code per donation for better tracking

## API Endpoints

### POST `/api/campaigns/{campaign}/donate`
Submit manual donation to campaign

### POST `/api/charities/{charity}/donate`
Submit manual donation to charity

Both endpoints include duplicate reference validation.

## Related Files
- Backend: `app/Http/Controllers/DonationController.php`
- Frontend: `src/pages/donor/MakeDonation.tsx`
- Model: `app/Models/Donation.php`
- Migration: `*_create_donations_table.php`
