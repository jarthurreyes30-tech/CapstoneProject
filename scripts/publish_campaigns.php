<?php
require __DIR__ . '/../capstone_backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../capstone_backend/bootstrap/app.php';
$app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap();

use App\Models\Campaign;
use Illuminate\Support\Facades\DB;

echo "=== Publishing Campaigns ===\n\n";

// Get all closed campaigns
$campaigns = Campaign::where('status', 'closed')->get();

if ($campaigns->isEmpty()) {
    echo "No closed campaigns found to publish.\n";
    exit(0);
}

echo "Found " . $campaigns->count() . " closed campaigns. Publishing them...\n\n";

DB::beginTransaction();
try {
    foreach ($campaigns as $campaign) {
        $campaign->update(['status' => 'published']);
        echo "✓ Published: {$campaign->title} (ID: {$campaign->id})\n";
    }
    
    DB::commit();
    echo "\nSuccessfully published " . $campaigns->count() . " campaigns.\n";
    
    // Verify
    $publishedCount = Campaign::where('status', 'published')->count();
    echo "Total published campaigns now: {$publishedCount}\n";
    
} catch (\Throwable $e) {
    DB::rollBack();
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
