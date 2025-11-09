<?php
/**
 * Test script to simulate what the /charity/campaigns endpoint returns for Robin (User 6)
 */

require __DIR__ . '/../capstone_backend/vendor/autoload.php';

$app = require_once __DIR__ . '/../capstone_backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Testing Charity Campaigns for Robin (User 6) ===\n\n";

// Simulate what the myCampaigns() controller method does
$userId = 6; // Robin's user ID

// Get the charity owned by this user
$charity = \App\Models\Charity::where('owner_id', $userId)->first();

if (!$charity) {
    echo "ERROR: No charity found for user $userId\n";
    exit(1);
}

echo "Charity Found:\n";
echo "  ID: {$charity->id}\n";
echo "  Name: {$charity->name}\n";
echo "  Owner ID: {$charity->owner_id}\n\n";

// Get campaigns (this is what the API returns)
$campaigns = $charity->campaigns()->latest()->get();

echo "Total Campaigns: {$campaigns->count()}\n\n";

if ($campaigns->isEmpty()) {
    echo "No campaigns found!\n";
} else {
    echo "Campaigns:\n";
    foreach ($campaigns as $campaign) {
        echo "\nCampaign ID: {$campaign->id}\n";
        echo "  Title: {$campaign->title}\n";
        echo "  Status: {$campaign->status}\n";
        echo "  Target: ₱" . number_format($campaign->target_amount, 2) . "\n";
        echo "  Current: ₱" . number_format($campaign->current_amount, 2) . "\n";
        echo "  Donors: {$campaign->donors_count}\n";
        echo "  Start: {$campaign->start_date}\n";
        echo "  End: {$campaign->end_date}\n";
        echo "  Cover Image: " . ($campaign->cover_image_path ?? 'null') . "\n";
        echo "  Created: {$campaign->created_at}\n";
    }
}

echo "\n=== Testing Complete ===\n\n";

// Now let's test the actual paginated response format
echo "=== Simulating API Response Format ===\n\n";
$paginatedCampaigns = $charity->campaigns()->latest()->paginate(12);

echo "API Response Structure:\n";
echo "{\n";
echo "  'data': [...{$paginatedCampaigns->count()} campaigns...],\n";
echo "  'current_page': {$paginatedCampaigns->currentPage()},\n";
echo "  'last_page': {$paginatedCampaigns->lastPage()},\n";
echo "  'total': {$paginatedCampaigns->total()},\n";
echo "  'per_page': {$paginatedCampaigns->perPage()}\n";
echo "}\n\n";

// Show the actual data array
echo "data[0] (First Campaign):\n";
if ($paginatedCampaigns->isNotEmpty()) {
    $first = $paginatedCampaigns[0];
    echo json_encode([
        'id' => $first->id,
        'title' => $first->title,
        'status' => $first->status,
        'target_amount' => $first->target_amount,
        'current_amount' => $first->current_amount,
        'donors_count' => $first->donors_count,
        'cover_image_path' => $first->cover_image_path,
        'start_date' => $first->start_date?->format('Y-m-d'),
        'end_date' => $first->end_date?->format('Y-m-d'),
    ], JSON_PRETTY_PRINT);
}
