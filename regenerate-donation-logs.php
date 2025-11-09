<?php
/**
 * Regenerate Activity Logs for Donations
 * 
 * This script creates individual activity log entries for each donation
 * that doesn't have one yet. Run this to fix historical donations.
 * 
 * Usage: php regenerate-donation-logs.php
 */

require __DIR__ . '/capstone_backend/vendor/autoload.php';

$app = require_once __DIR__ . '/capstone_backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Donation;
use App\Models\ActivityLog;
use App\Services\ActivityLogService;

echo "========================================\n";
echo "Regenerate Donation Activity Logs\n";
echo "========================================\n\n";

// Get all donations
$donations = Donation::with('donor')->orderBy('created_at')->get();

echo "Found " . $donations->count() . " total donations in database\n\n";

$regenerated = 0;
$skipped = 0;
$errors = 0;

foreach ($donations as $donation) {
    // Check if activity log already exists for this donation
    $existingLog = ActivityLog::where('action', 'donation_created')
        ->where('user_id', $donation->donor_id)
        ->whereJsonContains('details->donation_id', $donation->id)
        ->first();
    
    if ($existingLog) {
        $skipped++;
        echo ".";
        continue;
    }
    
    // Create activity log for this donation
    try {
        ActivityLogService::logDonationCreated(
            $donation->donor_id,
            $donation->id,
            $donation->amount,
            $donation->campaign_id
        );
        
        $regenerated++;
        echo "+";
    } catch (Exception $e) {
        $errors++;
        echo "X";
        \Log::error("Failed to regenerate log for donation #{$donation->id}: " . $e->getMessage());
    }
    
    // New line every 50 donations
    if (($regenerated + $skipped + $errors) % 50 == 0) {
        echo "\n";
    }
}

echo "\n\n";
echo "========================================\n";
echo "RESULTS\n";
echo "========================================\n";
echo "Total Donations: " . $donations->count() . "\n";
echo "Activity Logs Regenerated: $regenerated\n";
echo "Skipped (already had logs): $skipped\n";
echo "Errors: $errors\n";
echo "========================================\n\n";

if ($regenerated > 0) {
    echo "✓ Successfully regenerated $regenerated activity logs!\n";
    echo "\nNow each donation has its own individual activity log entry.\n";
    echo "Check the admin dashboard Action Logs page to verify.\n\n";
}

if ($errors > 0) {
    echo "⚠ Warning: $errors donations failed to generate logs.\n";
    echo "Check the Laravel log file for details.\n\n";
}

// Show sample of regenerated logs
if ($regenerated > 0) {
    echo "========================================\n";
    echo "SAMPLE OF REGENERATED LOGS\n";
    echo "========================================\n";
    
    $sampleLogs = ActivityLog::where('action', 'donation_created')
        ->whereDate('created_at', today())
        ->with('user')
        ->orderBy('created_at', 'desc')
        ->limit(10)
        ->get();
    
    foreach ($sampleLogs as $log) {
        $amount = $log->details['amount'] ?? 'N/A';
        $userName = $log->user->name ?? 'Unknown';
        echo "- {$userName}: ₱" . number_format($amount, 2) . "\n";
    }
    
    echo "\n";
}

echo "Done!\n";
