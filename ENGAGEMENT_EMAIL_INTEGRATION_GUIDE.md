# 🔌 Quick Integration Guide: Engagement Emails

## 📋 TL;DR - Copy & Paste Integration

This guide shows you exactly where and how to integrate the engagement email events into your existing CharityHub controllers.

---

## 1️⃣ Charity Update Notification

**When:** Charity creates a new campaign  
**Where:** `CampaignController@store`

```php
// At the top of CampaignController.php
use App\Events\CampaignCreated;

// In the store method, after campaign is created:
public function store(Request $request)
{
    // ... validation code ...
    
    $campaign = Campaign::create($validated);
    
    // 🔔 Dispatch event to notify followers
    event(new CampaignCreated($campaign));
    
    return response()->json($campaign, 201);
}
```

---

## 2️⃣ Campaign Progress Notification

**When:** Campaign reaches 50%, 80%, or 100% funding  
**Where:** `DonationController` after donation approval

**Step 1:** Add milestone fields to campaigns table (if not exists)
```sql
ALTER TABLE campaigns 
ADD COLUMN milestone_50_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN milestone_80_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN milestone_100_sent BOOLEAN DEFAULT FALSE;
```

**Step 2:** Add to DonationController
```php
// At the top
use App\Events\CampaignProgressUpdated;

// After donation is approved (in confirm method or similar)
private function checkCampaignProgress($donation)
{
    $campaign = $donation->campaign;
    if (!$campaign) return;
    
    // Recalculate current amount
    $campaign->refresh();
    $totalRaised = $campaign->donations()
        ->where('status', 'completed')
        ->sum('amount');
    
    $campaign->update(['current_amount' => $totalRaised]);
    
    // Calculate percentage
    $percentage = ($totalRaised / $campaign->target_amount) * 100;
    
    // Check milestones
    if ($percentage >= 50 && !$campaign->milestone_50_sent) {
        event(new CampaignProgressUpdated($campaign, round($percentage), 50));
        $campaign->update(['milestone_50_sent' => true]);
    }
    
    if ($percentage >= 80 && !$campaign->milestone_80_sent) {
        event(new CampaignProgressUpdated($campaign, round($percentage), 80));
        $campaign->update(['milestone_80_sent' => true]);
    }
    
    if ($percentage >= 100 && !$campaign->milestone_100_sent) {
        event(new CampaignProgressUpdated($campaign, round($percentage), 100));
        $campaign->update(['milestone_100_sent' => true]);
    }
}

// Call this method after confirming donation
public function confirm(Request $request, Donation $donation)
{
    // ... existing confirmation code ...
    
    $donation->update(['status' => 'completed']);
    
    // 🔔 Check and notify progress
    $this->checkCampaignProgress($donation);
    
    return response()->json($donation);
}
```

---

## 3️⃣ Support Ticket Acknowledgment

**When:** User submits a support ticket  
**Where:** `SupportController@store` (create if doesn't exist)

```php
<?php

namespace App\Http\Controllers;

use App\Events\SupportTicketCreated;
use Illuminate\Http\Request;

class SupportController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:2000',
            'priority' => 'nullable|in:low,medium,high',
        ]);
        
        // Create ticket (adjust based on your model)
        $ticket = (object)[
            'id' => rand(1000, 9999), // Replace with actual DB insert
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'user_id' => $request->user()->id,
            'status' => 'open',
            'created_at' => now(),
        ];
        
        // 🔔 Send acknowledgment email
        event(new SupportTicketCreated($ticket, $request->user()));
        
        return response()->json([
            'success' => true,
            'message' => '✅ Support request submitted! Confirmation email sent.',
            'ticket' => $ticket
        ], 201);
    }
}
```

**Add route:**
```php
// In routes/api.php
Route::middleware(['auth:sanctum'])->group(function(){
    Route::post('/support/tickets', [SupportController::class, 'store']);
});
```

---

## 4️⃣ New Message Notification

**When:** User sends a message  
**Where:** `MessageController@store` (create if doesn't exist)

```php
<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\User;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'recipient_id' => 'required|exists:users,id',
            'message' => 'required|string|max:1000',
        ]);
        
        $sender = $request->user();
        $recipient = User::findOrFail($validated['recipient_id']);
        
        // Create message (adjust based on your model)
        // Assume you have a Message model
        
        $messagePreview = substr($validated['message'], 0, 100);
        
        // 🔔 Notify recipient
        event(new MessageSent(
            $sender,
            $recipient,
            $validated['message'],
            $messagePreview
        ));
        
        return response()->json([
            'success' => true,
            'message' => 'Message sent! Recipient will be notified via email.',
        ], 201);
    }
}
```

**Add route:**
```php
// In routes/api.php
Route::middleware(['auth:sanctum'])->group(function(){
    Route::post('/messages', [MessageController::class, 'store']);
});
```

---

## 5️⃣ Campaign Reminder (Scheduled)

**When:** Daily at 9:00 AM  
**Where:** Schedule configuration

**Laravel 10+ (routes/console.php):**
```php
<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('campaigns:send-reminders')
    ->dailyAt('09:00')
    ->timezone('Asia/Manila');
```

**Laravel 9 and below (app/Console/Kernel.php):**
```php
protected function schedule(Schedule $schedule)
{
    $schedule->command('campaigns:send-reminders')
        ->dailyAt('09:00')
        ->timezone('Asia/Manila');
}
```

**Test manually:**
```bash
php artisan campaigns:send-reminders
```

**Set up cron (production):**
```bash
* * * * * cd /path/to/charityhub && php artisan schedule:run >> /dev/null 2>&1
```

---

## 📊 Database Requirements

### Saved Campaigns Table

If you don't have a saved_campaigns table, create one:

```sql
CREATE TABLE saved_campaigns (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    campaign_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    UNIQUE KEY unique_save (user_id, campaign_id)
);
```

**Or use Laravel migration:**
```bash
php artisan make:migration create_saved_campaigns_table
```

```php
public function up()
{
    Schema::create('saved_campaigns', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->foreignId('campaign_id')->constrained()->onDelete('cascade');
        $table->timestamps();
        
        $table->unique(['user_id', 'campaign_id']);
    });
}
```

### Campaign Milestone Fields

Add to existing campaigns table:

```bash
php artisan make:migration add_milestone_fields_to_campaigns_table
```

```php
public function up()
{
    Schema::table('campaigns', function (Blueprint $table) {
        $table->boolean('milestone_50_sent')->default(false);
        $table->boolean('milestone_80_sent')->default(false);
        $table->boolean('milestone_100_sent')->default(false);
    });
}
```

---

## 🧪 Quick Test Checklist

### 1. Test Charity Update
```bash
php artisan tinker
$campaign = \App\Models\Campaign::first();
event(new \App\Events\CampaignCreated($campaign));
```
✅ Check email received by charity followers

### 2. Test Campaign Progress
```bash
php artisan tinker
$campaign = \App\Models\Campaign::first();
event(new \App\Events\CampaignProgressUpdated($campaign, 75, 50));
```
✅ Check email received by campaign donors

### 3. Test Support Ticket
```bash
php artisan tinker
$user = \App\Models\User::first();
$ticket = ['id' => 123, 'subject' => 'Test', 'message' => 'Test message'];
event(new \App\Events\SupportTicketCreated((object)$ticket, $user));
```
✅ Check email received by ticket submitter

### 4. Test Message Notification
```bash
php artisan tinker
$sender = \App\Models\User::find(1);
$recipient = \App\Models\User::find(2);
event(new \App\Events\MessageSent($sender, $recipient, 'Test message'));
```
✅ Check email received by message recipient

### 5. Test Campaign Reminder
```bash
php artisan campaigns:send-reminders
```
✅ Check logs for queued emails

---

## 🚀 Production Checklist

Before deploying to production:

- [ ] Run migrations for saved_campaigns and milestone fields
- [ ] Add event dispatching to CampaignController
- [ ] Add progress checking to DonationController
- [ ] Create SupportController if needed
- [ ] Create MessageController if needed
- [ ] Schedule campaign reminders job
- [ ] Start queue worker
- [ ] Test each email type manually
- [ ] Monitor logs for errors
- [ ] Verify email delivery rates

---

## 🔧 Troubleshooting

### Emails not sending?
```bash
# 1. Check queue worker is running
php artisan queue:work

# 2. Check logs
tail -f storage/logs/laravel.log | grep -i email

# 3. Test SMTP
php artisan tinker
Mail::raw('Test', fn($m) => $m->to('your@email.com')->subject('Test'));
```

### Duplicate emails?
- Ensure milestone flags are being set correctly
- Check that events aren't dispatched multiple times
- Add transaction wrapping around flag updates

### Scheduled job not running?
```bash
# Test manually
php artisan campaigns:send-reminders

# Check schedule
php artisan schedule:list

# Run schedule worker (dev)
php artisan schedule:work
```

---

## 📞 Need Help?

**Documentation:**
- `ENGAGEMENT_EMAIL_DOCUMENTATION.md` - Full system documentation
- `test-engagement-emails.ps1` - Automated test script

**Log Location:**
- `storage/logs/laravel.log`

**Common Issues:**
1. Queue worker not running
2. Events not registered
3. Database tables missing
4. SMTP credentials incorrect

---

**Quick Start:** Copy the code snippets above into your controllers, run migrations, start the queue worker, and test each email type!

*Last Updated: November 2, 2025*
