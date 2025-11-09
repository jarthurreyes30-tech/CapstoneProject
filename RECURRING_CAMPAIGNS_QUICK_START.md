# Recurring Campaigns - Quick Start Guide

## What is a Recurring Campaign?

A recurring campaign automatically creates new campaign instances at regular intervals without manual intervention.

**Examples:**
- 📅 Monthly feeding program
- 🏥 Quarterly medical mission  
- 🎒 Annual back-to-school drive
- 🌱 Weekly environmental cleanup

## How to Create a Recurring Campaign

### Step 1: Create Campaign
1. Go to **Charity Dashboard** → **Campaign Management**
2. Click **"Create Campaign"** button
3. Fill in basic campaign details (title, description, target amount, etc.)

### Step 2: Select Recurring Type
1. In the **"Donation Type"** dropdown, select **"Recurring"**
2. A new section will appear: **"Recurring Campaign Settings"**

### Step 3: Configure Recurrence
1. ✅ Check **"Enable Recurring Campaign"**
2. Select **Recurrence Pattern:**
   - **Weekly** - Repeats every week(s)
   - **Monthly** - Repeats every month(s)
   - **Quarterly** - Repeats every 3 months
   - **Yearly** - Repeats every year(s)

3. Set **Repeat Every:** (optional)
   - Default is `1` (every single interval)
   - Set to `2` for every 2 weeks/months/etc.
   - Maximum is `12`

4. Set **First Occurrence Date:**
   - The date when the first campaign instance will be created
   - Can be today or in the future

5. Set **Stop Recurring After:** (optional)
   - Leave empty for indefinite recurrence
   - Set a date to automatically stop creating new occurrences

6. ✅ Check **"Automatically publish new occurrences"** (recommended)
   - New campaigns will be published automatically
   - Uncheck if you want to manually review each occurrence

### Step 4: Save
Click **"Create Campaign"** to save your recurring campaign.

## What Happens Next?

### Automatic Processing
- Every day at midnight, the system checks for campaigns due for recurrence
- When `next_occurrence_date` arrives, a new campaign is automatically created
- The new campaign inherits all settings from the parent campaign
- Donation channels are automatically copied
- The system calculates the next occurrence date

### Child Campaign Naming
New occurrences are named with occurrence numbers:
- Original: "Monthly Feeding Program"
- 1st: "Monthly Feeding Program (Occurrence #1)"
- 2nd: "Monthly Feeding Program (Occurrence #2)"

## Managing Recurring Campaigns

### View All Occurrences
In Campaign Management, you'll see:
- **Parent Campaign** - The original recurring campaign
- **Child Campaigns** - Each occurrence with occurrence number

### Edit Recurring Settings
1. Click **Edit** on the parent campaign
2. Modify recurrence settings as needed
3. Changes apply to future occurrences (not existing ones)

### Stop Recurring
To stop a recurring campaign:
1. Edit the parent campaign
2. Uncheck **"Enable Recurring Campaign"**, OR
3. Set **"Stop Recurring After"** to today's date

### Delete Recurring Campaign
Deleting a parent campaign will also delete all child occurrences.

## Examples

### Example 1: Monthly Feeding Program
```
✅ Enable Recurring Campaign
Recurrence Pattern: Monthly
Repeat Every: 1
First Occurrence: November 1, 2025
Stop After: November 1, 2026
✅ Auto-publish
```
**Result:** Creates 12 monthly campaigns from Nov 2025 to Oct 2026

### Example 2: Quarterly Medical Mission
```
✅ Enable Recurring Campaign
Recurrence Pattern: Quarterly
Repeat Every: 1
First Occurrence: December 1, 2025
Stop After: (empty - indefinite)
✅ Auto-publish
```
**Result:** Creates a new campaign every 3 months, indefinitely

### Example 3: Bi-Weekly Food Distribution
```
✅ Enable Recurring Campaign
Recurrence Pattern: Weekly
Repeat Every: 2
First Occurrence: November 5, 2025
Stop After: May 5, 2026
✅ Auto-publish
```
**Result:** Creates a campaign every 2 weeks for 6 months

## Testing Your Recurring Campaign

### Manual Test (For Developers)
```bash
# Run the processing command manually
php artisan campaigns:process-recurring

# Check the output to see if occurrences were created
```

### Verify in Database
```sql
-- View parent campaign
SELECT * FROM campaigns WHERE is_recurring = 1;

-- View all child occurrences
SELECT * FROM campaigns WHERE parent_campaign_id IS NOT NULL;
```

## Troubleshooting

### ❌ New occurrences not being created
**Check:**
- Is the first occurrence date in the past?
- Is the campaign enabled and published?
- Is the recurrence end date in the future?
- Run manually: `php artisan campaigns:process-recurring`

### ❌ Wrong dates on child campaigns
**Check:**
- Verify recurrence pattern and interval are correct
- Check server timezone settings

### ❌ Child campaigns not published
**Check:**
- Is "Auto-publish" enabled?
- Manually publish child campaigns if needed

## Tips & Best Practices

### ✅ DO:
- Use descriptive titles that indicate the recurring nature
- Set realistic recurrence patterns based on your capacity
- Enable auto-publish for consistent campaign presence
- Set an end date if the program is time-limited
- Monitor the first few occurrences to ensure correct setup

### ❌ DON'T:
- Create too frequent recurrences (e.g., daily) unless necessary
- Forget to set donation channels on parent campaign
- Delete parent campaign if you want to keep child occurrences
- Set first occurrence date too far in the future for testing

## Need Help?

### Check Logs
```bash
# View Laravel logs
tail -f storage/logs/laravel.log
```

### Contact Support
If you encounter issues, provide:
- Campaign ID
- Recurrence settings
- Expected vs actual behavior
- Error messages from logs

## Advanced Features

### Custom Intervals
- Weekly: Every 1-12 weeks
- Monthly: Every 1-12 months
- Quarterly: Every 1-4 quarters (3, 6, 9, or 12 months)
- Yearly: Every 1-12 years

### Occurrence Tracking
Each child campaign stores:
- `parent_campaign_id` - Link to parent
- `occurrence_number` - Sequential number (1, 2, 3...)
- All parent campaign data (title, description, location, etc.)

### Analytics Across Occurrences
View combined statistics for all occurrences of a recurring campaign by filtering child campaigns by `parent_campaign_id`.

---

**Last Updated:** October 31, 2025  
**Version:** 1.0  
**Status:** ✅ Production Ready
