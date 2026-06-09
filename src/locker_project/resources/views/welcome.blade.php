<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>LockER | Perjalanan Karir Dimulai dari Sekarang!</title>
        <link rel="icon" type="image/svg+xml" href="{{ asset('favicon.svg') }}">
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    </head>
    <body class="antialiased bg-gray-100 dark:bg-gray-900">
        <div id="app">
            </div>
        </div>
    </body>
</html>
