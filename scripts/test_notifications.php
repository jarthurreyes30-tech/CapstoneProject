<?php

require __DIR__ . '/../capstone_backend/vendor/autoload.php';

$app = require_once __DIR__ . '/../capstone_backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Notification;

echo "=== Testing Notifications ===\n\n";

// Get a donor user
$donor = User::where('role', 'donor')->first();
if (!$donor) {
    echo "✗ No donor found\n";
    exit(1);
}

echo "✓ Testing with user: {$donor->name} ({$donor->email})\n";
echo "  User ID: {$donor->id}\n\n";

// Check notifications for this user
$notifications = Notification::where('user_id', $donor->id)->get();
echo "Total notifications for this user: " . $notifications->count() . "\n\n";

if ($notifications->count() > 0) {
    echo "Sample notifications:\n";
    foreach ($notifications->take(5) as $notification) {
        echo "  - [{$notification->type}] {$notification->title}\n";
        echo "    Message: {$notification->message}\n";
        echo "    Read: " . ($notification->read ? 'Yes' : 'No') . "\n";
        echo "    Created: {$notification->created_at}\n\n";
    }
} else {
    echo "✗ No notifications found for this user\n";
}

// Check total notifications in database
$total = Notification::count();
echo "\nTotal notifications in database: {$total}\n";

// Check notifications by type
echo "\nNotifications by type:\n";
$types = Notification::select('type', \DB::raw('count(*) as count'))
    ->groupBy('type')
    ->get();
foreach ($types as $type) {
    echo "  - {$type->type}: {$type->count}\n";
}

echo "\n=== Test Complete ===\n";
