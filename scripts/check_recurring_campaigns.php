<?php
// Check and fix existing recurring campaigns
// Run with: php artisan tinker < scripts/check_recurring_campaigns.php

use App\Models\Campaign;

echo "\n=== Checking Existing Recurring Campaigns ===\n\n";

// Check for campaigns with issues
$issueCount = Campaign::where('donation_type', 'recurring')
    ->where(function($q) {
        $q->whereNull('recurrence_interval')
          ->orWhereNull('recurrence_type');
    })
    ->count();

echo "Campaigns with null recurrence fields: $issueCount\n";

if ($issueCount > 0) {
    echo "\nFixing campaigns...\n";
    
    $fixed = Campaign::where('donation_type', 'recurring')
        ->where(function($q) {
            $q->whereNull('recurrence_interval')
              ->orWhereNull('recurrence_type');
        })
        ->update([
            'recurrence_interval' => DB::raw('COALESCE(recurrence_interval, 1)'),
            'recurrence_type' => DB::raw("COALESCE(recurrence_type, 'monthly')"),
            'is_recurring' => true,
            'auto_publish' => DB::raw('COALESCE(auto_publish, true)')
        ]);
    
    echo "Fixed $fixed campaigns\n";
}

// Show all recurring campaigns
echo "\n=== All Recurring Campaigns ===\n";
$campaigns = Campaign::where('donation_type', 'recurring')
    ->select('id', 'title', 'is_recurring', 'recurrence_type', 'recurrence_interval', 'recurrence_start_date')
    ->get();

foreach ($campaigns as $campaign) {
    echo sprintf(
        "ID: %d | Title: %s | Recurring: %s | Type: %s | Interval: %s | Start: %s\n",
        $campaign->id,
        substr($campaign->title, 0, 40),
        $campaign->is_recurring ? 'Yes' : 'No',
        $campaign->recurrence_type ?? 'NULL',
        $campaign->recurrence_interval ?? 'NULL',
        $campaign->recurrence_start_date ?? 'NULL'
    );
}

echo "\n=== Check Complete ===\n\n";
