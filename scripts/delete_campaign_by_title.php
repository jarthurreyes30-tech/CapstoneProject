<?php
require __DIR__ . '/../capstone_backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../capstone_backend/bootstrap/app.php';
$app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap();

use App\Models\Campaign;
use Illuminate\Support\Facades\DB;

$title = $argv[1] ?? null;
if (!$title) {
    fwrite(STDERR, "Usage: php delete_campaign_by_title.php \"Campaign Title\"\n");
    exit(1);
}

$ids = Campaign::where('title', $title)->pluck('id');
if ($ids->isEmpty()) {
    echo "No campaigns found with title: {$title}\n";
    exit(0);
}

echo "Deleting campaigns with title '{$title}': " . $ids->implode(', ') . "\n";

DB::beginTransaction();
try {
    // Dependent tables (adjust if your schema differs)
    DB::table('campaign_updates')->whereIn('campaign_id', $ids)->delete();
    DB::table('campaign_donation_channel')->whereIn('campaign_id', $ids)->delete();
    DB::table('donations')->whereIn('campaign_id', $ids)->delete();
    DB::table('campaign_comments')->whereIn('campaign_id', $ids)->delete();
    DB::table('fund_usage_logs')->whereIn('campaign_id', $ids)->delete();
    DB::table('volunteers')->whereIn('campaign_id', $ids)->delete();

    DB::table('campaigns')->whereIn('id', $ids)->delete();

    DB::commit();
    echo "Deleted successfully.\n";
    exit(0);
} catch (Throwable $e) {
    DB::rollBack();
    fwrite(STDERR, "Error: " . $e->getMessage() . "\n");
    exit(1);
}
