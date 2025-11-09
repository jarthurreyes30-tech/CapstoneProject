<?php

require __DIR__ . '/../capstone_backend/vendor/autoload.php';

$app = require_once __DIR__ . '/../capstone_backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Checking Actual API Response Format ===\n\n";

$userId = 6; // Robin
$charity = \App\Models\Charity::where('owner_id', $userId)->first();

if (!$charity) {
    echo "No charity found\n";
    exit(1);
}

// This is what the controller returns
$paginatedCampaigns = $charity->campaigns()->latest()->paginate(12);

// Convert to array (this is what gets sent as JSON)
$responseArray = $paginatedCampaigns->toArray();

echo "Response Keys:\n";
foreach (array_keys($responseArray) as $key) {
    echo "  - $key\n";
}

echo "\nFirst Campaign Data Keys:\n";
if (!empty($responseArray['data'][0])) {
    foreach (array_keys($responseArray['data'][0]) as $key) {
        echo "  - $key\n";
    }
    
    echo "\nFirst Campaign Full Data:\n";
    echo json_encode($responseArray['data'][0], JSON_PRETTY_PRINT);
}

echo "\n\nChecking if 'description' field is included:\n";
if (isset($responseArray['data'][0]['description'])) {
    echo "✓ YES - description is included\n";
    echo "  Value: " . substr($responseArray['data'][0]['description'], 0, 100) . "...\n";
} else {
    echo "✗ NO - description is NOT included\n";
    echo "  This might cause issues in the frontend!\n";
}
