<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $user = \App\Models\User::first();
    if (!$user) { echo "No user found\n"; exit; }
    
    DB::table('user_settings')->updateOrInsert(
        ['user_id' => $user->id],
        [
            'notify_application_status' => '1',
            'notify_messages' => '1',
            'notify_community' => '1',
            'notify_connections' => '1',
            'visibility_email' => 'none',
            'visibility_phone' => 'none',
            'visibility_location' => 'public',
            'visibility_education' => 'public',
            'visibility_experience' => 'public',
            'visibility_social_links' => 'connections',
            'theme' => 'dark',
            'language' => 'en',
            'updated_at' => now()
        ]
    );
    echo "DB Insert passed.\n";
} catch (\Exception $e) {
    echo "DB Error: " . $e->getMessage() . "\n";
}
