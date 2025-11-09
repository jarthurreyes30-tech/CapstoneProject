# 📧 Email System Setup Guide - CharityConnect

## Quick Start

Your email system is now fully implemented! Follow these steps to configure SMTP and start sending emails.

---

## 🔧 Step 1: Get Gmail App Password

1. **Go to Google Account Settings**
   - Visit: https://myaccount.google.com/security

2. **Enable 2-Step Verification** (if not already enabled)
   - Required for app passwords

3. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Click "Generate"
   - Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

---

## 📝 Step 2: Update .env File

Open `capstone_backend\.env` and update these lines:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password-here
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="no-reply@charityconnect.com"
MAIL_FROM_NAME="CharityConnect"
```

**Example:**
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=myproject@gmail.com
MAIL_PASSWORD=abcd efgh ijkl mnop
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="no-reply@charityconnect.com"
MAIL_FROM_NAME="CharityConnect"
```

---

## 🚀 Step 3: Test Your Configuration

### Option A: Use the Admin Panel (Recommended)
1. Navigate to: http://localhost:8080/admin/test-email
2. Enter your email address
3. Click "Send Test Email"
4. Check your inbox (and spam folder)

### Option B: Use API Directly
```powershell
curl -X POST http://127.0.0.1:8000/api/test-email `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"your-email@gmail.com\",\"name\":\"Test User\"}'
```

### Option C: Test Connection First
```powershell
curl http://127.0.0.1:8000/api/email/test-connection
```

---

## ✅ Verify It's Working

1. **Check Backend Logs**
   - Open: `capstone_backend\storage\logs\laravel.log`
   - Look for: "Test email sent successfully"

2. **Check Your Email**
   - Subject: "CharityConnect - Test Email"
   - Should have proper HTML formatting
   - Check spam folder if not in inbox

3. **Test Connection**
   - Should return: `{"success": true, "message": "SMTP connection successful"}`

---

## 🎨 Available Email Templates

Your system now has these beautiful email templates ready:

1. **test-email.blade.php** - Test email confirmation
2. **verification.blade.php** - User email verification
3. **donation-confirmation.blade.php** - Donation receipts
4. **password-reset.blade.php** - Password reset links
5. **charity-verification-status.blade.php** - Charity approval/rejection
6. **campaign-approval.blade.php** - Campaign status updates
7. **welcome.blade.php** - Welcome emails for new users
8. **security-alert.blade.php** - Security notifications

---

## 🔌 API Endpoints

### Public Endpoints
- `POST /api/test-email` - Send test email
  ```json
  {
    "email": "test@example.com",
    "name": "Test User"
  }
  ```

- `GET /api/email/test-connection` - Test SMTP connection

### Admin Endpoints (Requires Authentication)
- `GET /admin/email/stats` - Get email statistics
- `POST /admin/email/test` - Send test email (admin)
- `POST /admin/email/send-verification` - Manually send verification
- `POST /admin/email/send-password-reset` - Manually send password reset

---

## 🐛 Troubleshooting

### "Connection refused" or "Connection timeout"
- **Check firewall**: Allow outbound connections on port 587
- **Check antivirus**: May block SMTP connections
- **Try port 465**: Change `MAIL_PORT=465` and `MAIL_ENCRYPTION=ssl`

### "Authentication failed"
- **Wrong app password**: Regenerate and copy carefully (no spaces)
- **2FA not enabled**: App passwords require 2-step verification
- **Check username**: Must be full email address

### "Email not received"
1. **Check spam folder**: Gmail may flag test emails
2. **Check logs**: Look in `storage/logs/laravel.log`
3. **Wait a moment**: Can take 1-2 minutes
4. **Try different recipient**: Some email providers are strict

### "SMTP error: Could not authenticate"
```env
# Try these settings:
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=ssl
```

---

## 🔐 Security Best Practices

1. **Never commit .env file** - Already in .gitignore
2. **Use app passwords** - Never use your actual Gmail password
3. **Rotate passwords** - Change app password every 3-6 months
4. **Monitor logs** - Check for suspicious activity
5. **Rate limiting** - Laravel throttles email sending automatically

---

## 📊 Frontend Admin Panel

Access the email testing interface at:
**http://localhost:8080/admin/test-email**

Features:
- ✅ Send test emails
- ✅ Validate email addresses
- ✅ Real-time status updates
- ✅ Error handling and display
- ✅ Admin-only access (secured)

---

## 🎯 Integration Examples

### In Your Registration Controller
```php
use App\Services\EmailService;

public function register(Request $request, EmailService $emailService)
{
    // Create user
    $user = User::create([...]);
    
    // Send welcome email
    $emailService->sendWelcomeEmail($user);
    
    // Send verification email
    $token = Str::random(64);
    $emailService->sendVerificationEmail($user, $token);
}
```

### In Your Donation Controller
```php
public function store(Request $request, EmailService $emailService)
{
    $donation = Donation::create([...]);
    
    // Send confirmation
    $emailService->sendDonationConfirmationEmail($donation);
}
```

---

## 📈 Next Steps

1. ✅ Configure SMTP credentials
2. ✅ Test email sending
3. ✅ Integrate into registration flow
4. ✅ Integrate into donation flow
5. ✅ Set up email queue for high volume (optional)
6. ✅ Monitor email logs
7. ✅ Configure custom email templates (optional)

---

## 🆘 Need Help?

- **Backend logs**: `capstone_backend\storage\logs\laravel.log`
- **Test connection**: http://127.0.0.1:8000/api/email/test-connection
- **Admin panel**: http://localhost:8080/admin/test-email

---

## ✨ Success Checklist

- [ ] Gmail app password generated
- [ ] .env file updated with SMTP credentials
- [ ] Backend server restarted
- [ ] Test email sent successfully
- [ ] Email received in inbox
- [ ] Templates rendering correctly
- [ ] Admin panel accessible
- [ ] Ready for production integration!

**🎉 Congratulations! Your email system is fully operational!**
