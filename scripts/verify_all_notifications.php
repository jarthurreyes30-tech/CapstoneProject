<?php

require __DIR__ . '/../capstone_backend/vendor/autoload.php';

$app = require_once __DIR__ . '/../capstone_backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Notification;

echo "=== Notification System Verification ===\n\n";

// Check by role
$roles = ['admin', 'donor', 'charity'];
foreach ($roles as $role) {
    echo strtoupper($role) . " USERS:\n";
    $users = User::where('role', $role)->get();
    
    foreach ($users as $user) {
        $count = Notification::where('user_id', $user->id)->count();
        $unread = Notification::where('user_id', $user->id)->where('read', false)->count();
        
        if ($count > 0) {
            echo "  {$user->name} ({$user->email})\n";
            echo "    Total: {$count} | Unread: {$unread}\n";
            
            // Show types
            $types = Notification::where('user_id', $user->id)
                ->select('type', \DB::raw('count(*) as count'))
                ->groupBy('type')
                ->get();
            
            echo "    Types: ";
            $typeList = [];
            foreach ($types as $type) {
                $typeList[] = "{$type->type}({$type->count})";
            }
            echo implode(', ', $typeList) . "\n\n";
        }
    }
}

// Overall stats
echo "\n=== OVERALL STATISTICS ===\n";
echo "Total Notifications: " . Notification::count() . "\n";
echo "Unread: " . Notification::where('read', false)->count() . "\n";
echo "Read: " . Notification::where('read', true)->count() . "\n\n";

echo "By Type:\n";
$allTypes = Notification::select('type', \DB::raw('count(*) as count'))
    ->groupBy('type')
    ->orderBy('count', 'desc')
    ->get();

foreach ($allTypes as $type) {
    echo "  {$type->type}: {$type->count}\n";
}

echo "\n=== Verification Complete ===\n";
