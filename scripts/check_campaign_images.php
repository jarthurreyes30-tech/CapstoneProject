<?php
require __DIR__ . '/../capstone_backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../capstone_backend/bootstrap/app.php';
$app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap();

use App\Models\Campaign;

echo "=== Checking Campaign Images ===\n\n";

$campaigns = Campaign::orderBy('id','desc')->take(10)->get();

$basePath = realpath(__DIR__ . '/../capstone_backend');
$storageAppPublic = $basePath . '/storage/app/public';
$publicStorage = $basePath . '/public/storage';

printf("Base: %s\n", $basePath);
printf("storage/app/public: %s\n", $storageAppPublic);
printf("public/storage: %s\n\n", $publicStorage);

foreach ($campaigns as $c) {
    $path = $c->cover_image_path;
    echo "Campaign #{$c->id}: {$c->title}\n";
    echo " cover_image_path: " . ($path ?? 'NULL') . "\n";
    if ($path) {
        $clean = ltrim($path, '/');
        $path1 = $storageAppPublic . '/' . $clean; // actual stored file
        $path2 = $publicStorage . '/' . $clean;   // via symlink
        echo " storage/app/public exists: " . (file_exists($path1) ? 'YES' : 'NO') . "\n";
        echo " public/storage exists: " . (file_exists($path2) ? 'YES' : 'NO') . "\n";
        $baseUrl = getenv('APP_URL') ?: 'http://localhost:8000';
        $url = rtrim($baseUrl,'/') . '/storage/' . $clean;
        echo " expected URL: $url\n";
    }
    echo "\n";
}
