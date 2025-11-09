<?php

require __DIR__ . '/../capstone_backend/vendor/autoload.php';

$app = require_once __DIR__ . '/../capstone_backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Notification;

echo "=== Checking Admin Notifications ===\n\n";

// Get admin users
$admins = User::where('role', 'admin')->get();
echo "Admin users found: " . $admins->count() . "\n\n";

foreach ($admins as $admin) {
    echo "Admin: {$admin->name} ({$admin->email})\n";
    echo "  ID: {$admin->id}\n";
    
    $notifications = Notification::where('user_id', $admin->id)->get();
    echo "  Notifications: " . $notifications->count() . "\n";
    
    if ($notifications->count() > 0) {
        echo "  Types:\n";
        foreach ($notifications->groupBy('type') as $type => $notifs) {
            echo "    - {$type}: " . $notifs->count() . "\n";
        }
    }
    echo "\n";
}

// Check all notification types in database
echo "\nAll notification types in database:\n";
$types = Notification::select('type', \DB::raw('count(*) as count'))
    ->groupBy('type')
    ->orderBy('count', 'desc')
    ->get();
foreach ($types as $type) {
    echo "  - {$type->type}: {$type->count}\n";
}

echo "\n=== Complete ===\n";
