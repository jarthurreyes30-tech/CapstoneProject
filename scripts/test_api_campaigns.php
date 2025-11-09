<?php
require __DIR__ . '/../capstone_backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../capstone_backend/bootstrap/app.php';
$app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap();

use App\Models\Charity;
use App\Models\Campaign;

echo "=== Testing Campaign API Responses ===\n\n";

// Test 1: Get all charities
$charities = Charity::all();
echo "1. GET /api/charities\n";
echo "   Total charities: " . $charities->count() . "\n\n";

// Test 2: For each charity, get published campaigns
foreach ($charities as $charity) {
    $campaigns = Campaign::where('charity_id', $charity->id)
        ->where('status', 'published')
        ->get();
    
    echo "2. GET /api/charities/{$charity->id}/campaigns?status=published\n";
    echo "   Charity: {$charity->name}\n";
    echo "   Published campaigns: " . $campaigns->count() . "\n";
    
    if ($campaigns->count() > 0) {
        foreach ($campaigns as $c) {
            echo "     - {$c->title} (ID: {$c->id}, Status: {$c->status})\n";
        }
    }
    echo "\n";
}

// Test 3: Verify what donor dashboard suggestions would get
echo "3. Donor Dashboard Suggestions (first 3 published campaigns)\n";
$suggested = Campaign::where('status', 'published')
    ->with('charity:id,name,logo_path')
    ->latest()
    ->take(3)
    ->get();

echo "   Found: " . $suggested->count() . " campaigns\n";
foreach ($suggested as $c) {
    echo "     - {$c->title} (Charity: " . ($c->charity ? $c->charity->name : 'N/A') . ")\n";
}
