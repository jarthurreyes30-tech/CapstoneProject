# Deployment Instructions for Donation System Enhancements

## Overview
This guide provides step-by-step instructions to deploy the donation validation and system enhancements.

---

## Prerequisites
- Backend server running PHP 8.x with Laravel
- Frontend server running Node.js
- Database access (MySQL/PostgreSQL)
- Terminal/Command Prompt access

---

## Step 1: Backend Deployment

### 1.1 Navigate to Backend Directory
```bash
cd capstone_backend
```

### 1.2 Run Database Migration
```bash
php artisan migrate
```

This will create the new fields in the `refund_requests` table:
- `message` (text, nullable)
- `proof_path` (string, nullable)

### 1.3 Verify Migration
```bash
php artisan migrate:status
```

Look for:
- `2025_11_06_000001_add_message_and_proof_to_refund_requests` - Should show "Ran"

### 1.4 Clear Cache (Optional but Recommended)
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

### 1.5 Create Storage Link (If Not Already Done)
```bash
php artisan storage:link
```

This ensures uploaded refund proofs are accessible.

---

## Step 2: Frontend Deployment

### 2.1 Navigate to Frontend Directory
```bash
cd capstone_frontend
```

### 2.2 Install Dependencies (If Needed)
```bash
npm install
```

### 2.3 Build for Production
```bash
npm run build
```

### 2.4 Start Development Server (For Testing)
```bash
npm run dev
```

Or deploy the `dist` folder to your production server.

---

## Step 3: Verification Tests

### 3.1 Test Donation Validation

1. Navigate to donation page as a donor
2. Try to enter ₱0 as donation amount
   - ✅ Should show error: "Donation amount must be greater than ₱0"
3. Try to enter ₱0.50
   - ✅ Should show error: "Donation amount must be at least ₱1"
4. Enter ₱100
   - ✅ Should proceed successfully

### 3.2 Test Refund Request Enhancement

1. Go to Donation History page
2. Click on a completed donation
3. Click "Request Refund"
4. Verify the dialog shows:
   - ✅ Reason field (required)
   - ✅ Additional Message field (optional)
   - ✅ Supporting Document upload (optional)
5. Upload an image
   - ✅ Preview should display
6. Submit the form
   - ✅ Should show success message
7. Check database:
   ```sql
   SELECT * FROM refund_requests ORDER BY created_at DESC LIMIT 1;
   ```
   - ✅ Should have `message` and `proof_path` populated

### 3.3 Test Currency Display

1. Check various pages:
   - Donor Dashboard
   - Donation History
   - Charity Analytics
   - Admin Fund Tracking
2. Verify all amounts show ₱ (peso sign), not $ (dollar sign)

### 3.4 Test Fund Tracking Popups

1. Login as admin
2. Navigate to Fund Tracking page
3. Click "Total Donations" card
   - ✅ Dialog should open with computation details
4. Click "Total Disbursements" card
   - ✅ Dialog should open with computation details
5. Click "Net Flow" card
   - ✅ Dialog should open with detailed breakdown

---

## Step 4: Database Verification

### 4.1 Check Refund Requests Table Structure
```sql
DESCRIBE refund_requests;
```

Should include:
- `message` (text, nullable)
- `proof_path` (varchar, nullable)

### 4.2 Check Donations Table
```sql
DESCRIBE donations;
```

Verify `amount` field is `decimal(12,2)`

---

## Step 5: File Permissions (Linux/Mac)

If deploying on Linux/Mac, ensure proper permissions:

```bash
# Backend storage permissions
cd capstone_backend
chmod -R 775 storage
chmod -R 775 bootstrap/cache

# Ensure web server can write to storage
chown -R www-data:www-data storage
chown -R www-data:www-data bootstrap/cache
```

---

## Step 6: Environment Variables

Verify your `.env` file has proper storage configuration:

```env
# Backend .env
FILESYSTEM_DISK=public
APP_URL=http://your-domain.com

# Frontend .env
VITE_API_URL=http://your-domain.com/api
```

---

## Troubleshooting

### Issue: Migration Fails

**Error**: "Table 'refund_requests' doesn't exist"

**Solution**:
```bash
php artisan migrate:fresh --seed
```
⚠️ Warning: This will reset all data. Use only in development.

---

### Issue: File Upload Fails

**Error**: "Failed to store file"

**Solution**:
1. Check storage link exists:
   ```bash
   ls -la public/storage
   ```
2. If not, create it:
   ```bash
   php artisan storage:link
   ```
3. Check permissions:
   ```bash
   chmod -R 775 storage
   ```

---

### Issue: Frontend Build Fails

**Error**: "Module not found"

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

### Issue: Validation Not Working

**Error**: Can still submit ₱0 donation

**Solution**:
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Check browser console for errors
4. Verify API endpoint is correct in frontend

---

## Rollback Plan

If issues occur, you can rollback the migration:

```bash
cd capstone_backend
php artisan migrate:rollback --step=1
```

This will remove the `message` and `proof_path` fields from `refund_requests` table.

---

## Production Checklist

Before deploying to production:

- [ ] Backup database
- [ ] Test all features in staging environment
- [ ] Verify file upload size limits in server config
- [ ] Check storage disk space
- [ ] Test with different user roles (donor, charity, admin)
- [ ] Verify email notifications work (if enabled)
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile devices
- [ ] Monitor error logs after deployment
- [ ] Prepare rollback plan

---

## Monitoring

After deployment, monitor:

1. **Error Logs**:
   ```bash
   tail -f storage/logs/laravel.log
   ```

2. **Database**:
   ```sql
   -- Check refund requests
   SELECT COUNT(*) FROM refund_requests WHERE message IS NOT NULL;
   SELECT COUNT(*) FROM refund_requests WHERE proof_path IS NOT NULL;
   
   -- Check donations
   SELECT MIN(amount), MAX(amount), AVG(amount) FROM donations;
   ```

3. **Storage Usage**:
   ```bash
   du -sh storage/app/public/refund_proofs
   ```

---

## Support

If you encounter issues:

1. Check Laravel logs: `storage/logs/laravel.log`
2. Check browser console for frontend errors
3. Verify database migrations ran successfully
4. Check file permissions
5. Review the DONATION_VALIDATION_AND_ENHANCEMENTS.md document

---

## Summary

✅ **Backend**: Migration adds refund request fields
✅ **Frontend**: Enhanced forms and validation
✅ **Database**: New fields for refund requests
✅ **Testing**: Comprehensive test scenarios provided
✅ **Documentation**: Complete deployment guide

All changes are backward compatible and non-breaking. Existing functionality remains intact.

---

**Deployment Time Estimate**: 15-30 minutes
**Risk Level**: Low (additive changes only)
**Rollback Time**: < 5 minutes
