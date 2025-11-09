<?php

require __DIR__ . '/../capstone_backend/vendor/autoload.php';

$app = require_once __DIR__ . '/../capstone_backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Charity;
use App\Models\Notification;

echo "=== Checking Charity Owners ===\n\n";

$charities = Charity::with('owner')->get();

foreach ($charities as $charity) {
    echo "Charity: {$charity->name}\n";
    echo "  ID: {$charity->id}\n";
    
    if ($charity->owner) {
        echo "  Owner: {$charity->owner->name} ({$charity->owner->email})\n";
        echo "  Owner ID: {$charity->owner->id}\n";
        echo "  Owner Role: {$charity->owner->role}\n";
        
        $notifications = Notification::where('user_id', $charity->owner->id)->count();
        echo "  Notifications: {$notifications}\n";
    } else {
        echo "  Owner: NONE\n";
    }
    echo "\n";
}

echo "=== Complete ===\n";
