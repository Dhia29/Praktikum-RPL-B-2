<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$validator = Validator::make([
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
    'language' => 'en'
], [
    'notify_application_status' => 'sometimes|boolean',
    'notify_messages' => 'sometimes|boolean',
    'notify_community' => 'sometimes|boolean',
    'notify_connections' => 'sometimes|boolean',
    'visibility_email' => 'sometimes|in:public,connections,none',
    'visibility_phone' => 'sometimes|in:public,connections,none',
    'visibility_location' => 'sometimes|in:public,connections,none',
    'visibility_education' => 'sometimes|in:public,connections,none',
    'visibility_experience' => 'sometimes|in:public,connections,none',
    'visibility_social_links' => 'sometimes|in:public,connections,none',
    'theme' => 'sometimes|in:light,dark',
    'language' => 'sometimes|string|in:id,en',
]);

if ($validator->fails()) {
    echo "Validation failed:\n";
    print_r($validator->errors()->toArray());
} else {
    echo "Validation passed.\n";
    print_r($validator->validated());
}
