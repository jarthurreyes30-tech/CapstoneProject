# 📧 Donation Email System Configuration Guide

## 🎯 Email Configuration for CharityHub

### Step 1: Update `.env` File

Open `capstone_backend/.env` and update the following email configuration:

```env
# Email Configuration for CharityHub
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=charityhub25@gmail.com
MAIL_PASSWORD=your_gmail_app_password_here
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="charityhub25@gmail.com"
MAIL_FROM_NAME="CharityHub"

# Frontend URL (for email links)
APP_FRONTEND_URL=http://localhost:8080
```

### Step 2: Get Gmail App Password

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification** (enable if not already)
3. Go to **App Passwords**: https://myaccount.google.com/apppasswords
4. Select **Mail** as the app and **Other (Custom name)** as the device
5. Enter "CharityHub" as the custom name
6. Click **Generate**
7. Copy the 16-character password and paste it in `.env` as `MAIL_PASSWORD`

### Step 3: Update Laravel Config (if needed)

Open `config/mail.php` and ensure the `from` address uses the env variables:

```php
'from' => [
    'address' => env('MAIL_FROM_ADDRESS', 'charityhub25@gmail.com'),
    'name' => env('MAIL_FROM_NAME', 'CharityHub'),
],
```

### Step 4: Restart Backend Server

```bash
# Stop current server (Ctrl+C)
cd capstone_backend
php artisan config:clear
php artisan cache:clear
php artisan serve
```

### Step 5: Set Up Queue Worker (Important!)

Since emails are queued for better performance, you need to run the queue worker:

```bash
# In a new terminal window
cd capstone_backend
php artisan queue:work
```

**Keep this terminal open while testing emails!**

---

## 📨 Email Types Implemented

### 1. **Donation Confirmation Email** ✅
- **Trigger:** After successful donation
- **Recipient:** Donor
- **Subject:** "Thank you for your donation to [Campaign]!"
- **Content:** 
  - Donation details (amount, campaign, transaction ID)
  - Receipt number
  - Link to donation history

### 2. **New Donation Alert Email** ✅
- **Trigger:** After successful donation
- **Recipient:** Charity Admin
- **Subject:** "New Donation Received — [Donor] just donated!"
- **Content:**
  - Donor information
  - Donation amount and campaign
  - Link to charity dashboard

### 3. **Recurring Donation Update Email** 🔄
- **Trigger:** When donor pauses/resumes/cancels recurring donation
- **Recipient:** Donor
- **Subject:** "Your recurring donation has been [Status]"
- **Content:**
  - Current status
  - Next billing date (if resumed)
  - Link to manage recurring donations

### 4. **Refund Request Email** 💳
- **Trigger:** When refund/dispute is submitted
- **Recipients:** Both Donor and Charity Admin
- **Subject:** "Refund/Dispute Request for [Campaign]"
- **Content:**
  - Refund reason
  - Donation details
  - Next steps information

### 5. **Annual Donation Statement** 📊
- **Trigger:** When donor requests annual summary
- **Recipient:** Donor
- **Subject:** "Your [Year] Annual Donation Statement"
- **Content:**
  - Total amount donated
  - Number of campaigns supported
  - PDF summary attached

### 6. **Donation History Export** 📥
- **Trigger:** When donor exports donation records
- **Recipient:** Donor
- **Subject:** "Your Donation Export is Ready"
- **Content:**
  - Export type (CSV/PDF)
  - Record count
  - File attached

---

## 🧪 Testing the Email System

### Test 1: Quick Email Test

Run the test script to verify configuration:

```powershell
.\test-donation-emails.ps1
```

### Test 2: Create a Test Donation

```bash
# Using PowerShell or terminal
$body = @{
    charity_id = 1
    campaign_id = 1
    amount = 100
    is_anonymous = false
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/donations" `
    -Method POST `
    -Body $body `
    -ContentType "application/json" `
    -Headers @{
        Authorization = "Bearer YOUR_TOKEN_HERE"
    }
```

### Test 3: Check Queue Jobs

```bash
# See pending jobs
php artisan queue:monitor

# Process jobs manually (if queue worker not running)
php artisan queue:work --once
```

### Test 4: Check Email Logs

```bash
# View Laravel logs
tail -f storage/logs/laravel.log

# Search for email-related logs
grep -i "email" storage/logs/laravel.log
```

---

## 📊 Email Flow Diagram

```
Donation Created
    ↓
DonationController::store()
    ↓
sendDonationEmails()
    ├── Queue DonationConfirmationMail → Donor
    └── Queue NewDonationAlertMail → Charity Admin
    ↓
Queue Worker Processes Jobs
    ↓
Emails Sent via SMTP (Gmail)
    ↓
Recipients Receive Emails
```

---

## 🔧 Troubleshooting

### Issue: Emails not sending

**Solution:**
1. Check if queue worker is running
2. Verify SMTP credentials in `.env`
3. Check `storage/logs/laravel.log` for errors
4. Test SMTP connection:
   ```bash
   php artisan tinker
   Mail::raw('Test email', function($msg) {
       $msg->to('your-email@example.com')->subject('Test');
   });
   ```

### Issue: Queue jobs stuck

**Solution:**
```bash
# Clear failed jobs
php artisan queue:flush

# Restart queue worker
php artisan queue:restart
```

### Issue: Gmail blocking sign-in

**Solution:**
1. Use App Password instead of regular password
2. Enable "Less secure app access" (not recommended)
3. Check Gmail security settings

### Issue: Emails going to spam

**Solution:**
1. Add CharityHub to recipient's contacts
2. Check email content for spam triggers
3. Consider using a proper email service (SendGrid, Mailgun)

---

## 📝 Email Template Customization

All email templates are located in:
```
capstone_backend/resources/views/emails/donations/
```

Templates use the base layout from:
```
capstone_backend/resources/views/emails/layout.blade.php
```

To customize:
1. Edit the Blade template files
2. Keep consistent branding
3. Test changes by sending test emails

---

## 🚀 Production Deployment

### Before Going Live:

1. **Update Email Credentials**
   - Use a dedicated email service (SendGrid, AWS SES, Mailgun)
   - Set up proper SPF, DKIM, and DMARC records

2. **Queue Configuration**
   - Use Redis or database for queue driver
   - Set up supervisor to keep queue worker running

3. **Rate Limiting**
   - Configure email rate limits
   - Add throttling for email endpoints

4. **Monitoring**
   - Set up failed job alerts
   - Monitor email delivery rates
   - Track bounce and complaint rates

5. **Backup**
   - Keep email logs for audit trail
   - Archive sent emails if required

---

## 📧 Email Service Recommendations

### For Production:

1. **SendGrid** (Recommended)
   - Free tier: 100 emails/day
   - Easy Laravel integration
   - Great deliverability

2. **AWS SES**
   - Very affordable
   - High deliverability
   - Requires AWS account

3. **Mailgun**
   - Developer-friendly
   - Good documentation
   - Reliable service

### Configuration Example (SendGrid):

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=your_sendgrid_api_key
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="charityhub25@gmail.com"
MAIL_FROM_NAME="CharityHub"
```

---

## ✅ Final Checklist

- [ ] `.env` file updated with Gmail credentials
- [ ] App password generated and added
- [ ] Backend server restarted
- [ ] Queue worker running
- [ ] Test email sent successfully
- [ ] Donation confirmation email received
- [ ] Charity alert email received
- [ ] All email templates rendering correctly
- [ ] Email links working properly
- [ ] Logs showing successful email dispatch

---

## 📞 Support

If you encounter any issues:
1. Check `storage/logs/laravel.log`
2. Verify queue worker is running
3. Test SMTP connection manually
4. Review Gmail security settings

**Current Email:** charityhub25@gmail.com  
**Status:** ✅ Ready for Testing

---

*Last Updated: November 2, 2025*
