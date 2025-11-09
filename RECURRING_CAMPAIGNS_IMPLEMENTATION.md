# Recurring Campaigns Implementation Guide

## Overview
This document describes the complete implementation of the recurring campaigns feature, which allows campaigns to automatically create new instances at regular intervals (e.g., monthly feeding programs, quarterly medical missions, annual back-to-school drives).

## Database Schema

### New Fields Added to `campaigns` Table

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `is_recurring` | boolean | Whether the campaign repeats | `true` / `false` |
| `recurrence_type` | enum | How often it repeats | `weekly`, `monthly`, `quarterly`, `yearly` |
| `recurrence_interval` | integer | Number of units between repeats | `1` (every month), `2` (every 2 months) |
| `recurrence_start_date` | date | When the first campaign starts | `2025-11-01` |
| `recurrence_end_date` | date | When recurrence stops (optional) | `2026-11-01` |
| `next_occurrence_date` | date | Date when next campaign auto-activates | `2025-12-01` |
| `auto_publish` | boolean | Automatically publish new occurrences | `true` / `false` |
| `parent_campaign_id` | foreign key | Reference to original recurring campaign | Campaign ID |
| `occurrence_number` | integer | Which occurrence this is (1st, 2nd, etc.) | `1`, `2`, `3` |

## Backend Implementation

### 1. Migration
**File:** `database/migrations/2025_10_31_add_recurring_fields_to_campaigns.php`

Run the migration:
```bash
php artisan migrate
```

### 2. Campaign Model Updates
**File:** `app/Models/Campaign.php`

**New Relationships:**
- `parentCampaign()` - Belongs to parent campaign
- `childCampaigns()` - Has many child occurrences

**New Scopes:**
- `recurring()` - Get only recurring campaigns
- `parentCampaigns()` - Get only parent campaigns
- `childCampaigns()` - Get only child occurrences
- `dueForRecurrence()` - Get campaigns ready to create new occurrences

### 3. Controller Updates
**File:** `app/Http/Controllers/CampaignController.php`

**Validation Rules Added:**
- `is_recurring` - boolean
- `recurrence_type` - required if recurring, must be: weekly, monthly, quarterly, yearly
- `recurrence_interval` - integer between 1-12
- `recurrence_start_date` - required if recurring
- `recurrence_end_date` - optional, must be after start date
- `auto_publish` - boolean

**Logic:**
- Automatically calculates `next_occurrence_date` based on recurrence settings
- Validates recurring campaign configuration
- Updates next occurrence when settings change

### 4. Console Command
**File:** `app/Console/Commands/ProcessRecurringCampaigns.php`

**Command:** `php artisan campaigns:process-recurring`

**Scheduled:** Runs daily at midnight (configured in `routes/console.php`)

**Functionality:**
- Finds campaigns due for recurrence
- Creates new campaign occurrences with:
  - Copied data from parent campaign
  - New occurrence number
  - Calculated start/end dates
  - Link to parent campaign
  - Same donation channels
- Updates parent campaign's `next_occurrence_date`
- Stops recurring if end date reached

## Frontend Implementation

### 1. Create Campaign Modal
**File:** `src/components/charity/CreateCampaignModal.tsx`

**New UI Section:**
- Appears when "Recurring" donation type is selected
- Checkbox to enable recurring campaign
- Recurrence pattern selector (weekly, monthly, quarterly, yearly)
- Interval input (repeat every X units)
- First occurrence date picker
- Optional end date picker
- Auto-publish toggle

### 2. Edit Campaign Modal
**File:** `src/components/charity/EditCampaignModal.tsx`

**Features:**
- Loads existing recurring settings
- Allows modification of recurrence configuration
- Recalculates next occurrence when settings change

## Usage Examples

### Example 1: Monthly Feeding Program
```
Title: "Monthly Community Feeding Program"
Donation Type: Recurring
Is Recurring: ✓ Enabled
Recurrence Type: Monthly
Interval: 1 (every 1 month)
First Occurrence: 2025-11-01
End Date: 2026-11-01 (or leave empty for indefinite)
Auto Publish: ✓ Enabled
```

**Result:** Creates a new feeding program campaign on the 1st of each month for one year.

### Example 2: Quarterly Medical Mission
```
Title: "Quarterly Medical Mission"
Donation Type: Recurring
Is Recurring: ✓ Enabled
Recurrence Type: Quarterly
Interval: 1 (every quarter)
First Occurrence: 2025-12-01
End Date: (empty - runs indefinitely)
Auto Publish: ✓ Enabled
```

**Result:** Creates a new medical mission campaign every 3 months starting December 1st.

### Example 3: Bi-Weekly Food Distribution
```
Title: "Bi-Weekly Food Distribution"
Donation Type: Recurring
Is Recurring: ✓ Enabled
Recurrence Type: Weekly
Interval: 2 (every 2 weeks)
First Occurrence: 2025-11-05
End Date: 2026-05-05
Auto Publish: ✓ Enabled
```

**Result:** Creates a new food distribution campaign every 2 weeks for 6 months.

## How It Works

### Campaign Creation Flow
1. Charity creates campaign with "Recurring" donation type
2. Enables recurring settings and configures pattern
3. System calculates `next_occurrence_date`
4. Campaign is saved with recurring configuration

### Automatic Processing Flow
1. Daily cron job runs `campaigns:process-recurring` command
2. System finds campaigns where `next_occurrence_date <= today`
3. For each due campaign:
   - Creates new campaign instance with occurrence number
   - Copies all data from parent (title, description, location, etc.)
   - Sets new start/end dates based on recurrence pattern
   - Links to parent via `parent_campaign_id`
   - Copies donation channels
   - Auto-publishes if `auto_publish = true`
4. Updates parent's `next_occurrence_date` to next interval
5. Stops if `recurrence_end_date` is reached

### Child Campaign Naming
Child campaigns are automatically named with occurrence number:
- Original: "Monthly Feeding Program"
- 1st occurrence: "Monthly Feeding Program (Occurrence #1)"
- 2nd occurrence: "Monthly Feeding Program (Occurrence #2)"

## Testing the Feature

### Manual Testing Steps

1. **Create a Recurring Campaign:**
   ```bash
   # Navigate to Charity Dashboard → Campaign Management
   # Click "Create Campaign"
   # Select "Recurring" as Donation Type
   # Enable recurring settings
   # Set recurrence pattern (e.g., monthly)
   # Set first occurrence date to tomorrow
   # Save campaign
   ```

2. **Verify Database:**
   ```sql
   SELECT id, title, is_recurring, recurrence_type, 
          next_occurrence_date, parent_campaign_id, occurrence_number
   FROM campaigns 
   WHERE is_recurring = 1 OR parent_campaign_id IS NOT NULL;
   ```

3. **Test Manual Processing:**
   ```bash
   # Set next_occurrence_date to today or past
   php artisan campaigns:process-recurring
   
   # Check if new occurrence was created
   ```

4. **Verify Child Campaign:**
   - Check that new campaign was created
   - Verify it has correct occurrence number
   - Confirm it's linked to parent
   - Check that donation channels were copied

### Automated Testing
```bash
# Run tests (if test suite exists)
php artisan test --filter RecurringCampaign
```

## Troubleshooting

### Issue: New occurrences not being created
**Solution:**
- Check if cron job is running: `php artisan schedule:list`
- Manually run: `php artisan campaigns:process-recurring`
- Verify `next_occurrence_date` is set and in the past
- Check logs: `storage/logs/laravel.log`

### Issue: Wrong dates on child campaigns
**Solution:**
- Verify recurrence_type and recurrence_interval are correct
- Check timezone settings in `config/app.php`
- Review `calculateNextOccurrence()` method logic

### Issue: Donation channels not copied
**Solution:**
- Verify parent campaign has donation channels attached
- Check `campaign_donation_channel` pivot table
- Review `createNewOccurrence()` method in console command

## API Endpoints

### Get Campaign with Recurring Info
```
GET /api/campaigns/{id}
```

**Response includes:**
```json
{
  "id": 1,
  "title": "Monthly Feeding Program",
  "is_recurring": true,
  "recurrence_type": "monthly",
  "recurrence_interval": 1,
  "recurrence_start_date": "2025-11-01",
  "recurrence_end_date": "2026-11-01",
  "next_occurrence_date": "2025-12-01",
  "auto_publish": true,
  "parent_campaign_id": null,
  "occurrence_number": null
}
```

### Get Child Campaigns
```
GET /api/campaigns?parent_campaign_id={id}
```

## Maintenance

### Monitoring
- Check daily logs for processing errors
- Monitor database for orphaned child campaigns
- Review campaigns with null `next_occurrence_date` (stopped recurring)

### Cleanup
```sql
-- Find campaigns that have ended recurring
SELECT * FROM campaigns 
WHERE is_recurring = 1 
AND next_occurrence_date IS NULL;

-- Find all occurrences of a parent campaign
SELECT * FROM campaigns 
WHERE parent_campaign_id = {parent_id}
ORDER BY occurrence_number;
```

## Future Enhancements

1. **Custom Recurrence Rules:** Allow specific days (e.g., "every first Monday")
2. **Pause/Resume:** Ability to temporarily pause recurring campaigns
3. **Occurrence Limit:** Set maximum number of occurrences instead of end date
4. **Email Notifications:** Notify charity when new occurrence is created
5. **Dashboard Widget:** Show upcoming occurrences in charity dashboard
6. **Analytics:** Track performance across all occurrences of a recurring campaign

## Files Modified

### Backend
- `database/migrations/2025_10_31_add_recurring_fields_to_campaigns.php` (NEW)
- `app/Models/Campaign.php` (MODIFIED)
- `app/Http/Controllers/CampaignController.php` (MODIFIED)
- `app/Console/Commands/ProcessRecurringCampaigns.php` (NEW)
- `routes/console.php` (MODIFIED)

### Frontend
- `src/components/charity/CreateCampaignModal.tsx` (MODIFIED)
- `src/components/charity/EditCampaignModal.tsx` (MODIFIED)

## Summary

The recurring campaigns feature is now fully implemented with:
✅ Database schema with all required fields
✅ Backend validation and logic
✅ Automatic processing via scheduled command
✅ User-friendly frontend interface
✅ Support for weekly, monthly, quarterly, and yearly recurrence
✅ Flexible configuration with intervals and end dates
✅ Auto-publish option for new occurrences
✅ Parent-child relationship tracking

The system is production-ready and will automatically create new campaign occurrences based on the configured schedule.
