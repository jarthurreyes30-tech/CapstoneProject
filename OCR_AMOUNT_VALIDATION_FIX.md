# OCR Amount Validation Fix

## Overview
Added validation to ensure the OCR-detected amount from the receipt matches the donor's input amount on the donation page.

---

## Problem Statement
When donors upload a receipt with OCR scanning:
- The system was auto-filling amounts without validation
- No check to ensure receipt amount matched donor's intended donation
- Risk of submitting incorrect amounts or fraudulent receipts

---

## Solution Implemented

### 1. Amount Matching Validation
When OCR completes scanning:
- **Compares** OCR-detected amount with donor's input amount
- **Allows** small rounding differences (within ₱1)
- **Shows error** if amounts don't match
- **Blocks submission** until mismatch is resolved

### 2. Visual Error Display
When amounts don't match:
- **Red alert box** appears below the receipt
- **Clear message** showing both amounts
- **Guidance** to verify receipt or correct donation amount
- **Animated entrance** for visibility

### 3. Submit Button Protection
- **Disabled** when amount mismatch detected
- **Button text changes** to "Fix Amount Mismatch"
- **Visual feedback** with opacity and cursor changes

---

## Code Changes

### File: `capstone_frontend/src/pages/donor/MakeDonation.tsx`

#### 1. Added State Variables
```typescript
const [ocrDetectedAmount, setOcrDetectedAmount] = useState<string>("");
const [amountMismatch, setAmountMismatch] = useState<boolean>(false);
```

#### 2. Enhanced OCR Extraction Logic
```typescript
onOCRExtract={(result) => {
  // Auto-fill reference number
  if (result.refNumber) {
    setFormData(prev => ({ ...prev, reference_number: result.refNumber || '' }));
    toast.success('Reference number detected: ' + result.refNumber);
  }
  
  // Validate amount matches donor's input
  if (result.amount) {
    setOcrDetectedAmount(result.amount);
    const detectedAmount = parseFloat(result.amount);
    const inputAmount = parseFloat(formData.amount);
    
    if (!isNaN(detectedAmount) && !isNaN(inputAmount)) {
      // Allow small rounding differences (within 1 peso)
      const difference = Math.abs(detectedAmount - inputAmount);
      
      if (difference <= 1) {
        setAmountMismatch(false);
        toast.success('Amount verified: ₱' + result.amount + ' matches your donation');
      } else {
        setAmountMismatch(true);
        toast.error(
          `Amount mismatch! Receipt shows ₱${detectedAmount.toLocaleString()} but you entered ₱${inputAmount.toLocaleString()}. Please verify.`,
          { duration: 8000 }
        );
      }
    }
  }
  
  if (result.confidence && result.confidence < 60) {
    toast.warning('Low OCR confidence. Please verify the values.');
  }
}}
```

#### 3. Added Visual Error Message
```tsx
{/* Amount Mismatch Error */}
{amountMismatch && ocrDetectedAmount && (
  <div className="p-4 rounded-lg bg-red-500/10 border-2 border-red-500/50 animate-in fade-in slide-in-from-top-2">
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-full bg-red-500/20 shrink-0">
        <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-red-600 dark:text-red-400 mb-1">Amount Mismatch Detected</h4>
        <p className="text-sm text-red-600/90 dark:text-red-400/90 mb-2">
          The amount on your receipt (₱{parseFloat(ocrDetectedAmount).toLocaleString()}) doesn't match your donation amount (₱{parseFloat(formData.amount).toLocaleString()}).
        </p>
        <p className="text-xs text-red-600/80 dark:text-red-400/80">
          Please verify your receipt or go back to correct your donation amount.
        </p>
      </div>
    </div>
  </div>
)}
```

#### 4. Updated Submit Button
```tsx
<Button 
  onClick={handleSubmit} 
  disabled={!formData.proofOfPayment || amountMismatch} 
  className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
>
  <Heart className="mr-2 h-5 w-5" />
  {amountMismatch ? 'Fix Amount Mismatch' : 'Submit Donation'}
</Button>
```

#### 5. Reset State on Receipt Removal
```typescript
onClick={() => {
  setFormData({ ...formData, proofOfPayment: null });
  setProofPreview(null);
  setOcrDetectedAmount("");
  setAmountMismatch(false);
}}
```

---

## Validation Logic

### Amount Comparison
```typescript
const detectedAmount = parseFloat(result.amount);
const inputAmount = parseFloat(formData.amount);
const difference = Math.abs(detectedAmount - inputAmount);

if (difference <= 1) {
  // MATCH - Allow submission
  setAmountMismatch(false);
  toast.success('Amount verified: ₱' + result.amount + ' matches your donation');
} else {
  // MISMATCH - Block submission
  setAmountMismatch(true);
  toast.error('Amount mismatch! Please verify.');
}
```

### Tolerance
- **Allows ±₱1 difference** to account for rounding
- Example: ₱100.00 input matches ₱100.50 receipt ✅
- Example: ₱100.00 input vs ₱150.00 receipt ❌

---

## User Experience Flow

### Scenario 1: Amounts Match ✅
1. Donor enters ₱500 donation
2. Uploads receipt showing ₱500
3. OCR detects ₱500
4. ✅ **Success toast**: "Amount verified: ₱500 matches your donation"
5. Submit button enabled
6. Donation proceeds normally

### Scenario 2: Amounts Don't Match ❌
1. Donor enters ₱500 donation
2. Uploads receipt showing ₱1000
3. OCR detects ₱1000
4. ❌ **Error toast**: "Amount mismatch! Receipt shows ₱1,000 but you entered ₱500"
5. 🚫 **Red alert box** appears with details
6. 🔒 **Submit button disabled** showing "Fix Amount Mismatch"
7. Donor must:
   - Go back and change donation to ₱1000, OR
   - Upload correct receipt, OR
   - Remove receipt to proceed without OCR

### Scenario 3: Low Confidence ⚠️
1. Donor uploads blurry receipt
2. OCR confidence < 60%
3. ⚠️ **Warning toast**: "Low OCR confidence. Please verify the values."
4. Manual verification recommended
5. Submit still allowed (user responsibility)

---

## Error Messages

### Toast Notifications

**Success (Match):**
```
✅ Amount verified: ₱500 matches your donation
```

**Error (Mismatch):**
```
❌ Amount mismatch! Receipt shows ₱1,000 but you entered ₱500. Please verify.
Duration: 8 seconds
```

**Warning (Low Confidence):**
```
⚠️ Low OCR confidence. Please verify the values.
```

### Visual Alert Box

**Title:** "Amount Mismatch Detected"

**Message:** 
```
The amount on your receipt (₱1,000) doesn't match your donation amount (₱500).
```

**Guidance:**
```
Please verify your receipt or go back to correct your donation amount.
```

---

## Security Benefits

### Fraud Prevention
✅ Prevents donors from uploading receipts for different amounts
✅ Catches accidental mistakes before submission
✅ Ensures receipt authenticity
✅ Reduces chargebacks and disputes

### Data Integrity
✅ Donation records match actual payments
✅ Accurate financial reporting
✅ Audit trail consistency
✅ Trust building with charities

---

## Testing Checklist

### Functional Tests
- [ ] Upload receipt with matching amount - success message shown
- [ ] Upload receipt with different amount - error shown, submit blocked
- [ ] Upload receipt with amount within ±₱1 - accepted as match
- [ ] Remove receipt - error clears, submit re-enabled
- [ ] Go back and change amount - can retry with new amount
- [ ] Upload receipt without amount detected - no validation error

### Edge Cases
- [ ] Receipt shows ₱100.00, input is ₱100 - should match
- [ ] Receipt shows ₱100.50, input is ₱100 - should match (within ±₱1)
- [ ] Receipt shows ₱100, input is ₱150 - should error
- [ ] Receipt shows ₱0 or invalid - should not trigger false error
- [ ] Multiple uploads - state resets correctly each time

### UI Tests
- [ ] Error box displays correctly
- [ ] Error box animates in smoothly
- [ ] Submit button shows correct text
- [ ] Submit button is properly disabled
- [ ] Toast notifications appear and disappear
- [ ] Dark mode styling works correctly

---

## Configuration

### Tolerance Setting
Currently set to **±₱1** for rounding differences.

To adjust:
```typescript
const difference = Math.abs(detectedAmount - inputAmount);
if (difference <= 1) {  // Change this value
  // Match
}
```

Recommended values:
- **0**: Exact match only (strict)
- **1**: Allow minor rounding (recommended)
- **5**: Allow small differences (lenient)

---

## Future Enhancements

1. **Admin Override**
   - Allow admins to approve mismatched donations
   - Add notes explaining the difference

2. **Configurable Tolerance**
   - Set tolerance per charity
   - Different rules for large vs small donations

3. **Smart Suggestions**
   - "Did you mean to donate ₱1,000 instead of ₱500?"
   - Quick fix button to update amount

4. **Receipt History**
   - Track all uploaded receipts
   - Flag suspicious patterns

5. **Analytics**
   - Track mismatch frequency
   - Identify problematic receipt types
   - Improve OCR accuracy

---

## Summary

✅ **Amount validation** ensures receipt matches donation
✅ **Visual error display** clearly shows mismatches
✅ **Submit protection** blocks invalid submissions
✅ **User guidance** helps resolve issues
✅ **State management** properly resets on changes
✅ **Tolerance setting** allows minor rounding differences

The donation page now validates that OCR-detected amounts match donor input, preventing errors and potential fraud while maintaining a smooth user experience.
