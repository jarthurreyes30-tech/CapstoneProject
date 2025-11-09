<?php

require __DIR__ . '/../capstone_backend/vendor/autoload.php';

$app = require_once __DIR__ . '/../capstone_backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Charity Campaigns Diagnosis ===\n\n";

// Get all users with charity_admin role
$charityAdmins = \App\Models\User::where('role', 'charity_admin')->get();

echo "Total Charity Admins: " . $charityAdmins->count() . "\n\n";

foreach ($charityAdmins as $admin) {
    echo "User ID: {$admin->id}\n";
    echo "Name: {$admin->name}\n";
    echo "Email: {$admin->email}\n";
    
    // Find charity owned by this user
    $charity = \App\Models\Charity::where('owner_id', $admin->id)->first();
    
    if ($charity) {
        echo "Charity: {$charity->name} (ID: {$charity->id})\n";
        
        // Get campaigns for this charity
        $campaigns = \App\Models\Campaign::where('charity_id', $charity->id)->get();
        echo "Total Campaigns: {$campaigns->count()}\n";
        
        if ($campaigns->count() > 0) {
            foreach ($campaigns as $campaign) {
                echo "  - [{$campaign->status}] {$campaign->title}\n";
            }
        } else {
            echo "  (No campaigns)\n";
        }
    } else {
        echo "Charity: NONE (This user doesn't own a charity!)\n";
    }
    
    echo "---\n\n";
}

echo "\n=== Summary ===\n";
echo "If you're logged in as a charity admin and see 0 campaigns:\n";
echo "1. Check which user you're logged in as\n";
echo "2. Verify that user owns a charity\n";
echo "3. Check if that charity has any campaigns\n";
