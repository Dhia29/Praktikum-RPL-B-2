<!DOCTYPE html>
<html lang="id" class="h-full bg-gray-50">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Admin Dashboard - LockER</title>
    <link rel="icon" type="image/svg+xml" href="{{ asset('favicon.svg') }}">
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/admin/main-admin.jsx'])
</head>
<body class="h-full font-sans antialiased bg-gray-50">
    <div id="admin-app"></div>
</body>
</html>
