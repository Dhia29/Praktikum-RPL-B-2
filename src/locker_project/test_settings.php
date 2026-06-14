<?php
$payload = [
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
    'theme' => 'light',
    'language' => 'en'
];
$ch = curl_init('http://127.0.0.1:8000/api/user/settings');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
$response = curl_exec($ch);
echo "Response: " . $response . "\n";
echo "HTTP Code: " . curl_getinfo($ch, CURLINFO_HTTP_CODE) . "\n";
