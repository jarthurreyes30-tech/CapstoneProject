<?php
/**
 * Quick script to identify which user you're logged in as
 * Usage: Pass the auth token as argument
 * Example: php who_am_i.php "your-token-here"
 */

if ($argc < 2) {
    echo "Usage: php who_am_i.php <auth-token>\n";
    echo "\nTo get your token:\n";
    echo "1. Open browser DevTools (F12)\n";
    echo "2. Go to Console tab\n";
    echo "3. Type: localStorage.getItem('auth_token')\n";
    echo "4. Copy the token and run: php who_am_i.php \"YOUR_TOKEN\"\n";
    exit(1);
}

require __DIR__ . '/../capstone_backend/vendor/autoload.php';

$app = require_once __DIR__ . '/../capstone_backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$token = $argv[1];

// Parse the token (simple base64 decode of JWT payload)
$parts = explode('.', $token);
if (count($parts) !== 3) {
    echo "Invalid token format\n";
    exit(1);
}

$payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1])), true);

if (!$payload || !isset($payload['sub'])) {
    echo "Could not parse token\n";
    exit(1);
}

$userId = $payload['sub'];

// Get user info
$user = \App\Models\User::find($userId);

if (!$user) {
    echo "User not found\n";
    exit(1);
}

echo "=== YOU ARE LOGGED IN AS ===\n\n";
echo "User ID: {$user->id}\n";
echo "Name: {$user->name}\n";
echo "Email: {$user->email}\n";
echo "Role: {$user->role}\n";
echo "\n";

if ($user->role === 'charity_admin') {
    $charity = \App\Models\Charity::where('owner_id', $user->id)->first();
    
    if ($charity) {
        echo "Charity: {$charity->name}\n";
        echo "Charity ID: {$charity->id}\n";
        echo "Verification Status: {$charity->verification_status}\n";
        echo "\n";
        
        $campaigns = \App\Models\Campaign::where('charity_id', $charity->id)->get();
        echo "Total Campaigns: {$campaigns->count()}\n";
        
        if ($campaigns->count() > 0) {
            echo "\nYour Campaigns:\n";
            foreach ($campaigns as $campaign) {
                echo "  - [{$campaign->status}] {$campaign->title}\n";
            }
        } else {
            echo "\n⚠️  You have no campaigns yet. Click 'Create Campaign' to get started!\n";
        }
    } else {
        echo "⚠️  WARNING: You don't own a charity!\n";
        echo "This is why you see 0 campaigns.\n";
        echo "\nSolution: Contact admin to create a charity for your account.\n";
    }
} else {
    echo "Role: {$user->role}\n";
    echo "(Not a charity admin)\n";
}

echo "\n";
