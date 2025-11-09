# Fund Usage Log Validation Summary

## Overview
Implemented validation to prevent charities from logging ₱0 fund usage. All fund usage logs must now be at least ₱1.

## Rationale
- Prevents accidental or invalid ₱0 entries in fund tracking
- Ensures meaningful financial records
- Maintains data integrity for transparency reports
- Aligns with donation validation (donations also require min ₱1)

---

## Changes Implemented

### 1. Backend Validation

#### File: `capstone_backend/app/Http/Controllers/FundUsageController.php`

**store() method - Line 62:**
```php
'amount' => 'required|numeric|min:1',  // Changed from min:0
```

**update() method - Line 126:**
```php
'amount' => 'required|numeric|min:1',  // Changed from min:0
```

**Impact:**
- Creating new fund usage logs requires amount >= ₱1
- Updating existing fund usage logs requires amount >= ₱1
- API will return 422 validation error if amount < 1

---

### 2. Database Constraint

#### File: `capstone_backend/database/migrations/2025_11_06_000002_add_amount_check_to_fund_usage_logs.php`

**New Migration Created:**
```php
DB::statement('ALTER TABLE fund_usage_logs ADD CONSTRAINT fund_usage_logs_amount_min CHECK (amount >= 1)');
```

**Purpose:**
- Enforces minimum amount at database level
- Prevents direct database manipulation from inserting invalid amounts
- Works with MySQL 8.0.16+ (CHECK constraint support)

**Rollback:**
```php
DB::statement('ALTER TABLE fund_usage_logs DROP CHECK fund_usage_logs_amount_min');
```

---

### 3. Frontend Validation

#### File: `capstone_frontend/src/components/campaign/FundUsageFormModal.tsx`

**Validation Logic (Lines 77-93):**
```typescript
const amount = parseFloat(formData.amount);
if (!formData.amount || isNaN(amount) || amount <= 0) {
  toast({
    title: "Validation Error",
    description: "Amount must be greater than ₱0. Please enter a valid amount.",
    variant: "destructive",
  });
  return;
}
if (amount < 1) {
  toast({
    title: "Validation Error",
    description: "Amount must be at least ₱1. Fund usage less than ₱1 is not accepted.",
    variant: "destructive",
  });
  return;
}
```

**Input Field (Lines 184-193):**
```tsx
<Input
  id="amount"
  type="number"
  step="0.01"
  min="1"           // Changed from min="0"
  placeholder="1.00" // Changed from "0.00"
  value={formData.amount}
  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
  required
/>
```

**Benefits:**
- Immediate user feedback before submission
- Clear error messages explaining the requirement
- HTML5 validation prevents values < 1
- Consistent with donation form validation

---

## Validation Layers

### Layer 1: Frontend (Immediate Feedback)
- HTML5 `min="1"` attribute
- JavaScript validation with clear error messages
- Prevents form submission if invalid

### Layer 2: Backend API (Business Logic)
- Laravel validation rules: `min:1`
- Returns 422 error with validation message
- Prevents invalid data from reaching database

### Layer 3: Database (Data Integrity)
- CHECK constraint: `amount >= 1`
- Last line of defense against invalid data
- Protects against direct database manipulation

---

## Error Messages

### Frontend Validation Errors

**If amount <= 0:**
```
Title: "Validation Error"
Description: "Amount must be greater than ₱0. Please enter a valid amount."
```

**If amount < 1:**
```
Title: "Validation Error"
Description: "Amount must be at least ₱1. Fund usage less than ₱1 is not accepted."
```

### Backend Validation Error (422)
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "amount": [
      "The amount must be at least 1."
    ]
  }
}
```

### Database Constraint Error
```
SQLSTATE[HY000]: General error: 3819 Check constraint 'fund_usage_logs_amount_min' is violated.
```

---

## Deployment Instructions

### Step 1: Run Migration
```bash
cd capstone_backend
php artisan migrate
```

Expected output:
```
INFO  Running migrations.

2025_11_06_000002_add_amount_check_to_fund_usage_logs ... DONE
```

### Step 2: Rebuild Frontend
```bash
cd capstone_frontend
npm run build
```

### Step 3: Verify

**Test Backend:**
```bash
# Try to create fund log with ₱0 (should fail)
curl -X POST http://localhost:8000/api/campaigns/1/fund-usage \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "amount=0" \
  -F "category=supplies" \
  -F "description=Test"

# Expected: 422 validation error
```

**Test Frontend:**
1. Login as charity admin
2. Go to a campaign
3. Click "Add Fund Usage"
4. Try to enter ₱0 - should show error
5. Enter ₱1 - should succeed

---

## Affected Features

### ✅ Fund Usage Logging
- Charities can no longer log ₱0 expenses
- Minimum expense is ₱1

### ✅ Fund Tracking Reports
- All fund usage logs will have meaningful amounts
- Transparency reports will show valid data

### ✅ Campaign Analytics
- Fund usage statistics will be accurate
- No ₱0 entries to skew data

### ✅ Admin Fund Tracking
- Admin dashboard will show valid disbursements
- No ₱0 entries in fund flow calculations

---

## Consistency Across System

The application now has consistent minimum amount validation:

| Feature | Minimum Amount | Validation Layers |
|---------|---------------|-------------------|
| **Donations** | ₱1 | Frontend + Backend + Database |
| **Fund Usage Logs** | ₱1 | Frontend + Backend + Database |
| **Refund Requests** | Based on original donation | Backend |

---

## Testing Checklist

### Backend Tests
- [ ] POST /campaigns/{id}/fund-usage with amount=0 returns 422
- [ ] POST /campaigns/{id}/fund-usage with amount=0.5 returns 422
- [ ] POST /campaigns/{id}/fund-usage with amount=1 succeeds
- [ ] PUT /fund-usage/{id} with amount=0 returns 422
- [ ] PUT /fund-usage/{id} with amount=1 succeeds
- [ ] Direct database INSERT with amount=0 fails (CHECK constraint)

### Frontend Tests
- [ ] Fund usage form shows error for ₱0
- [ ] Fund usage form shows error for ₱0.50
- [ ] Fund usage form accepts ₱1
- [ ] Fund usage form accepts ₱100.50
- [ ] Input field has min="1" attribute
- [ ] Placeholder shows "1.00" instead of "0.00"

### Integration Tests
- [ ] Create fund log with valid amount succeeds
- [ ] Update fund log to ₱0 fails
- [ ] Fund tracking reports show correct totals
- [ ] Campaign transparency page displays valid logs

---

## Database Migration Details

### Migration File
`2025_11_06_000002_add_amount_check_to_fund_usage_logs.php`

### SQL Executed
```sql
ALTER TABLE fund_usage_logs 
ADD CONSTRAINT fund_usage_logs_amount_min 
CHECK (amount >= 1);
```

### Compatibility
- **MySQL 8.0.16+**: Full support
- **MySQL 5.7**: CHECK constraints ignored (relies on backend validation)
- **PostgreSQL**: Full support
- **SQLite**: Full support

### Rollback
```bash
php artisan migrate:rollback --step=1
```

---

## Related Validations

This change complements existing validations:

1. ✅ **Donation Amount**: Must be >= ₱1
2. ✅ **Fund Usage Amount**: Must be >= ₱1 (NEW)
3. ✅ **Refund Amount**: Based on original donation
4. ✅ **Campaign Goal**: Must be > 0

---

## Security Considerations

### Prevents
- Accidental ₱0 entries
- Invalid financial records
- Data integrity issues
- Misleading transparency reports

### Does Not Prevent
- Legitimate small expenses (₱1 - ₱10)
- Multiple small entries that sum to larger amounts
- Editing existing valid entries

---

## Future Enhancements (Optional)

1. **Bulk Import Validation**: Ensure CSV imports also validate minimum amount
2. **Audit Log**: Track attempts to create invalid fund logs
3. **Analytics**: Report on fund usage patterns and categories
4. **Warnings**: Alert if many small (₱1-₱5) entries are created

---

## Summary

✅ **Backend**: FundUsageController validates `min:1`
✅ **Database**: CHECK constraint enforces `amount >= 1`
✅ **Frontend**: Form validation with clear error messages
✅ **Consistency**: Aligns with donation validation rules
✅ **Documentation**: Complete deployment and testing guide

Charities can no longer log ₱0 fund usage. All fund logs must be at least ₱1, ensuring meaningful and accurate financial transparency.
