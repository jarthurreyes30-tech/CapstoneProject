<?php
require __DIR__ . '/../capstone_backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../capstone_backend/bootstrap/app.php';
$app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap();

use App\Models\Campaign;
use App\Models\Charity;

echo "=== Checking Campaigns Status ===\n\n";

$campaigns = Campaign::with('charity:id,name')->orderBy('id', 'desc')->take(20)->get();

echo "Total campaigns in DB: " . Campaign::count() . "\n";
echo "Published campaigns: " . Campaign::where('status', 'published')->count() . "\n\n";

foreach ($campaigns as $c) {
    echo "Campaign #{$c->id}: {$c->title}\n";
    echo "  Charity: " . ($c->charity ? $c->charity->name : 'N/A') . " (ID: {$c->charity_id})\n";
    echo "  Status: {$c->status}\n";
    echo "  Cover Image: " . ($c->cover_image_path ?? 'NULL') . "\n";
    echo "  Target: ₱" . number_format($c->target_amount ?? 0) . "\n";
    echo "  Current: ₱" . number_format($c->current_amount ?? 0) . "\n";
    echo "  Deadline: " . ($c->deadline_at ?? 'NULL') . "\n";
    echo "\n";
}

echo "\n=== Charities with Published Campaigns ===\n\n";
$charities = Charity::whereHas('campaigns', function($q) {
    $q->where('status', 'published');
})->with(['campaigns' => function($q) {
    $q->where('status', 'published');
}])->get();

foreach ($charities as $charity) {
    echo "Charity #{$charity->id}: {$charity->name}\n";
    echo "  Published campaigns: " . $charity->campaigns->count() . "\n";
    foreach ($charity->campaigns as $c) {
        echo "    - {$c->title} (ID: {$c->id})\n";
    }
    echo "\n";
}
