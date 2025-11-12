# Database Seeders Documentation

## Overview
All important seeders are now included in `DatabaseSeeder.php` and will run automatically when you execute `php artisan db:seed`.

## Included Seeders (Run in Order)

### 1. **CategorySeeder** ✅
- **Purpose**: Creates charity/campaign categories
- **Creates**: 10 categories (Education, Health, Environment, Disaster Relief, etc.)
- **Why included**: Essential for categorizing charities and campaigns
- **Order**: First - needed by other seeders

### 2. **UsersSeeder** ✅
- **Purpose**: Creates basic user accounts
- **Creates**: Admin, charity, and donor user accounts
- **Why included**: Foundation for all user-related data
- **Order**: Second - required for charity and donor data

### 3. **DemoDataSeeder** ✅
- **Purpose**: Creates demo accounts and initial charity
- **Creates**: 
  - System admin (admin@example.com)
  - Demo donor (donor@example.com)
  - Charity admin (charityadmin@example.com)
  - HopeWorks Foundation charity
  - GCash donation channel
  - "School Kits 2025" campaign
- **Why included**: Basic demo data for testing
- **Order**: Third - builds on users

### 4. **TestDataSeeder** ✅
- **Purpose**: Creates comprehensive test data
- **Creates**:
  - 5 test donors
  - 5 test charities
  - Multiple campaigns per charity
  - 20 test donations with various statuses
- **Why included**: Provides realistic test scenarios
- **Order**: Fourth - creates bulk test data

### 5. **CharityPostSeeder** ✅
- **Purpose**: Creates posts/updates for charities
- **Creates**: 3-5 sample posts per charity
- **Why included**: Populates charity newsfeed/updates
- **Order**: Fifth - requires charities to exist
- **Note**: Only creates posts for existing charities

### 6. **CampaignUpdateSeeder** ✅
- **Purpose**: Creates updates for campaigns
- **Creates**: Campaign progress updates and announcements
- **Why included**: Shows campaign activity and progress
- **Order**: Sixth - requires campaigns to exist

### 7. **AnalyticsDemoSeeder** ✅
- **Purpose**: Creates demo data for analytics
- **Creates**:
  - 10 demo donors
  - Demo charities
  - Diverse campaigns
  - Realistic donations with various patterns
- **Why included**: Provides data for analytics dashboards
- **Order**: Seventh - creates analytics-focused data

### 8. **DonorMilestoneSeeder** ✅
- **Purpose**: Creates donor milestone achievements
- **Creates**: Milestone records for donors
- **Why included**: Shows donor achievements and gamification
- **Order**: Eighth - requires donors and donations

### 9. **ActivityLogSeeder** ✅
- **Purpose**: Creates activity logs
- **Creates**: Historical activity records
- **Why included**: Provides audit trail and activity history
- **Order**: Ninth - logs actions from previous seeders

### 10. **FundUsageSeeder** ✅
- **Purpose**: Creates fund usage records
- **Creates**: Records of how campaign funds are used
- **Why included**: Shows transparency in fund allocation
- **Order**: Last - requires campaigns with donations

## Excluded Seeders (Not Run Automatically)

### **ClearDataSeeder** ❌
- **Purpose**: Utility to clear all seeded data
- **Why excluded**: Destructive operation - run manually when needed
- **Manual usage**: `php artisan db:seed --class=ClearDataSeeder`

### **HugsAndKissesCampaignsSeeder** ❌
- **Purpose**: Creates specific campaigns for "Hugs and Kisses" charity
- **Why excluded**: Optional/specific use case
- **Manual usage**: `php artisan db:seed --class=HugsAndKissesCampaignsSeeder`

### **PopulateExistingCampaignSeeder** ❌
- **Purpose**: Utility to populate data for a specific campaign
- **Why excluded**: Utility seeder for specific scenarios
- **Manual usage**: `php artisan db:seed --class=PopulateExistingCampaignSeeder`

## Running Seeders

### Run All Seeders
```bash
php artisan db:seed
```

### Run Fresh Migration + Seed
```bash
php artisan migrate:fresh --seed
```

### Run Specific Seeder
```bash
php artisan db:seed --class=CategorySeeder
```

### Clear Data Then Reseed
```bash
php artisan db:seed --class=ClearDataSeeder
php artisan db:seed
```

## Test Credentials Created

### Admin Account
- **Email**: admin@example.com
- **Password**: password
- **Role**: admin

### Demo Donor
- **Email**: donor@example.com
- **Password**: password
- **Role**: donor

### Charity Admin
- **Email**: charityadmin@example.com
- **Password**: password
- **Role**: charity_admin
- **Charity**: HopeWorks Foundation

### Test Donors (Created by TestDataSeeder)
- **Emails**: testdonor1@charityhub.com through testdonor5@charityhub.com
- **Password**: password
- **Role**: donor

### Test Charities (Created by TestDataSeeder)
- **Emails**: testcharity1@charityhub.com through testcharity5@charityhub.com
- **Password**: password
- **Role**: charity_admin

### Analytics Demo Donors (Created by AnalyticsDemoSeeder)
- **Emails**: donor1@demo.com through donor10@demo.com
- **Password**: password
- **Role**: donor

## Seeder Dependencies

```
CategorySeeder (no dependencies)
    ↓
UsersSeeder (no dependencies)
    ↓
DemoDataSeeder (needs Users)
    ↓
TestDataSeeder (needs Users, Categories)
    ↓
CharityPostSeeder (needs Charities)
    ↓
CampaignUpdateSeeder (needs Campaigns)
    ↓
AnalyticsDemoSeeder (needs Users, Categories)
    ↓
DonorMilestoneSeeder (needs Donors, Donations)
    ↓
ActivityLogSeeder (needs all previous data)
    ↓
FundUsageSeeder (needs Campaigns, Donations)
```

## Expected Data After Seeding

- **Users**: ~20+ (admins, donors, charity admins)
- **Charities**: ~15+ (demo + test + analytics)
- **Categories**: 10
- **Campaigns**: ~30+ (multiple per charity)
- **Donations**: ~30+ (various statuses)
- **Posts/Updates**: ~50+ (charity posts + campaign updates)
- **Activity Logs**: Varies
- **Fund Usage Records**: Varies
- **Donor Milestones**: Varies based on donations

## Notes

- All seeders use `firstOrCreate` or similar to avoid duplicates
- Running `db:seed` multiple times is safe (won't duplicate data)
- For a completely fresh start, use `migrate:fresh --seed`
- All test passwords are "password" for easy testing
- TestDataSeeder includes cleanup logic to remove old test data first

## Troubleshooting

### "No charities found" Warning
- Run `UsersSeeder` and `DemoDataSeeder` first
- Or run the full `db:seed` which includes them

### Duplicate Entry Errors
- Most seeders handle duplicates gracefully
- If issues persist, run `ClearDataSeeder` first

### Foreign Key Constraint Errors
- Ensure seeders run in the correct order (as specified in DatabaseSeeder)
- Check that parent records exist before creating child records

---

**Last Updated**: November 12, 2024
**Database Seeder Version**: Complete with all essential seeders
