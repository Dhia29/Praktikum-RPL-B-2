<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$user = \App\Models\User::first();
Auth::login($user);

$request = Illuminate\Http\Request::create('/api/user/settings', 'POST', [], [], [], [
    'CONTENT_TYPE' => 'application/json',
    'HTTP_ACCEPT' => 'application/json'
], json_encode([
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
]));

$response = $kernel->handle($request);
echo "Status: " . $response->getStatusCode() . "\n";
echo "Content: " . $response->getContent() . "\n";
