<?php
/**
 * Test script to verify charity verification email sending works
 * Run: php scripts/test_charity_verification_email.php
 */

require __DIR__ . '/../capstone_backend/vendor/autoload.php';

$app = require_once __DIR__ . '/../capstone_backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Charity;
use App\Services\NotificationService;

echo "=== Testing Charity Verification Email Sending ===\n\n";

// Find a charity with an owner (charity admin) for testing
$charity = Charity::with('owner')->whereHas('owner')->first();

if (!$charity) {
    echo "ERROR: No charity found with an owner to test.\n";
    exit(1);
}

echo "Found charity: {$charity->name}\n";
echo "Owner: {$charity->owner->name} ({$charity->owner->email})\n";
echo "Current verification status: {$charity->verification_status}\n\n";

// Create notification service instance
$notificationService = new NotificationService();

echo "--- Test 1: Sending APPROVED verification email ---\n";
try {
    $charity->rejection_reason = null; // Clear any rejection reason
    $notificationService->sendVerificationStatus($charity, 'approved');
    echo "✓ Approval email sent successfully to {$charity->owner->email}\n";
    echo "  Check the email inbox for: 'Charity Approved - {$charity->name}'\n\n";
} catch (\Exception $e) {
    echo "✗ Failed to send approval email: " . $e->getMessage() . "\n\n";
}

echo "--- Test 2: Sending REJECTED verification email ---\n";
try {
    $charity->rejection_reason = "Test rejection: Missing required documents for testing purposes.";
    $notificationService->sendVerificationStatus($charity, 'rejected');
    echo "✓ Rejection email sent successfully to {$charity->owner->email}\n";
    echo "  Check the email inbox for: 'Charity Rejected - {$charity->name}'\n\n";
} catch (\Exception $e) {
    echo "✗ Failed to send rejection email: " . $e->getMessage() . "\n\n";
}

echo "\n=== Test Complete ===\n";
echo "Please check the email inbox for {$charity->owner->email}\n";
echo "You should see 2 emails:\n";
echo "  1. Charity approval notification\n";
echo "  2. Charity rejection notification\n";
echo "\nNote: This is just a test. The charity's actual verification status was not changed.\n";
