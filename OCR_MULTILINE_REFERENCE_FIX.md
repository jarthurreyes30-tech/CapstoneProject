# OCR Multi-Line Reference Number Detection - Fix

## Problem
GCash receipts display reference numbers split across **two lines**:

```
Ref No. 0033 807
        526547
```

The OCR system was only detecting single-line reference numbers, causing it to **miss or partially detect** multi-line references.

## Example from Receipt
From the actual GCash receipt screenshot:
- **Line 1:** `Ref No. 0033 807`
- **Line 2:** `       526547`
- **Full Reference:** `0033807526547` (13 digits)

## Solution Implemented

### File Modified
`capstone_frontend/src/components/ReceiptUploader.tsx`

### Changes Made

#### 1. **Preserve Newlines During Text Processing**
```typescript
// OLD: Collapsed all whitespace immediately
let text = rawText.replace(/\s+/g, ' ')

// NEW: Keep newlines for multi-line detection
let textWithNewlines = rawText
  .replace(/[^\x20-\x7E₱£\n\r]/g, '') // Keep newlines (\n\r)
  .trim();

let text = textWithNewlines
  .replace(/\s+/g, ' ')
  .trim();
```

#### 2. **Multi-Line Reference Detection (Primary)**
```typescript
// Detect: "Ref No. [numbers]\n[numbers]"
const multiLineRefMatch = textWithNewlines.match(
  /Ref\s+No\.\s+([0-9 ]+)[\r\n]+\s*([0-9 ]+)/i
);

if (multiLineRefMatch) {
  const line1 = multiLineRefMatch[1].replace(/\s+/g, ''); // "0033807"
  const line2 = multiLineRefMatch[2].replace(/\s+/g, ''); // "526547"
  const combined = line1 + line2; // "0033807526547"
  
  if (combined.length >= 10 && combined.length <= 20) {
    refNumber = combined;
  }
}
```

#### 3. **Fallback Multi-Line Detection**
If the primary GCash parser doesn't catch it, the fallback patterns also check for multi-line format:

```typescript
if (!refNumber) {
  const fallbackMultiLineMatch = textWithNewlines.match(
    /Ref\s+No\.\s+([0-9 ]+)[\r\n]+\s*([0-9 ]+)/i
  );
  
  if (fallbackMultiLineMatch) {
    // Same logic as primary detection
  }
}
```

## How It Works

### Detection Flow
```
1. OCR extracts text from receipt
   ↓
2. Preserve newlines in textWithNewlines
   ↓
3. Check for multi-line pattern:
   "Ref No. [digits]\n[digits]"
   ↓
4. Extract Line 1: "0033 807" → Clean: "0033807"
   Extract Line 2: "526547" → Clean: "526547"
   ↓
5. Combine: "0033807" + "526547" = "0033807526547"
   ↓
6. Validate length (10-20 digits) ✅
   ↓
7. Return as reference number
```

### Regex Pattern Breakdown
```regex
/Ref\s+No\.\s+([0-9 ]+)[\r\n]+\s*([0-9 ]+)/i

Ref\s+No\.     → Matches "Ref No." (case insensitive)
\s+            → One or more spaces
([0-9 ]+)      → Capture group 1: digits and spaces (first line)
[\r\n]+        → One or more newline characters
\s*            → Optional leading spaces on next line
([0-9 ]+)      → Capture group 2: digits and spaces (second line)
```

## Supported Formats

### ✅ Now Detects All These Formats:

#### Format 1: Multi-Line (NEW!)
```
Ref No. 0033 807
        526547
```
Result: `0033807526547`

#### Format 2: Single Line with Spaces
```
Ref No. 0033 076 950354
```
Result: `0033076950354`

#### Format 3: Single Line No Spaces
```
Ref No. 0033807526547
```
Result: `0033807526547`

#### Format 4: Alternative Spacing
```
Ref No. 0033
807526547
```
Result: `0033807526547`

## Testing Scenarios

### Test 1: Standard GCash Multi-Line
**Receipt Text:**
```
Express Send
RE••E SH•••E A.
+63 949 949 0955
Sent via GCash

Amount 1,500.00
Total Amount Sent ₱1,500.00

Ref No. 0033 807
526547

Oct 19, 2025 8:21 PM
```

**Expected Output:**
- Reference: `0033807526547` ✅
- Amount: `1500.00` ✅
- Date: `Oct 19, 2025 8:21 PM` ✅

### Test 2: Different Number Patterns
**Receipt Text:**
```
Ref No. 1234 567
890123
```
**Expected:** `1234567890123` ✅

### Test 3: Edge Case - Very Long Reference
**Receipt Text:**
```
Ref No. 12345 678
9012345678
```
**Expected:** `123456789012345678` ✅ (18 digits, within 10-20 limit)

### Test 4: Invalid - Too Short
**Receipt Text:**
```
Ref No. 123
456
```
**Expected:** ❌ Rejected (only 6 digits, below 10 minimum)

## Validation Rules

The combined reference number must meet these criteria:

| Rule | Validation |
|------|------------|
| **Minimum Length** | 10 digits |
| **Maximum Length** | 20 digits |
| **Characters** | Digits only (spaces removed) |
| **Format** | Two lines, both containing numbers |

## Benefits

✅ **Handles Real-World Receipts**: Supports actual GCash receipt format  
✅ **Backward Compatible**: Still detects single-line references  
✅ **Robust**: Multiple fallback patterns ensure detection  
✅ **Validated**: Length checks prevent false positives  
✅ **User-Friendly**: No manual entry needed for multi-line refs

## Console Logging

The system logs detailed information for debugging:

```typescript
console.log('✅ Multi-line ref matched: Line1:', '0033807', '+ Line2:', '526547', '→', '0033807526547');
```

This helps developers verify detection is working correctly.

## Integration with Donation System

Once detected, the reference number is:
1. ✅ Auto-filled into the donation form
2. ✅ Checked against database for duplicates
3. ✅ Displayed in confirmation toast
4. ✅ Submitted with donation proof

## Performance Impact

- **No performance degradation**: Regex patterns are efficient
- **Fast processing**: Runs during normal OCR flow
- **No additional API calls**: Client-side processing only

## Future Enhancements

- [ ] Support 3+ line references (rare but possible)
- [ ] Handle references with letter prefixes (e.g., "REF-0033...")
- [ ] Train ML model for better multi-line detection
- [ ] Add confidence scoring for multi-line matches
- [ ] Support other payment providers with multi-line refs

## Related Files

- **Component**: `src/components/ReceiptUploader.tsx`
- **Usage**: `src/pages/donor/MakeDonation.tsx`
- **Backend**: `app/Http/Controllers/DonationController.php` (duplicate check)

## Version Info

- **Implementation Date**: November 8, 2025
- **Version**: 1.1.0
- **OCR Library**: Tesseract.js
- **Supported Receipts**: GCash, BPI, Maya, BDO, PayPal, Generic

## Example Code Usage

```typescript
// In parent component (MakeDonation.tsx)
<ReceiptUploader
  onFileChange={(file) => setFormData({ ...formData, proofOfPayment: file })}
  onOCRExtract={(result) => {
    if (result.refNumber) {
      setFormData(prev => ({ 
        ...prev, 
        reference_number: result.refNumber // Multi-line ref auto-filled!
      }));
      toast.success('Reference number detected: ' + result.refNumber);
    }
  }}
/>
```

## Summary

This fix enables the OCR system to **correctly detect reference numbers that span multiple lines** in GCash receipts, improving the user experience by reducing manual data entry and ensuring accurate donation tracking.

**Before:** ❌ Missed multi-line reference → Manual entry required  
**After:** ✅ Detects multi-line reference → Auto-filled for donor
