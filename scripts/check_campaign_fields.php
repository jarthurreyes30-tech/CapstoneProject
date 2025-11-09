<?php

require __DIR__ . '/../capstone_backend/vendor/autoload.php';

$app = require_once __DIR__ . '/../capstone_backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Checking Campaign Fields ===\n\n";

$campaign = \App\Models\Campaign::first();

if (!$campaign) {
    echo "No campaigns found\n";
    exit(1);
}

echo "Campaign ID: {$campaign->id}\n";
echo "Title: {$campaign->title}\n\n";

echo "Available Fields:\n";
$attributes = $campaign->getAttributes();
foreach ($attributes as $key => $value) {
    $displayValue = is_string($value) && strlen($value) > 50 
        ? substr($value, 0, 50) . '...' 
        : $value;
    echo "  - $key: " . var_export($displayValue, true) . "\n";
}

echo "\n";
echo "Appended Attributes (accessors):\n";
$appends = $campaign->getAppends();
foreach ($appends as $append) {
    try {
        $value = $campaign->$append;
        echo "  - $append: " . var_export($value, true) . "\n";
    } catch (Exception $e) {
        echo "  - $append: ERROR - " . $e->getMessage() . "\n";
    }
}
