<?php

require __DIR__ . '/../capstone_backend/vendor/autoload.php';

$app = require_once __DIR__ . '/../capstone_backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$campaigns = \App\Models\Campaign::select('id', 'title', 'status', 'charity_id')->get();

echo "Total campaigns: " . $campaigns->count() . "\n\n";

foreach ($campaigns as $campaign) {
    echo "ID: {$campaign->id}\n";
    echo "Title: {$campaign->title}\n";
    echo "Status: {$campaign->status}\n";
    echo "Charity ID: {$campaign->charity_id}\n";
    echo "---\n";
}
