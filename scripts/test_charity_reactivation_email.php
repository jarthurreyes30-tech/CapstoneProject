<?php
/**
 * Test script to verify charity reactivation email sending works
 * Run: php scripts/test_charity_reactivation_email.php
 */

require __DIR__ . '/../capstone_backend/vendor/autoload.php';

$app = require_once __DIR__ . '/../capstone_backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Charity;
use Illuminate\Support\Facades\Mail;

echo "=== Testing Charity Reactivation Email Sending ===\n\n";

// Find a charity with an owner for testing
$charity = Charity::with('owner')->whereHas('owner')->first();

if (!$charity) {
    echo "ERROR: No charity found with an owner to test.\n";
    exit(1);
}

echo "Found charity: {$charity->name}\n";
echo "Owner: {$charity->owner->name} ({$charity->owner->email})\n\n";

// Test sending charity reactivation email
echo "--- Test: Sending Charity Reactivation Email ---\n";
try {
    $fromAddress = config('mail.from.address');
    $fromName = config('mail.from.name');
    
    Mail::send('emails.system-alert', [
        'user_name' => $charity->owner->name,
        'alert_message' => "Your charity '{$charity->name}' has been reactivated.",
        'type' => 'success'
    ], function($mail) use ($charity, $fromAddress, $fromName) {
        if ($fromAddress) {
            $mail->from($fromAddress, $fromName ?: config('app.name'));
        }
        $mail->to($charity->owner->email)
                ->subject('Charity Reactivated - ' . $charity->name);
    });
    
    echo "✓ Reactivation email sent successfully to {$charity->owner->email}\n";
    echo "  Subject: 'Charity Reactivated - {$charity->name}'\n";
    echo "  Message: 'Your charity '{$charity->name}' has been reactivated.'\n\n";
} catch (\Exception $e) {
    echo "✗ Failed to send reactivation email: " . $e->getMessage() . "\n\n";
    exit(1);
}

// Test sending rejection email
echo "--- Test: Sending Charity Reactivation Rejection Email ---\n";
try {
    $notes = "Test rejection reason: Additional documentation required.";
    
    Mail::send('emails.system-alert', [
        'user_name' => $charity->owner->name,
        'alert_message' => "Your charity '{$charity->name}' reactivation request was rejected. Notes: {$notes}",
        'type' => 'warning'
    ], function($mail) use ($charity) {
        $mail->to($charity->owner->email)
                ->subject('Charity Reactivation Rejected - ' . $charity->name);
    });
    
    echo "✓ Rejection email sent successfully to {$charity->owner->email}\n";
    echo "  Subject: 'Charity Reactivation Rejected - {$charity->name}'\n\n";
} catch (\Exception $e) {
    echo "✗ Failed to send rejection email: " . $e->getMessage() . "\n\n";
    exit(1);
}

echo "\n=== Test Complete ===\n";
echo "All charity reactivation emails sent successfully!\n";
echo "Check the email inbox for {$charity->owner->email}\n";
echo "\nYou should see 2 emails:\n";
echo "  1. Charity reactivation (success)\n";
echo "  2. Charity reactivation rejection (warning)\n";
