<?php

require __DIR__ . '/../capstone_backend/vendor/autoload.php';

$app = require_once __DIR__ . '/../capstone_backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$charities = \App\Models\Charity::select('id', 'name', 'owner_id')->get();

echo "Total charities: " . $charities->count() . "\n\n";

foreach ($charities as $charity) {
    echo "ID: {$charity->id}\n";
    echo "Name: {$charity->name}\n";
    echo "Owner ID: {$charity->owner_id}\n";
    
    $campaigns = \App\Models\Campaign::where('charity_id', $charity->id)->get();
    echo "Campaigns: " . $campaigns->count() . "\n";
    foreach ($campaigns as $campaign) {
        echo "  - [{$campaign->status}] {$campaign->title}\n";
    }
    echo "---\n";
}
